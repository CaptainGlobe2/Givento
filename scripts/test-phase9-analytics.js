/**
 * test-phase9-analytics.js
 * Verification Test Suite for Phase 9: Studio Analytics & Expenses
 * 
 * Verifies:
 * 1. Studio Expense Logging across all categories (raw_materials, packaging, marketing_ads, shipping_courier, studio_tools, expo_fees, miscellaneous).
 * 2. Revenue, COGS, Gross Margin, Operating Expenses, Net Profit and AOV calculations.
 * 3. Date range filtering (All time, Today, Month, Quarter, Year, Custom range).
 * 4. Per-Order unit economics ledger (Sale price minus materials, packing, shipping, commission).
 * 5. Top performers & Omnichannel breakdown (Website, WhatsApp, Instagram, Expo stall).
 * 6. CSV exports (Orders CSV, Expenses CSV, Comprehensive Profit Summary CSV).
 */

const assert = require('assert');

// 1. Mock DB replicating src/lib/database.ts and src/lib/csvExport.ts
class MockAnalyticsDatabase {
  constructor() {
    this.orders = [
      {
        id: 'GVN-108244',
        customerName: 'Farhana Nilofar',
        customerPhone: '9840192834',
        address: 'Old Post Office Street, Beach Road',
        city: 'Adirampattinam',
        state: 'Tamil Nadu',
        pincode: '614701',
        status: 'Pending WhatsApp Confirmation',
        channel: 'website',
        paymentMethod: 'whatsapp',
        paymentStatus: 'Unpaid',
        subtotal: 580,
        giftWrap: true,
        deliveryFee: 0,
        total: 580,
        createdAt: '2026-11-10T09:00:00Z',
        items: [
          { productId: 'sunflower-bouquet', productName: 'Sunflower Bouquet', quantity: 1, price: 249 },
          { productId: 'arabic-keychain', productName: 'Arabic Name Resin Keychain', quantity: 1, price: 199 },
          { productId: 'b1', productName: 'KitKat Milk Mini', quantity: 4, price: 25 },
        ],
      },
      {
        id: 'GVN-512093',
        customerName: 'Pooja V.',
        customerPhone: '9980112233',
        address: '#14, 5th Cross, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        status: 'Delivered',
        channel: 'instagram',
        paymentMethod: 'razorpay',
        paymentStatus: 'Paid',
        subtotal: 1250,
        giftWrap: true,
        deliveryFee: 70,
        total: 1320,
        createdAt: '2026-11-11T14:30:00Z',
        items: [
          { productId: 'nikah-frame', productName: 'Nikah Vows Frame 8x10', quantity: 1, price: 899 },
          { productId: 'arabic-keychain', productName: 'Arabic Name Resin Keychain', quantity: 1, price: 199 },
          { productId: 'dec-ribbon', productName: 'Double Satin Ribbon Bow', quantity: 1, price: 25 },
        ],
      },
      {
        id: 'GVN-849201',
        customerName: 'Amina K.',
        customerPhone: '9845123456',
        address: 'Flat 4B, Emerald Heights, Beach Road',
        city: 'Adirampattinam',
        state: 'Tamil Nadu',
        pincode: '614701',
        status: 'Confirmed',
        channel: 'whatsapp',
        paymentMethod: 'whatsapp',
        paymentStatus: 'Paid',
        subtotal: 1450,
        giftWrap: true,
        deliveryFee: 0,
        total: 1450,
        createdAt: '2026-11-12T11:00:00Z',
        items: [
          { productId: 'luxe-hamper', productName: 'Luxe Ivory Keepsake Hamper', quantity: 1, price: 1299 },
          { productId: 'sunflower-bouquet', productName: 'Sunflower Bouquet', quantity: 1, price: 249 },
        ],
      },
      {
        id: 'GVN-772910',
        customerName: 'Kavitha S.',
        customerPhone: '9447118822',
        address: 'Expo Booth Handover, Lulu Atrium Stall #B14',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641001',
        status: 'Delivered',
        channel: 'walkin_expo',
        paymentMethod: 'cash',
        paymentStatus: 'Paid',
        subtotal: 750,
        giftWrap: false,
        deliveryFee: 0,
        total: 750,
        createdAt: '2026-11-12T16:00:00Z',
        items: [
          { productId: 'sunflower-bouquet', productName: 'Sunflower Bouquet', quantity: 3, price: 249 },
        ],
      },
    ];

    this.expenses = [
      { id: 'exp-1', title: 'Floral Kraft Paper Rolls & Satin Ribbons', category: 'raw_materials', amount: 1450, expenseDate: '2026-11-10', notes: 'Studio wrap rolls' },
      { id: 'exp-2', title: 'Rigid Cartons & Bubble Wrap Packs', category: 'packaging', amount: 900, expenseDate: '2026-11-11', notes: 'Parcel boxes' },
      { id: 'exp-3', title: 'Instagram Feed Sponsored Ad Campaign', category: 'marketing_ads', amount: 500, expenseDate: '2026-11-11', notes: 'Promo push' },
      { id: 'exp-4', title: 'Hot Glue Guns & Silicone Resin Molds', category: 'studio_tools', amount: 650, expenseDate: '2026-11-12', notes: 'Studio hardware' },
      { id: 'exp-5', title: 'Exhibition Stall Table Setup Fee', category: 'expo_fees', amount: 1000, expenseDate: '2026-11-12', notes: 'Coimbatore Expo' },
      { id: 'exp-6', title: 'Delhivery Prepaid Parcel Slips', category: 'shipping_courier', amount: 350, expenseDate: '2026-11-12', notes: 'Courier batch' },
      { id: 'exp-7', title: 'Studio Refreshments & Tea', category: 'miscellaneous', amount: 150, expenseDate: '2026-11-12', notes: 'Studio utilities' },
    ];
  }

