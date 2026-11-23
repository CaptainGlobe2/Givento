import { AdminOrder } from './database';
import { Expense } from '../types';

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates CSV content for Orders
 */
export function generateOrdersCsv(orders: AdminOrder[]): string {
  const headers = [
    'Order ID',
    'Date',
    'Channel',
    'Customer Name',
    'Phone',
    'City',
    'State',
    'Pincode',
    'Address',
    'Status',
    'Payment Method',
    'Payment Status',
    'Items Count',
    'Items Summary',
    'Subtotal (INR)',
    'Delivery Fee (INR)',
    'Total Amount (INR)',
    'Tracking Number',
    'Courier',
  ];

  const rows = orders.map((o) => {
    const itemsSummary = (o.items || [])
      .map((it) => `${it.productName} (x${it.quantity} @ ₹${it.price})`)
      .join('; ');
    const itemsCount = (o.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);

    return [
      escapeCsvCell(o.id),
      escapeCsvCell(o.createdAt ? o.createdAt.split('T')[0] : ''),
      escapeCsvCell(o.channel || 'website'),
      escapeCsvCell(o.customerName),
      escapeCsvCell(o.customerPhone),
      escapeCsvCell(o.city),
      escapeCsvCell(o.state),
      escapeCsvCell(o.pincode),
      escapeCsvCell(o.address),
      escapeCsvCell(o.status),
      escapeCsvCell(o.paymentMethod),
      escapeCsvCell(o.paymentStatus),
      escapeCsvCell(itemsCount),
      escapeCsvCell(itemsSummary),
      escapeCsvCell(o.subtotal || o.total),
      escapeCsvCell(o.deliveryFee || 0),
      escapeCsvCell(o.total),
      escapeCsvCell(o.trackingNumber || ''),
      escapeCsvCell(o.trackingCourier || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates CSV content for Studio Expenses
 */
export function generateExpensesCsv(expenses: Expense[]): string {
  const headers = [
    'Expense ID',
    'Expense Date',
    'Category',
    'Title / Description',
    'Amount (INR)',
    'Notes',
    'Created At',
  ];

  const rows = expenses.map((e) => {
    return [
      escapeCsvCell(e.id),
      escapeCsvCell(e.expenseDate),
      escapeCsvCell(e.category),
      escapeCsvCell(e.title),
      escapeCsvCell(e.amount),
      escapeCsvCell(e.notes || ''),
      escapeCsvCell(e.createdAt || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates CSV content for Comprehensive Profit Summary
 */
export function generateProfitSummaryCsv(summary: any): string {
  const lines: string[] = [];

  lines.push('--- GIVENTO.IN STUDIO FINANCIAL & PROFIT SUMMARY ---');
  lines.push(`Generated On,${escapeCsvCell(new Date().toLocaleString())}`);
  lines.push('');
  lines.push('KEY FINANCIAL METRICS,AMOUNT (INR)');
  lines.push(`Gross Revenue (Sales),${escapeCsvCell(summary.grossRevenue || 0)}`);
  lines.push(`Cost of Goods Sold (COGS - Materials & Packaging),${escapeCsvCell(summary.cogs || 0)}`);
  lines.push(`Gross Artisan Profit,${escapeCsvCell(summary.grossProfit || 0)}`);
  lines.push(`Gross Profit Margin (%),${escapeCsvCell((summary.grossMarginPercentage ?? 0) + '%')}`);
  lines.push(`Operating Overhead Expenses (Marketing Tools Expo Misc),${escapeCsvCell(summary.operatingExpenses || 0)}`);
  lines.push(`Total Expenses (COGS + Overheads),${escapeCsvCell(summary.totalExpenses || 0)}`);
  lines.push(`Net Artisan Profit,${escapeCsvCell(summary.netProfit || 0)}`);
  lines.push(`Net Profit Margin (%),${escapeCsvCell((summary.profitMarginPercentage ?? summary.profitMargin ?? 0) + '%')}`);
  lines.push(`Average Order Value (AOV),${escapeCsvCell(summary.averageOrderValue || 0)}`);
  lines.push(`Total Fulfilled Orders,${escapeCsvCell(summary.totalOrders || 0)}`);
  lines.push('');

  lines.push('SALES PERFORMANCE BY CHANNEL');
  lines.push('Channel,Order Count,Gross Revenue (INR),Revenue Share (%)');
  if (summary.revenueByChannel) {
    Object.entries(summary.revenueByChannel).forEach(([ch, val]: [string, any]) => {
      const rev = typeof val === 'object' ? val.revenue : val;
      const count = typeof val === 'object' ? val.orderCount : '';
      const pct = typeof val === 'object' ? val.percentage : (summary.grossRevenue > 0 ? Math.round((rev / summary.grossRevenue) * 100) : 0);
      lines.push(`${escapeCsvCell(ch.toUpperCase())},${escapeCsvCell(count)},${escapeCsvCell(rev)},${escapeCsvCell(pct + '%')}`);
    });
  }
  lines.push('');

  lines.push('EXPENSES BREAKDOWN BY CATEGORY');
  lines.push('Category,Total Spent (INR)');
  if (summary.expensesByCategory) {
    Object.entries(summary.expensesByCategory).forEach(([cat, amt]) => {
      lines.push(`${escapeCsvCell(cat)},${escapeCsvCell(amt)}`);
    });
  }
  lines.push('');

  if (summary.perOrderProfits && summary.perOrderProfits.length > 0) {
    lines.push('PER-ORDER PROFITABILITY LEDGER');
    lines.push('Order ID,Date,Customer Name,Channel,Sale Price (INR),Delivery Fee (INR),Materials Cost (INR),Packing Cost (INR),Shipping Cost (INR),Commission (INR),Net Order Profit (INR),Margin (%)');
    summary.perOrderProfits.forEach((po: any) => {
      lines.push([
        escapeCsvCell(po.orderId),
        escapeCsvCell(po.date),
        escapeCsvCell(po.customerName),
        escapeCsvCell(po.channel),
        escapeCsvCell(po.salePrice),
        escapeCsvCell(po.deliveryFee),
        escapeCsvCell(po.materialsCost),
        escapeCsvCell(po.packingCost),
        escapeCsvCell(po.shippingCost),
        escapeCsvCell(po.commission),
        escapeCsvCell(po.grossProfit ?? po.orderProfit),
        escapeCsvCell((po.grossMarginPercentage ?? po.marginPercentage ?? 0) + '%'),
      ].join(','));
    });
  }

  return lines.join('\r\n');
}

/**
 * Triggers a file download in the browser
 */
export function triggerCsvDownload(filename: string, csvContent: string): void {
  if (typeof window === 'undefined') return;
  // Prepend BOM for Excel compatibility with UTF-8 characters
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
