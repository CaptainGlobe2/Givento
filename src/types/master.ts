// ==============================================================================
// GIVENTO.IN - MASTER TYPES (PHASE 1)
// Centralized schema definitions for orders, inventory, customizers, shipping & AI
// ==============================================================================

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface BouquetSize {
  id: string;
  name: string;
  maxPieces: number;
  baseCharge: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Decoration {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
}

export interface CustomizationType {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CustomizationOption {
  id: string;
  typeId: string;
  groupName: string;
  name: string;
  priceModifier: number;
  stock: number;
  isActive: boolean;
}

export interface InventoryTransaction {
  id: string;
  itemType: 'product' | 'wrapping_sheet' | 'decoration';
  itemId: string;
  itemName: string;
  changeQuantity: number;
  reason: 'stock_in' | 'stock_out' | 'damage' | 'restock' | 'manual_restock' | 'damage_adjustment' | 'order_confirmed' | 'order_cancelled' | 'inventory_count_correction';
  referenceId?: string;
  createdAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  previousStatus?: string;
  newStatus: string;
  notes?: string;
  changedBy: string;
  createdAt: string;
}

export type ShippingRegion = 'local_adiram' | 'tamil_nadu' | 'interstate' | 'pickup';

export interface ShippingRule {
  id: string;
  name: string;
  region: ShippingRegion;
  baseCharge: number;
  freeThreshold: number;
  estimatedDays: string;
  isActive: boolean;
  sortOrder: number;
}

export type ExpenseCategory =
  | 'raw_materials'
  | 'packaging'
  | 'marketing_ads'
  | 'shipping_courier'
  | 'studio_tools'
  | 'expo_fees'
  | 'miscellaneous'
  | 'courier_dispatch'
  | 'marketing'
  | 'rent_utilities'
  | 'other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  notes?: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  sessionId: string;
  customerName?: string;
  customerPhone?: string;
  occasion?: string;
  budgetRange?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedProductIds?: string[];
  createdAt: string;
}

export interface SalesSummary {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  categoryCounts: Record<string, number>;
}

export interface ProfitOrderEntry {
  orderId: string;
  date: string;
  customerName: string;
  channel: string;
  salePrice: number;
  deliveryFee: number;
  subtotal: number;
  materialsCost: number;
  packingCost: number;
  shippingCost: number;
  commission: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercentage: number;
  orderProfit?: number;
  marginPercentage?: number;
}

export interface ProfitSummary {
  grossRevenue: number;
  totalDiscounts: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercentage: number;
  operatingExpenses: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  profitMarginPercentage: number;
  averageOrderValue: number;
  totalOrders: number;
  expensesByCategory: Record<string, number>;
  revenueByChannel: Record<string, { revenue: number; orderCount: number; percentage: number }>;
  topProducts: Array<{ productId: string; name: string; unitsSold: number; totalRevenue: number }>;
  topSheets: Array<{ sheetId: string; name: string; usesCount: number }>;
  topAddons: Array<{ name: string; count: number }>;
  perOrderProfits: ProfitOrderEntry[];
}