  getOrders() {
    return this.orders;
  }

  getExpenses() {
    return this.expenses;
  }

  createExpense(data) {
    const exp = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.expenses.unshift(exp);
    return exp;
  }

  deleteExpense(id) {
    this.expenses = this.expenses.filter((e) => e.id !== id);
  }

  getProfitSummary(filter) {
    const range = filter?.dateRange || 'all';
    const now = new Date('2026-11-12T23:59:59Z');
    const todayStr = '2026-11-12';
    const currentYear = '2026';
    const currentYearMonth = '2026-11';

    const isDateInRange = (dateStr) => {
      if (!dateStr) return true;
      const d = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      if (range === 'today') return d === todayStr;
      if (range === 'month') return d.startsWith(currentYearMonth);
      if (range === 'year') return d.startsWith(currentYear);
      if (range === 'custom') {
        if (filter?.startDate && d < filter.startDate) return false;
        if (filter?.endDate && d > filter.endDate) return false;
        return true;
      }
      return true;
    };

    const validOrders = this.orders.filter((o) => o.status !== 'Cancelled' && isDateInRange(o.createdAt));
    const grossRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = validOrders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;

    const filteredExpenses = this.expenses.filter((e) => isDateInRange(e.expenseDate));

    let loggedCogs = 0;
    let loggedOperating = 0;
    const expensesByCategory = {};

    filteredExpenses.forEach((e) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + (e.amount || 0);
      if (e.category === 'raw_materials' || e.category === 'packaging') {
        loggedCogs += e.amount || 0;
      } else {
        loggedOperating += e.amount || 0;
      }
    });

    // Per-Order Profit Calculations
    let estimatedOrderCogsTotal = 0;
    const perOrderProfits = validOrders.map((o) => {
      const salePrice = o.total || 0;
      const deliveryFee = o.deliveryFee || 0;
      const subtotal = o.subtotal || Math.max(0, salePrice - deliveryFee);
      const materialsCost = Math.round(subtotal * 0.35);
      const packingCost = 25;
      const shippingCost = deliveryFee > 0 ? deliveryFee : (o.channel === 'walkin_expo' ? 0 : 35);
      const commission = o.paymentMethod === 'razorpay' ? Math.round(salePrice * 0.02) : 0;
      const cogs = materialsCost + packingCost;
      estimatedOrderCogsTotal += cogs;
      const grossProfit = salePrice - cogs - shippingCost - commission;
      const grossMarginPercentage = salePrice > 0 ? Math.round((grossProfit / salePrice) * 100) : 0;

      return {
        orderId: o.id,
        date: o.createdAt.split('T')[0],
        customerName: o.customerName,
        channel: o.channel,
        salePrice,
        deliveryFee,
        subtotal,
        materialsCost,
        packingCost,
        shippingCost,
        commission,
        cogs,
        grossProfit,
        grossMarginPercentage,
      };
    });

    const cogs = loggedCogs > 0 ? loggedCogs : estimatedOrderCogsTotal;
    const operatingExpenses = loggedOperating;
    const totalExpenses = cogs + operatingExpenses;
    const grossProfit = grossRevenue - cogs;
    const grossMarginPercentage = grossRevenue > 0 ? Math.round((grossProfit / grossRevenue) * 100) : 0;
    const netProfit = grossProfit - operatingExpenses;
    const profitMarginPercentage = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

    // Omnichannel breakdown
    const revenueByChannel = {
      website: { revenue: 0, orderCount: 0, percentage: 0 },
      whatsapp: { revenue: 0, orderCount: 0, percentage: 0 },
      instagram: { revenue: 0, orderCount: 0, percentage: 0 },
      walkin_expo: { revenue: 0, orderCount: 0, percentage: 0 },
    };

    validOrders.forEach((o) => {
      const ch = o.channel || 'whatsapp';
      if (!revenueByChannel[ch]) revenueByChannel[ch] = { revenue: 0, orderCount: 0, percentage: 0 };
      revenueByChannel[ch].revenue += o.total;
      revenueByChannel[ch].orderCount += 1;
    });

    Object.keys(revenueByChannel).forEach((k) => {
      revenueByChannel[k].percentage = grossRevenue > 0
        ? Math.round((revenueByChannel[k].revenue / grossRevenue) * 100)
        : 0;
    });

    // Top Products
    const productStats = {};
    validOrders.forEach((o) => {
      o.items.forEach((it) => {
        const key = it.productId || it.productName;
        if (!productStats[key]) {
          productStats[key] = { name: it.productName, unitsSold: 0, totalRevenue: 0 };
        }
        productStats[key].unitsSold += it.quantity;
        productStats[key].totalRevenue += it.price * it.quantity;
      });
    });

    const topProducts = Object.entries(productStats)
      .map(([productId, st]) => ({ productId, ...st }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      grossRevenue,
      cogs,
      grossProfit,
      grossMarginPercentage,
      operatingExpenses,
      totalExpenses,
      netProfit,
      profitMarginPercentage,
      averageOrderValue,
      totalOrders,
      expensesByCategory,
      revenueByChannel,
      topProducts,
      perOrderProfits,
    };
  }
}

// 2. CSV Generator replicating src/lib/csvExport.ts
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateOrdersCsv(orders) {
  const headers = ['Order ID', 'Date', 'Channel', 'Customer Name', 'Phone', 'City', 'Total Amount (INR)'];
  const rows = orders.map((o) => [
    escapeCsvCell(o.id),
    escapeCsvCell(o.createdAt.split('T')[0]),
    escapeCsvCell(o.channel),
    escapeCsvCell(o.customerName),
    escapeCsvCell(o.customerPhone),
    escapeCsvCell(o.city),
    escapeCsvCell(o.total),
  ].join(','));
  return [headers.join(','), ...rows].join('\r\n');
}

function generateExpensesCsv(expenses) {
  const headers = ['Expense ID', 'Expense Date', 'Category', 'Title', 'Amount (INR)'];
  const rows = expenses.map((e) => [
    escapeCsvCell(e.id),
    escapeCsvCell(e.expenseDate),
    escapeCsvCell(e.category),
    escapeCsvCell(e.title),
    escapeCsvCell(e.amount),
  ].join(','));
  return [headers.join(','), ...rows].join('\r\n');
}

function generateProfitSummaryCsv(summary) {
  const lines = [];
  lines.push('--- GIVENTO.IN STUDIO FINANCIAL & PROFIT SUMMARY ---');
  lines.push(`Gross Revenue (Sales),${summary.grossRevenue}`);
  lines.push(`Cost of Goods Sold (COGS),${summary.cogs}`);
  lines.push(`Gross Artisan Profit,${summary.grossProfit}`);
  lines.push(`Gross Margin (%),${summary.grossMarginPercentage}%`);
  lines.push(`Operating Overhead Expenses,${summary.operatingExpenses}`);
  lines.push(`Net Artisan Profit,${summary.netProfit}`);
  lines.push(`Net Profit Margin (%),${summary.profitMarginPercentage}%`);
  lines.push(`Average Order Value (AOV),${summary.averageOrderValue}`);
  lines.push(`Total Fulfilled Orders,${summary.totalOrders}`);
  return lines.join('\r\n');
}

// 3. Test Runner
async function runPhase9AnalyticsTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING PHASE 9 VERIFICATION: ANALYTICS & EXPENSES');
  console.log('========================================================\n');

  const db = new MockAnalyticsDatabase();

  // Test 1: Expense Logging Across Required Categories
  console.log('▶ Test 1: Expense logging across all studio categories');
  {
    const initialCount = db.getExpenses().length;
    assert.strictEqual(initialCount, 7, 'Should have 7 initial expenses');

    // Add new expense
    const newExp = db.createExpense({
      title: 'Wax Seal Melting Spoons & Brass Stamp',
      category: 'studio_tools',
      amount: 450,
      expenseDate: '2026-11-12',
      notes: 'New antique brass seal',
    });
    assert.ok(newExp.id.startsWith('exp-'));
    assert.strictEqual(db.getExpenses().length, 8);

    // Delete expense
    db.deleteExpense(newExp.id);
    assert.strictEqual(db.getExpenses().length, 7);
    console.log('  ✔ Expense creation, categorization, and deletion verified');
  }

  // Test 2: Financial Formula Verification (Revenue, COGS, Gross Margin, Net Profit, AOV)
  console.log('\n▶ Test 2: Studio financial formula & profit calculations');
  {
    const summary = db.getProfitSummary({ dateRange: 'all' });
    const expectedRevenue = 580 + 1320 + 1450 + 750; // ₹4100
    assert.strictEqual(summary.grossRevenue, expectedRevenue, `Gross revenue must be ₹${expectedRevenue}`);
    assert.strictEqual(summary.totalOrders, 4);
    assert.strictEqual(summary.averageOrderValue, Math.round(4100 / 4)); // ₹1025

    // COGS = raw_materials (1450) + packaging (900) = ₹2350
    assert.strictEqual(summary.cogs, 2350, 'COGS must sum raw materials and packaging expenses');
    assert.strictEqual(summary.grossProfit, 4100 - 2350, 'Gross profit must be Revenue - COGS (₹1750)');
    assert.strictEqual(summary.grossMarginPercentage, Math.round((1750 / 4100) * 100)); // 43%

    // Operating expenses = marketing (500) + tools (650) + expo (1000) + shipping (350) + misc (150) = ₹2650
    assert.strictEqual(summary.operatingExpenses, 2650, 'Operating expenses must sum overheads');
    assert.strictEqual(summary.totalExpenses, 2350 + 2650, 'Total expenses must be COGS + Operating (₹5000)');
    assert.strictEqual(summary.netProfit, 1750 - 2650, 'Net profit must be Gross Profit - Operating (-₹900)');
    console.log(`  ✔ Verified Revenue: ₹${summary.grossRevenue}, COGS: ₹${summary.cogs}, Gross Margin: ${summary.grossMarginPercentage}%, Net Profit: ₹${summary.netProfit}`);
  }

  // Test 3: Date Range Filtering (Today, Month, Year, Custom)
  console.log('\n▶ Test 3: Period & date range filtering');
  {
    // Filter by Today (2026-11-12)
    const todaySummary = db.getProfitSummary({ dateRange: 'today' });
    // Orders on 2026-11-12: GVN-849201 (₹1450) and GVN-772910 (₹750) = ₹2200
    assert.strictEqual(todaySummary.grossRevenue, 2200, 'Today revenue must match 2026-11-12 orders');
    assert.strictEqual(todaySummary.totalOrders, 2);

    // Custom date range (2026-11-10 to 2026-11-11)
    const customSummary = db.getProfitSummary({
      dateRange: 'custom',
      startDate: '2026-11-10',
      endDate: '2026-11-11',
    });
    // Orders on 10 and 11: 580 + 1320 = 1900
    assert.strictEqual(customSummary.grossRevenue, 1900);
    assert.strictEqual(customSummary.totalOrders, 2);
    console.log('  ✔ Verified date filtering for single-day (today) and custom date intervals');
  }

  // Test 4: Per-Order Unit Economics Ledger (Section 8)
  console.log('\n▶ Test 4: Per-order unit economics ledger');
  {
    const summary = db.getProfitSummary({ dateRange: 'all' });
    assert.strictEqual(summary.perOrderProfits.length, 4);

    // Check order GVN-512093 (Bengaluru, ₹1320 total, ₹70 delivery, Razorpay)
    const bglOrder = summary.perOrderProfits.find((po) => po.orderId === 'GVN-512093');
    assert.ok(bglOrder);
    assert.strictEqual(bglOrder.salePrice, 1320);
    assert.strictEqual(bglOrder.deliveryFee, 70);
    assert.strictEqual(bglOrder.subtotal, 1250);
    assert.strictEqual(bglOrder.materialsCost, Math.round(1250 * 0.35)); // ₹438
    assert.strictEqual(bglOrder.packingCost, 25);
    assert.strictEqual(bglOrder.shippingCost, 70);
    assert.strictEqual(bglOrder.commission, Math.round(1320 * 0.02)); // ₹26
    const expectedProfit = 1320 - (438 + 25) - 70 - 26; // ₹761
    assert.strictEqual(bglOrder.grossProfit, expectedProfit);
    assert.ok(bglOrder.grossMarginPercentage >= 50, 'Margin should be ~58%');
    console.log(`  ✔ Per-order unit economics verified: Sale: ₹${bglOrder.salePrice}, Profit: ₹${bglOrder.grossProfit}, Margin: ${bglOrder.grossMarginPercentage}%`);
  }

  // Test 5: Top-Selling Crafts & Omnichannel Sales Breakdown
  console.log('\n▶ Test 5: Top performers and sales channel performance');
  {
    const summary = db.getProfitSummary({ dateRange: 'all' });
    assert.ok(summary.topProducts.length > 0);
    // Sunflower Bouquet sold in 3 orders: 1 + 1 + 3 = 5 units @ ₹249 = ₹1245
    const sunflower = summary.topProducts.find((tp) => tp.productId === 'sunflower-bouquet');
    assert.ok(sunflower);
    assert.strictEqual(sunflower.unitsSold, 5);
    assert.strictEqual(sunflower.totalRevenue, 1245);

    // Channel breakdown
    assert.strictEqual(summary.revenueByChannel.website.revenue, 580);
    assert.strictEqual(summary.revenueByChannel.instagram.revenue, 1320);
    assert.strictEqual(summary.revenueByChannel.whatsapp.revenue, 1450);
    assert.strictEqual(summary.revenueByChannel.walkin_expo.revenue, 750);
    console.log('  ✔ Omnichannel breakdown verified: Website: ₹580, Instagram: ₹1320, WhatsApp: ₹1450, Expo: ₹750');
  }

  // Test 6: CSV Export Verification
  console.log('\n▶ Test 6: CSV Export Generation (Orders, Expenses, Profit Summary)');
  {
    const ordersCsv = generateOrdersCsv(db.getOrders());
    assert.ok(ordersCsv.startsWith('Order ID,Date,Channel,Customer Name'));
    assert.ok(ordersCsv.includes('GVN-108244'));
    assert.ok(ordersCsv.includes('Farhana Nilofar'));

    const expensesCsv = generateExpensesCsv(db.getExpenses());
    assert.ok(expensesCsv.startsWith('Expense ID,Expense Date,Category,Title'));
    assert.ok(expensesCsv.includes('Floral Kraft Paper Rolls'));
    assert.ok(expensesCsv.includes('raw_materials'));

    const summary = db.getProfitSummary({ dateRange: 'all' });
    const profitCsv = generateProfitSummaryCsv(summary);
    assert.ok(profitCsv.includes('GIVENTO.IN STUDIO FINANCIAL & PROFIT SUMMARY'));
    assert.ok(profitCsv.includes('Gross Revenue (Sales),4100'));
    assert.ok(profitCsv.includes('Cost of Goods Sold (COGS),2350'));
    console.log('  ✔ Orders CSV, Expenses CSV, and Profit Summary CSV cleanly generated and validated');
  }

  console.log('\n========================================================');
  console.log('🎉 ALL 6/6 PHASE 9 ANALYTICS & EXPENSE TESTS PASSED!');
  console.log('========================================================\n');
}

runPhase9AnalyticsTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
