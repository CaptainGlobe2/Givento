'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ImageUploader from '../../components/ImageUploader';
import {
  db,
  AdminOrder,
  Coupon,
  CustomRequest,
  SiteSettings,
  OrderChannel,
  OrderStatus,
  OrderPaymentStatus,
  AdminOrderItem,
} from '../../lib/database';
import {
  Product,
  Category,
  Realm,
  Subcategory,
  InventoryTransaction,
  BouquetSize,
  Decoration,
  CustomizationOption,
  AiConversation,
  AiMessage,
  Expense,
  ExpenseCategory,
  PriceType,
  OrderStatusHistory,
  SalesSummary,
  ProfitSummary,
} from '../../types';
import { WrappingSheet, BouquetItem, BouquetGroup } from '../../types/bouquet';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Award,
  Bell,
  ChevronDown,
  Lightbulb,
  Package,
  Layers,
  ClipboardList,
  Tag,
  MessageSquare,
  BarChart3,
  Plus,
  Trash2,
  ExternalLink,
  MessageCircle,
  LogOut,
  Save,
  Truck,
  Sparkles,
  ArrowLeft,
  X,
  Boxes,
  AlertTriangle,
  History,
  RotateCcw,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  Check,
  Printer,
  Calendar,
  MapPin,
  Phone,
  User,
  Eye,
  ArrowRight,
  Clock,
  Download,
} from 'lucide-react';
import {
  generateOrdersCsv,
  generateExpensesCsv,
  generateProfitSummaryCsv,
  triggerCsvDownload,
} from '../../lib/csvExport';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'realms'
    | 'requests'
    | 'coupons'
    | 'sheets'
    | 'settings'
    | 'inventory'
    | 'analytics'
  >('dashboard');

  // Master Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [realms, setRealms] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [inventoryTx, setInventoryTx] = useState<InventoryTransaction[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [sheets, setSheets] = useState<WrappingSheet[]>([]);
  const [bItems, setBItems] = useState<BouquetItem[]>([]);
  const [bouquetSizes, setBouquetSizes] = useState<BouquetSize[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [custOptions, setCustOptions] = useState<CustomizationOption[]>([]);
  const [custStudioFilter, setCustStudioFilter] = useState<'all' | 'bouquet' | 'resin' | 'frame' | 'hamper'>('all');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [analytics, setAnalytics] = useState<SalesSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null);

  // New Decoration Modal State
  const [isNewDecOpen, setIsNewDecOpen] = useState(false);
  const [newDecName, setNewDecName] = useState('');
  const [newDecPrice, setNewDecPrice] = useState<number>(25);
  const [newDecStock, setNewDecStock] = useState<number>(50);
  const [newDecDesc, setNewDecDesc] = useState('');

  // New Customization Option Modal State
  const [isNewCustOptionOpen, setIsNewCustOptionOpen] = useState(false);
  const [newOptionTypeId, setNewOptionTypeId] = useState<'resin' | 'frame' | 'hamper'>('resin');
  const [newOptionGroupName, setNewOptionGroupName] = useState('shape');
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState<number>(0);
  const [newOptionStock, setNewOptionStock] = useState<number>(50);

  // Expense State
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<ExpenseCategory>('raw_materials');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number | ''>(500);
  const [newExpenseDate, setNewExpenseDate] = useState('');
  const [newExpenseNotes, setNewExpenseNotes] = useState('');

  // Analytics Filter & CSV Export State
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'all' | 'today' | 'month' | 'quarter' | 'year' | 'custom'>('all');
  const [analyticsCustomStart, setAnalyticsCustomStart] = useState('');
  const [analyticsCustomEnd, setAnalyticsCustomEnd] = useState('');
  const [expenseFilterCategory, setExpenseFilterCategory] = useState<string>('all');

  // AI Assistant State
  const [aiConversations, setAiConversations] = useState<AiConversation[]>([]);
  const [selectedAiConv, setSelectedAiConv] = useState<AiConversation | null>(null);
  const [selectedAiMessages, setSelectedAiMessages] = useState<AiMessage[]>([]);
  const [aiInstructions, setAiInstructions] = useState(
    'Warm, helpful boutique artisan tone. Recommend only real products from our database. Ask about occasion and budget if unspecified. Remind customer that orders and personalisation proofs are confirmed on WhatsApp.'
  );

  // Order Filter & Search State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [orderChannelFilter, setOrderChannelFilter] = useState<
    'all' | OrderChannel
  >('all');
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [isPackingSummaryOpen, setIsPackingSummaryOpen] = useState(false);
  const [packingSlipFilter, setPackingSlipFilter] = useState<'active' | 'all' | string>('active');

  // Selected Order Detail Drawer State
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<AdminOrder | null>(null);
  const [orderTimeline, setOrderTimeline] = useState<OrderStatusHistory[]>([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);
  const [detailCourier, setDetailCourier] = useState('Delhivery');
  const [detailTrackingNumber, setDetailTrackingNumber] = useState('');
  const [detailTrackingUrl, setDetailTrackingUrl] = useState('');
  const [detailPaymentStatus, setDetailPaymentStatus] = useState<OrderPaymentStatus>('Unpaid');
  const [detailPromiseDate, setDetailPromiseDate] = useState('');
  const [detailAdminNotes, setDetailAdminNotes] = useState('');

  // Manual Order Form State (Omnichannel)
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualChannel, setManualChannel] = useState<OrderChannel>('whatsapp');
  const [manualAddress, setManualAddress] = useState('Studio Handover / Adirampattinam');
  const [manualCity, setManualCity] = useState('Adirampattinam');
  const [manualState, setManualState] = useState('Tamil Nadu');
  const [manualPincode, setManualPincode] = useState('614701');
  const [manualDeliveryFee, setManualDeliveryFee] = useState(0);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [manualPaymentMethod, setManualPaymentMethod] = useState<'whatsapp' | 'cash' | 'gpay_direct' | 'cod' | 'razorpay'>('whatsapp');
  const [manualPaymentStatus, setManualPaymentStatus] = useState<OrderPaymentStatus>('Fully Paid');
  const [manualPromiseDate, setManualPromiseDate] = useState('');
  const [manualAdminNotes, setManualAdminNotes] = useState('');
  const [manualItems, setManualItems] = useState<
    Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      notes: string;
    }>
  >([
    {
      productId: '',
      productName: '',
      quantity: 1,
      price: 249,
      notes: '',
    },
  ]);

  // Product Filter State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // New Product Modal State
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductRealm, setNewProductRealm] = useState('bouquets');
  const [newProductSubcat, setNewProductSubcat] = useState('');
  const [newProductStock, setNewProductStock] = useState<number>(20);
  const [newProductPrice, setNewProductPrice] = useState<number | ''>(249);
  const [newProductPriceType, setNewProductPriceType] = useState<PriceType>('fixed');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductBadge, setNewProductBadge] = useState('New');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductBouquetEnabled, setNewProductBouquetEnabled] = useState(false);
  const [newProductBouquetPrice, setNewProductBouquetPrice] = useState<number | ''>(35);
  const [newProductBouquetGroup, setNewProductBouquetGroup] = useState<'choc' | 'photo' | 'flower' | 'jewel' | 'more'>('more');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductCategory, setEditProductCategory] = useState('');
  const [editProductSubcat, setEditProductSubcat] = useState('');
  const [editProductStock, setEditProductStock] = useState<number>(20);
  const [editProductPrice, setEditProductPrice] = useState<number | ''>(249);
  const [editProductPriceType, setEditProductPriceType] = useState<PriceType>('fixed');
  const [editProductDesc, setEditProductDesc] = useState('');
  const [editProductBadge, setEditProductBadge] = useState('');
  const [editProductImage, setEditProductImage] = useState('');
  const [editProductBouquetEnabled, setEditProductBouquetEnabled] = useState(false);
  const [editProductBouquetPrice, setEditProductBouquetPrice] = useState<number | ''>(35);
  const [editProductBouquetGroup, setEditProductBouquetGroup] = useState<'choc' | 'photo' | 'flower' | 'jewel' | 'more'>('more');

  // Category Management State
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🎀');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategorySlug, setEditCategorySlug] = useState('');
  const [editCategoryIcon, setEditCategoryIcon] = useState('🎀');
  const [editCategoryDesc, setEditCategoryDesc] = useState('');
  const [editCategorySortOrder, setEditCategorySortOrder] = useState<number>(1);
  const [editCategoryIsActive, setEditCategoryIsActive] = useState<boolean>(true);

  // Subcategory management state
  const [isNewSubcatOpen, setIsNewSubcatOpen] = useState(false);
  const [newSubcatRealm, setNewSubcatRealm] = useState('bouquets');
  const [newSubcatName, setNewSubcatName] = useState('');
  const [newSubcatSlug, setNewSubcatSlug] = useState('');

  // Inventory adjustment state
  const [inventoryTypeFilter, setInventoryTypeFilter] = useState<'all' | 'product' | 'wrapping_sheet' | 'decoration'>('all');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [inventorySearch, setInventorySearch] = useState('');
  const [adjustItem, setAdjustItem] = useState<{
    id: string;
    name: string;
    type: 'product' | 'wrapping_sheet' | 'decoration';
    currentStock: number;
  } | null>(null);
  const [adjustChange, setAdjustChange] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<InventoryTransaction['reason']>('stock_in');
  const [adjustRef, setAdjustRef] = useState('');

  // New Wrapping Sheet Modal State
  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [newSheetPrice, setNewSheetPrice] = useState<number>(60);
  const [newSheetStock, setNewSheetStock] = useState<number>(10);
  const [newSheetBase, setNewSheetBase] = useState('#2a1226');
  const [newSheetTrim, setNewSheetTrim] = useState('#f0b43c');
  const [newSheetDots, setNewSheetDots] = useState(false);

  // Tracking edit state
  const [editingTrackingOrderId, setEditingTrackingOrderId] = useState<string | null>(null);
  const [trackingCourier, setTrackingCourier] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingSentCustomer, setTrackingSentCustomer] = useState<{ orderId: string; phone: string; waUrl: string } | null>(null);
  const [orderAlertNotice, setOrderAlertNotice] = useState<{
    orderId: string;
    phone: string;
    message: string;
    waUrl: string;
    type: 'cancel' | 'receipt' | 'tracking';
  } | null>(null);

  // Coupon modal state & handlers
  const [isNewCouponOpen, setIsNewCouponOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscountType, setNewCouponDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponDiscountValue, setNewCouponDiscountValue] = useState<number>(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(499);
  const [newCouponDescription, setNewCouponDescription] = useState('');

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newCoupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponDiscountType,
      discountValue: Number(newCouponDiscountValue),
      minOrder: Number(newCouponMinOrder),
      isActive: true,
      description:
        newCouponDescription.trim() ||
        `${newCouponDiscountValue}${newCouponDiscountType === 'percentage' ? '%' : '₹'} OFF on orders above ₹${newCouponMinOrder}`,
    };
    await db.addCoupon(newCoupon);
    const updated = await db.getCoupons();
    setCoupons(updated);
    setIsNewCouponOpen(false);
    setNewCouponCode('');
    setNewCouponDiscountValue(10);
    setNewCouponMinOrder(499);
    setNewCouponDescription('');
  };

  const handleToggleCoupon = async (code: string) => {
    await db.toggleCoupon(code);
    const updated = await db.getCoupons();
    setCoupons(updated);
  };

  const handleDeleteCoupon = async (code: string) => {
    if (confirm(`Are you sure you want to delete coupon ${code}?`)) {
      await db.deleteCoupon(code);
      const updated = await db.getCoupons();
      setCoupons(updated);
    }
  };

  // Dashboard interactive state
  const [dashTrendPeriod, setDashTrendPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [dashCategoryPeriod, setDashCategoryPeriod] = useState<'this_week' | 'this_month' | 'all'>('this_week');

  const loadAllData = async () => {
    const [p, r, o, c, req, sh, bi, s, an, sub, tx, bSizes, decs, aiConvs, exps, prof, cOpts] = await Promise.all([
      db.getProducts(),
      db.getCategories(),
      db.getOrders(),
      db.getCoupons(),
      db.getCustomRequests(),
      db.getWrappingSheets(),
      db.getBouquetItems(),
      db.getSettings(),
      db.getSalesSummary(),
      db.getSubcategories(),
      db.getInventoryTransactions(),
      db.getBouquetSizes(),
      db.getDecorations(),
      db.getAiConversations(),
      db.getExpenses(),
      db.getProfitSummary(),
      db.getCustomizationOptions(),
    ]);
    setProducts(p);
    setRealms(r);
    setOrders(o);
    setCoupons(c);
    setRequests(req);
    setSheets(sh);
    setBItems(bi);
    setSettings(s);
    if (s?.aiAssistantInstructions) {
      setAiInstructions(s.aiAssistantInstructions);
    }
    setAnalytics(an);
    setSubcategories(sub);
    setInventoryTx(tx);
    setBouquetSizes(bSizes);
    setDecorations(decs);
    setAiConversations(aiConvs);
    setExpenses(exps);
    setProfitSummary(prof);
    setCustOptions(cOpts);
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/auth/session', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        if (cancelled) return;
        if (!data?.authenticated) {
          router.push('/admin/login');
          return;
        }
        setIsAuthenticated(true);
        setNewExpenseDate(new Date().toISOString().split('T')[0]);
        loadAllData();
      })
      .catch(() => {
        if (!cancelled) router.push('/admin/login');
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/admin/login');
  };

  // ----------------------------------------------------
  // PRODUCT HANDLERS
  // ----------------------------------------------------
  const handleToggleProductStock = async (id: string, inStock: boolean) => {
    await db.updateProduct(id, { inStock: !inStock });
    loadAllData();
  };

  const handleToggleBouquetEnabled = async (id: string, bouquetEnabled: boolean) => {
    await db.updateProduct(id, { bouquetEnabled });
    loadAllData();
  };

  const handleUpdateProductBouquet = async (id: string, field: 'bouquetPrice' | 'bouquetGroup', val: number | BouquetGroup) => {
    await db.updateProduct(id, { [field]: val });
    loadAllData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this craft?')) {
      await db.deleteProduct(id);
      loadAllData();
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const catObj = realms.find((r) => r.id === newProductRealm);
    const stock = Number(newProductStock);
    await db.addProduct({
      name: newProductName.trim(),
      categoryId: newProductRealm,
      categoryName: catObj?.name || 'Bouquets',
      realmId: newProductRealm,
      realmName: catObj?.name || 'Bouquets',
      subcategoryId: newProductSubcat || undefined,
      stockQuantity: stock,
      inStock: stock > 0,
      priceType: newProductPriceType,
      price: newProductPriceType === 'fixed' && newProductPrice ? Number(newProductPrice) : undefined,
      priceFrom: newProductPriceType === 'from' && newProductPrice ? Number(newProductPrice) : undefined,
      shortDescription: newProductDesc.trim() || 'Handcrafted parcel from Givento.in',
      description: newProductDesc.trim() || 'Handcrafted parcel from Givento.in',
      badge: newProductBadge.trim() || undefined,
      images: [newProductImage.trim() || '/images/sunflower-bouquet.svg'],
      featured: true,
      bouquetEnabled: newProductBouquetEnabled,
      bouquetPrice: newProductBouquetEnabled && newProductBouquetPrice ? Number(newProductBouquetPrice) : undefined,
      bouquetGroup: newProductBouquetEnabled ? newProductBouquetGroup : undefined,
    });
    setIsNewProductOpen(false);
    setNewProductName('');
    setNewProductDesc('');
    setNewProductSubcat('');
    setNewProductStock(20);
    setNewProductPrice(249);
    setNewProductPriceType('fixed');
    setNewProductBadge('New');
    setNewProductImage('');
    setNewProductBouquetEnabled(false);
    loadAllData();
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setEditProductName(p.name);
    setEditProductCategory(p.categoryId || p.realmId || (realms[0]?.id ?? 'bouquets'));
    setEditProductSubcat(p.subcategoryId || '');
    setEditProductStock(p.stockQuantity ?? (p.inStock ? 15 : 0));
    setEditProductPriceType(p.priceType || (p.priceFrom ? 'from' : p.price ? 'fixed' : 'on_request'));
    setEditProductPrice(p.price ?? p.priceFrom ?? '');
    setEditProductDesc(p.shortDescription || p.description || '');
    setEditProductBadge(p.badge || '');
    setEditProductImage(p.images?.[0] || '/images/sunflower-bouquet.svg');
    setEditProductBouquetEnabled(!!p.bouquetEnabled);
    setEditProductBouquetPrice(p.bouquetPrice ?? 35);
    setEditProductBouquetGroup(p.bouquetGroup || 'more');
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const catObj = realms.find((r) => r.id === editProductCategory);
    const stock = Number(editProductStock);
    await db.updateProduct(editingProduct.id, {
      name: editProductName.trim(),
      categoryId: editProductCategory,
      categoryName: catObj?.name || 'Category',
      realmId: editProductCategory,
      realmName: catObj?.name || 'Category',
      subcategoryId: editProductSubcat || undefined,
      stockQuantity: stock,
      inStock: stock > 0,
      priceType: editProductPriceType,
      price: editProductPriceType === 'fixed' && editProductPrice ? Number(editProductPrice) : undefined,
      priceFrom: editProductPriceType === 'from' && editProductPrice ? Number(editProductPrice) : undefined,
      shortDescription: editProductDesc.trim(),
      description: editProductDesc.trim(),
      badge: editProductBadge.trim() || undefined,
      images: [editProductImage.trim()],
      bouquetEnabled: editProductBouquetEnabled,
      bouquetPrice: editProductBouquetEnabled && editProductBouquetPrice ? Number(editProductBouquetPrice) : undefined,
      bouquetGroup: editProductBouquetEnabled ? editProductBouquetGroup : undefined,
    });
    setEditingProduct(null);
    loadAllData();
  };

  // ----------------------------------------------------
  // CATEGORY & SUBCATEGORY HANDLERS
  // ----------------------------------------------------
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const slug = newCategorySlug.trim() || newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await db.addCategory({
      name: newCategoryName.trim(),
      slug,
      icon: newCategoryIcon.trim() || '🎀',
      description: newCategoryDesc.trim() || undefined,
      sortOrder: realms.length + 1,
      isActive: true,
      groupKey: 'more',
    });
    setIsNewCategoryOpen(false);
    setNewCategoryName('');
    setNewCategorySlug('');
    setNewCategoryIcon('🎀');
    setNewCategoryDesc('');
    loadAllData();
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
    setEditCategorySlug(cat.slug);
    setEditCategoryIcon(cat.icon || '🎀');
    setEditCategoryDesc(cat.description || '');
    setEditCategorySortOrder(cat.sortOrder ?? 1);
    setEditCategoryIsActive(cat.isActive !== false);
  };

  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    await db.updateCategory(editingCategory.id, {
      name: editCategoryName.trim(),
      slug: editCategorySlug.trim(),
      icon: editCategoryIcon.trim() || '🎀',
      description: editCategoryDesc.trim() || undefined,
      sortOrder: Number(editCategorySortOrder),
      isActive: editCategoryIsActive,
      fantasyName: editCategoryName.trim(),
      plainName: editCategoryName.trim(),
    });
    setEditingCategory(null);
    loadAllData();
  };

  const handleDeleteCategory = async (id: string) => {
    const hasProducts = products.some((p) => p.categoryId === id || p.realmId === id);
    if (hasProducts) {
      alert('Cannot delete this category because active products are assigned to it. Please reassign or delete them first.');
      return;
    }
    if (confirm('Are you sure you want to delete this category?')) {
      await db.deleteCategory(id);
      loadAllData();
    }
  };

  const handleToggleCategory = async (id: string, current: boolean) => {
    await db.updateCategory(id, { isActive: !current });
    loadAllData();
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcatName.trim()) return;
    const slug = newSubcatSlug.trim() || newSubcatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await db.createSubcategory({
      categoryId: newSubcatRealm,
      name: newSubcatName.trim(),
      slug,
      isActive: true,
      sortOrder: subcategories.length + 1,
    });
    setIsNewSubcatOpen(false);
    setNewSubcatName('');
    setNewSubcatSlug('');
    loadAllData();
  };

  const handleToggleSubcategory = async (id: string, current: boolean) => {
    await db.updateSubcategory(id, { isActive: !current });
    loadAllData();
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (confirm('Delete this subcategory?')) {
      await db.deleteSubcategory(id);
      loadAllData();
    }
  };

  // ----------------------------------------------------
  // INVENTORY ADJUSTMENT ACTIONS
  // ----------------------------------------------------
  const handleOpenStockAdjust = (item: {
    id: string;
    name: string;
    type: 'product' | 'wrapping_sheet' | 'decoration';
    currentStock: number;
  }) => {
    setAdjustItem(item);
    setAdjustChange(0);
    setAdjustReason('stock_in');
    setAdjustRef('');
  };

  const handleSubmitStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem || adjustChange === 0) return;
    const newStock = Math.max(0, adjustItem.currentStock + adjustChange);

    if (adjustItem.type === 'wrapping_sheet') {
      await db.updateWrappingSheet(adjustItem.id, { stock: newStock });
    } else if (adjustItem.type === 'decoration') {
      await db.updateDecoration(adjustItem.id, { stock: newStock });
    } else {
      await db.updateProduct(adjustItem.id, { stockQuantity: newStock, inStock: newStock > 0 });
    }

    await db.addInventoryTransaction({
      itemType: adjustItem.type,
      itemId: adjustItem.id,
      itemName: adjustItem.name,
      changeQuantity: adjustChange,
      reason: adjustReason,
      referenceId: adjustRef.trim() || 'Admin Manual Adjustment',
    });

    setAdjustItem(null);
    loadAllData();
  };

  // ----------------------------------------------------
  // BOUQUET & SETTINGS ACTIONS
  // ----------------------------------------------------
  const handleToggleSheetActive = async (id: string, currentActive: boolean) => {
    await db.updateWrappingSheet(id, { active: !currentActive });
    loadAllData();
  };

  const handleUpdateSheetStock = async (id: string, stock: number) => {
    await db.updateWrappingSheet(id, { stock: Math.max(0, stock) });
    loadAllData();
  };

  const handleUpdateSheetPrice = async (id: string, price: number) => {
    await db.updateWrappingSheet(id, { price: Math.max(0, price) });
    loadAllData();
  };

  const handleDeleteSheet = async (id: string) => {
    if (confirm('Delete this wrapping sheet?')) {
      await db.deleteWrappingSheet(id);
      loadAllData();
    }
  };

  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName.trim()) return;
    await db.createWrappingSheet({
      name: newSheetName.trim(),
      price: Number(newSheetPrice),
      stock: Number(newSheetStock),
      base: newSheetBase,
      trim: newSheetTrim,
      dots: newSheetDots,
      active: true,
    });
    setIsNewSheetOpen(false);
    setNewSheetName('');
    loadAllData();
  };

  const handleToggleBuilderEnabled = async () => {
    if (!settings) return;
    const updated: SiteSettings = {
      ...settings,
      builderSettings: {
        builderEnabled: !settings.builderSettings?.builderEnabled,
        maxPieces: settings.builderSettings?.maxPieces ?? 12,
      },
    };
    await db.updateSettings(updated);
    setSettings(updated);
  };

  const handleToggleSizeActive = async (id: string, current: boolean) => {
    await db.updateBouquetSize(id, { isActive: !current });
    const updated = await db.getBouquetSizes();
    setBouquetSizes(updated);
  };

  const handleUpdateSize = async (id: string, updates: Partial<BouquetSize>) => {
    await db.updateBouquetSize(id, updates);
    const updated = await db.getBouquetSizes();
    setBouquetSizes(updated);
  };

  const handleToggleDecActive = async (id: string, current: boolean) => {
    await db.updateDecoration(id, { isActive: !current });
    const updated = await db.getDecorations();
    setDecorations(updated);
  };

  const handleUpdateDec = async (id: string, updates: Partial<Decoration>) => {
    await db.updateDecoration(id, updates);
    const updated = await db.getDecorations();
    setDecorations(updated);
  };

  const handleUpdateMaxPieces = async (val: number) => {
    if (!settings) return;
    const updated: SiteSettings = {
      ...settings,
      builderSettings: {
        builderEnabled: settings.builderSettings?.builderEnabled ?? true,
        maxPieces: Math.max(1, val),
      },
    };
    await db.updateSettings(updated);
    setSettings(updated);
  };

  const handleCreateDecoration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecName.trim()) return;
    await db.addDecoration({
      name: newDecName.trim(),
      price: Number(newDecPrice) || 25,
      stock: Number(newDecStock) || 50,
      description: newDecDesc.trim() || undefined,
      isActive: true,
    });
    setIsNewDecOpen(false);
    setNewDecName('');
    setNewDecPrice(25);
    setNewDecStock(50);
    setNewDecDesc('');
    loadAllData();
  };

  const handleCreateCustOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionName.trim()) return;
    await db.addCustomizationOption({
      typeId: newOptionTypeId,
      groupName: newOptionGroupName.trim() || 'options',
      name: newOptionName.trim(),
      priceModifier: Number(newOptionPrice) || 0,
      stock: Number(newOptionStock) || 50,
      isActive: true,
    });
    setIsNewCustOptionOpen(false);
    setNewOptionName('');
    setNewOptionPrice(0);
    setNewOptionStock(50);
    loadAllData();
  };

  const handleToggleCustOptionActive = async (id: string, current: boolean) => {
    await db.updateCustomizationOption(id, { isActive: !current });
    loadAllData();
  };

  const handleDeleteCustOption = async (id: string) => {
    if (confirm('Delete this customization option?')) {
      await db.deleteCustomizationOption(id);
      loadAllData();
    }
  };

  // ----------------------------------------------------
  // ORDER ACTIONS & OMNICHANNEL MANAGEMENT
  // ----------------------------------------------------
  const handleUpdateOrderStatus = async (orderId: string, status: AdminOrder['status']) => {
    const updated = await db.updateOrderStatus(orderId, status);
    if (updated) {
      if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
        setSelectedOrderDetail(updated);
        const hist = await db.getOrderStatusHistory(orderId);
        setOrderTimeline(hist);
      }
      if (status === 'Received') {
        const confirmWaUrl = db.generateOrderConfirmationWhatsAppUrl(updated);
        setOrderAlertNotice({
          orderId: updated.id,
          phone: updated.customerPhone,
          message: `Order #${updated.id} confirmed! Confirmation & bill message opened for customer (+91 ${updated.customerPhone})`,
          waUrl: confirmWaUrl,
          type: 'receipt',
        });
        window.open(confirmWaUrl, '_blank', 'noopener,noreferrer');
      } else if (status === 'Cancelled') {
        const cancelWaUrl = db.generateCancellationWhatsAppUrl(updated);
        setOrderAlertNotice({
          orderId: updated.id,
          phone: updated.customerPhone,
          message: `Order #${updated.id} cancelled. Customer WhatsApp notification opened!`,
          waUrl: cancelWaUrl,
          type: 'cancel',
        });
        window.open(cancelWaUrl, '_blank', 'noopener,noreferrer');
      }
    }
    loadAllData();
  };

  const handleConfirmOrderWithNotification = async (order: AdminOrder) => {
    const updated = await db.updateOrderStatus(order.id, 'Received');
    if (updated) {
      if (selectedOrderDetail && selectedOrderDetail.id === order.id) {
        setSelectedOrderDetail(updated);
        const hist = await db.getOrderStatusHistory(order.id);
        setOrderTimeline(hist);
      }
      const confirmWaUrl = db.generateOrderConfirmationWhatsAppUrl(updated);
      setOrderAlertNotice({
        orderId: updated.id,
        phone: updated.customerPhone,
        message: `Order #${updated.id} confirmed! Confirmation & bill message opened for customer (+91 ${updated.customerPhone})`,
        waUrl: confirmWaUrl,
        type: 'receipt',
      });
      window.open(confirmWaUrl, '_blank', 'noopener,noreferrer');
    }
    loadAllData();
  };

  const handleCancelOrderWithNotification = async (order: AdminOrder) => {
    const updated = await db.updateOrderStatus(order.id, 'Cancelled');
    if (updated) {
      if (selectedOrderDetail && selectedOrderDetail.id === order.id) {
        setSelectedOrderDetail(updated);
        const hist = await db.getOrderStatusHistory(order.id);
        setOrderTimeline(hist);
      }
      const cancelWaUrl = db.generateCancellationWhatsAppUrl(updated);
      setOrderAlertNotice({
        orderId: updated.id,
        phone: updated.customerPhone,
        message: `Order #${updated.id} marked as Cancelled. Customer WhatsApp message opened!`,
        waUrl: cancelWaUrl,
        type: 'cancel',
      });
      window.open(cancelWaUrl, '_blank', 'noopener,noreferrer');
    }
    loadAllData();
  };

  const handleOpenOrderDetail = async (order: AdminOrder) => {
    setSelectedOrderDetail(order);
    setDetailCourier(order.trackingCourier || 'Delhivery');
    setDetailTrackingNumber(order.trackingNumber || '');
    setDetailTrackingUrl(order.trackingUrl || '');
    setDetailPaymentStatus(order.paymentStatus || 'Unpaid');
    setDetailPromiseDate(order.promiseDate || '');
    setDetailAdminNotes(order.adminNotes || '');
    setIsTimelineLoading(true);
    const hist = await db.getOrderStatusHistory(order.id);
    setOrderTimeline(hist);
    setIsTimelineLoading(false);
  };

  const handleUpdateStatusInDetail = async (newStatus: AdminOrder['status']) => {
    if (!selectedOrderDetail) return;
    const updated = await db.updateOrderStatus(selectedOrderDetail.id, newStatus);
    if (updated) {
      setSelectedOrderDetail(updated);
      const hist = await db.getOrderStatusHistory(updated.id);
      setOrderTimeline(hist);
      if (newStatus === 'Received') {
        const confirmWaUrl = db.generateOrderConfirmationWhatsAppUrl(updated);
        setOrderAlertNotice({
          orderId: updated.id,
          phone: updated.customerPhone,
          message: `Order #${updated.id} confirmed! Confirmation & bill message opened for customer (+91 ${updated.customerPhone})`,
          waUrl: confirmWaUrl,
          type: 'receipt',
        });
        window.open(confirmWaUrl, '_blank', 'noopener,noreferrer');
      } else if (newStatus === 'Cancelled') {
        const cancelWaUrl = db.generateCancellationWhatsAppUrl(updated);
        setOrderAlertNotice({
          orderId: updated.id,
          phone: updated.customerPhone,
          message: `Order #${updated.id} cancelled. Customer cancellation notice opened on WhatsApp!`,
          waUrl: cancelWaUrl,
          type: 'cancel',
        });
        window.open(cancelWaUrl, '_blank', 'noopener,noreferrer');
      }
    }
    loadAllData();
  };

  const handleSaveTrackingInDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderDetail || !detailTrackingNumber.trim()) return;
    const updated = await db.updateOrderTracking(
      selectedOrderDetail.id,
      detailCourier,
      detailTrackingNumber.trim(),
      detailTrackingUrl.trim() || undefined
    );
    if (updated) {
      setSelectedOrderDetail(updated);
      const hist = await db.getOrderStatusHistory(updated.id);
      setOrderTimeline(hist);
      const custWaUrl = db.generateStatusWhatsAppUrl(updated);
      setTrackingSentCustomer({
        orderId: updated.id,
        phone: updated.customerPhone,
        waUrl: custWaUrl,
      });
      // Automatically open WhatsApp with tracking details to the customer
      window.open(custWaUrl, '_blank', 'noopener,noreferrer');
    }
    loadAllData();
  };

  const handleQuickSaveTracking = async (orderId: string) => {
    if (!trackingNumber.trim()) return;
    const updated = await db.updateOrderTracking(
      orderId,
      trackingCourier,
      trackingNumber.trim()
    );
    if (updated) {
      const custWaUrl = db.generateStatusWhatsAppUrl(updated);
      setTrackingSentCustomer({
        orderId: updated.id,
        phone: updated.customerPhone,
        waUrl: custWaUrl,
      });
      // Automatically open WhatsApp with tracking details to the customer
      window.open(custWaUrl, '_blank', 'noopener,noreferrer');
      setEditingTrackingOrderId(null);
      setTrackingNumber('');
    }
    loadAllData();
  };

  const handleSavePaymentStatusInDetail = async () => {
    if (!selectedOrderDetail) return;
    const updated = await db.updateOrder(selectedOrderDetail.id, {
      paymentStatus: detailPaymentStatus,
    });
    if (updated) setSelectedOrderDetail(updated);
    loadAllData();
  };

  const handleSavePromiseDateInDetail = async () => {
    if (!selectedOrderDetail) return;
    const updated = await db.updateOrder(selectedOrderDetail.id, {
      promiseDate: detailPromiseDate,
    });
    if (updated) setSelectedOrderDetail(updated);
    loadAllData();
  };

  const handleSaveAdminNotesInDetail = async () => {
    if (!selectedOrderDetail) return;
    const updated = await db.updateOrder(selectedOrderDetail.id, {
      adminNotes: detailAdminNotes.trim(),
    });
    if (updated) setSelectedOrderDetail(updated);
    loadAllData();
  };

  // Manual Order Dynamic Items
  const handleAddManualItemRow = () => {
    setManualItems([
      ...manualItems,
      {
        productId: '',
        productName: '',
        quantity: 1,
        price: 249,
        notes: '',
      },
    ]);
  };

  const handleRemoveManualItemRow = (idx: number) => {
    if (manualItems.length <= 1) return;
    setManualItems(manualItems.filter((_, i) => i !== idx));
  };

  const handleSelectProductForManualItem = (idx: number, productId: string) => {
    const updated = [...manualItems];
    if (!productId) {
      updated[idx].productId = '';
      setManualItems(updated);
      return;
    }
    const found = products.find((p) => p.id === productId || p.slug === productId);
    if (found) {
      updated[idx].productId = found.id;
      updated[idx].productName = found.name;
      updated[idx].price = found.price || found.priceFrom || 249;
    }
    setManualItems(updated);
  };

  const handleUpdateManualItemField = (idx: number, field: 'productId' | 'productName' | 'quantity' | 'price' | 'notes', val: string | number) => {
    const updated = [...manualItems];
    const item = { ...updated[idx] };
    if (field === 'quantity' || field === 'price') { item[field] = Number(val); } else { item[field] = String(val); }
    updated[idx] = item;
    setManualItems(updated);
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomerName.trim()) {
      alert('Please enter customer name.');
      return;
    }
    const validItems = manualItems.filter((it) => it.productName.trim());
    if (validItems.length === 0) {
      alert('Please provide at least one item with a name.');
      return;
    }

    const subtotal = validItems.reduce((acc, it) => acc + Number(it.price) * Number(it.quantity), 0);
    const total = Math.max(0, subtotal + Number(manualDeliveryFee) - Number(manualDiscount));

    await db.createManualOrder({
      customerName: manualCustomerName.trim(),
      customerPhone: manualCustomerPhone.trim() || '9344013255',
      channel: manualChannel,
      paymentMethod: manualPaymentMethod,
      paymentStatus: manualPaymentStatus,
      address: manualAddress.trim() || 'Studio Handover / Adirampattinam',
      city: manualCity.trim() || 'Adirampattinam',
      state: manualState.trim() || 'Tamil Nadu',
      pincode: manualPincode.trim() || '614701',
      status: 'Received',
      subtotal,
      discount: Number(manualDiscount) || 0,
      deliveryFee: Number(manualDeliveryFee) || 0,
      total,
      promiseDate: manualPromiseDate || undefined,
      adminNotes: manualAdminNotes.trim() || undefined,
      items: validItems.map((it) => ({
        productId: it.productId || undefined,
        productName: it.productName.trim(),
        quantity: Number(it.quantity),
        price: Number(it.price),
        personalisation: it.notes.trim() ? { 'Customisation Notes': it.notes.trim() } : undefined,
      })),
    });

    setIsManualOrderOpen(false);
    setManualCustomerName('');
    setManualCustomerPhone('');
    setManualAdminNotes('');
    setManualItems([{ productId: '', productName: '', quantity: 1, price: 249, notes: '' }]);
    loadAllData();
  };

  // ----------------------------------------------------
  // EXPENSE ACTIONS
  // ----------------------------------------------------
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle.trim() || !newExpenseAmount || Number(newExpenseAmount) <= 0) {
      alert('Please provide a title and valid expense amount.');
      return;
    }
    await db.createExpense({
      title: newExpenseTitle.trim(),
      category: newExpenseCategory,
      amount: Number(newExpenseAmount),
      expenseDate: newExpenseDate || new Date().toISOString().split('T')[0],
      notes: newExpenseNotes.trim() || undefined,
    });
    setNewExpenseTitle('');
    setNewExpenseAmount(500);
    setNewExpenseNotes('');
    setIsNewExpenseOpen(false);
    await loadAllData();
  };

  const handleDeleteExpense = async (id: string, title: string) => {
    if (confirm(`Delete expense record "${title}"?`)) {
      await db.deleteExpense(id);
      await loadAllData();
    }
  };

  // ----------------------------------------------------
  // ANALYTICS & CSV EXPORT HANDLERS
  // ----------------------------------------------------
  const handleFilterDateRange = async (range: 'all' | 'today' | 'month' | 'quarter' | 'year' | 'custom') => {
    setAnalyticsDateRange(range);
    const summary = await db.getProfitSummary({
      dateRange: range,
      startDate: analyticsCustomStart || undefined,
      endDate: analyticsCustomEnd || undefined,
    });
    setProfitSummary(summary);
  };

  const handleApplyCustomDateRange = async () => {
    if (!analyticsCustomStart || !analyticsCustomEnd) {
      alert('Please select both a start date and an end date.');
      return;
    }
    const summary = await db.getProfitSummary({
      dateRange: 'custom',
      startDate: analyticsCustomStart,
      endDate: analyticsCustomEnd,
    });
    setProfitSummary(summary);
  };

  const handleExportOrdersCsv = () => {
    const csv = generateOrdersCsv(orders);
    triggerCsvDownload(`givento-orders-${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const handleExportExpensesCsv = () => {
    const csv = generateExpensesCsv(expenses);
    triggerCsvDownload(`givento-expenses-${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const handleExportProfitCsv = () => {
    if (!profitSummary) return;
    const csv = generateProfitSummaryCsv(profitSummary);
    triggerCsvDownload(`givento-profit-summary-${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const handleSelectAiConversation = async (conv: AiConversation) => {
    setSelectedAiConv(conv);
    const msgs = await db.getAiMessages(conv.id);
    setSelectedAiMessages(msgs);
  };

  const handleSaveAiInstructions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const updated = {
      ...settings,
      aiAssistantInstructions: aiInstructions,
    };
    await db.updateSettings(updated);
    setSettings(updated);
  };

  const handleToggleAiRecommendable = async (pId: string, current: boolean) => {
    await db.updateProduct(pId, { isAiRecommendable: !current });
    loadAllData();
  };

  // ----------------------------------------------------
  // FILTERED LISTS
  // ----------------------------------------------------
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all') {
      if (orderStatusFilter === 'Packed & Sealed' && (o.status === 'Packed & Sealed' || o.status === 'Packed')) {
        // match
      } else if (orderStatusFilter === 'Dispatched' && (o.status === 'Dispatched' || o.status === 'Shipped')) {
        // match
      } else if (orderStatusFilter === 'Crafting' && (o.status === 'Crafting' || o.status === 'Making')) {
        // match
      } else if (o.status !== orderStatusFilter) {
        return false;
      }
    }
    if (orderChannelFilter !== 'all') {
      const ch = o.channel || 'website';
      if (orderChannelFilter === 'walkin_expo' && (ch === 'walkin_expo' || ch === 'expo')) {
        // match
      } else if (ch !== orderChannelFilter) {
        return false;
      }
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      const matchCity = o.city.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchCity) return false;
    }
    return true;
  });

  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all' && p.categoryId !== productCategoryFilter && p.realmId !== productCategoryFilter) {
      return false;
    }
    const stock = p.stockQuantity ?? (p.inStock ? 15 : 0);
    if (productStockFilter === 'in_stock' && stock <= 0) return false;
    if (productStockFilter === 'low_stock' && (stock > 5 || stock <= 0)) return false;
    if (productStockFilter === 'out_of_stock' && stock > 0) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      const matchDesc = p.shortDescription?.toLowerCase().includes(q) || false;
      if (!matchName && !matchSlug && !matchDesc) return false;
    }
    return true;
  });

  const allInventoryItems: Array<{
    id: string;
    name: string;
    type: 'product' | 'wrapping_sheet' | 'decoration';
    category: string;
    stock: number;
    price?: number;
  }> = [
      ...products.map((p) => ({
        id: p.id,
        name: p.name,
        type: 'product' as const,
        category: p.categoryName || p.realmName || 'Craft',
        stock: p.stockQuantity ?? (p.inStock ? 15 : 0),
        price: p.price ?? undefined,
      })),
      ...sheets.map((s) => ({
        id: s.id,
        name: `${s.name} (Wrapping Sheet)`,
        type: 'wrapping_sheet' as const,
        category: 'Bouquet Wrapping',
        stock: s.stock,
        price: s.price,
      })),
      ...decorations.map((d) => ({
        id: d.id,
        name: `${d.name} (Decoration)`,
        type: 'decoration' as const,
        category: 'Bouquet Decoration',
        stock: d.stock ?? 25,
        price: d.price,
      })),
    ];

  const filteredInventory = allInventoryItems.filter((item) => {
    if (inventoryTypeFilter !== 'all' && item.type !== inventoryTypeFilter) return false;
    if (inventoryStatusFilter === 'low_stock' && (item.stock > 5 || item.stock <= 0)) return false;
    if (inventoryStatusFilter === 'out_of_stock' && item.stock > 0) return false;
    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    }
    return true;
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col selection:bg-[#F6E9EE] selection:text-[#7A1C3B] font-sans">
      {/* Admin Top Header Matching Home Page Luxury Styling */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#EFE8E1] sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="relative w-9 h-9 rounded-full border border-[#E5DACD] shadow-2xs overflow-hidden bg-black flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
              title="Return to Live Storefront"
            >
              <Image
                src="/images/givento-logo.png"
                alt="Givento.in Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl text-[#1C1917] tracking-tight">
                  givento<span className="text-[#7A1C3B]">.in</span>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#F3ECE2] border border-[#E5DACD] text-[10px] tracking-[0.18em] font-semibold text-[#8C827A] uppercase">
                  Admin Dashboard
                </span>
              </div>
              <p className="font-sans text-xs text-[#78716C] hidden sm:block">
                Centralised boutique management desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#EFE8E1] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#1C1917] shadow-2xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#7A1C3B]" />
              <span>View Live Store</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition shadow-2xs cursor-pointer"
              title="Logout from admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-6">
        {/* Navigation Tabs Pill Bar (Matching Home Page Category Chips) */}
        <div className="flex gap-2 pb-3 mb-6 border-b border-[#EFE8E1] overflow-x-auto scrollbar-none flex-nowrap -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'dashboard'
              ? 'bg-[#7A1C3B] text-white shadow-xs'
              : 'bg-white text-[#6A5B60] border border-[#EFE8E1] hover:bg-[#FAF7F2] hover:text-[#1C1917]'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'orders'
              ? 'bg-[#7A1C3B] text-white shadow-xs'
              : 'bg-white text-[#6A5B60] border border-[#EFE8E1] hover:bg-[#FAF7F2] hover:text-[#1C1917]'
              }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Orders &amp; WhatsApp</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'orders' ? 'bg-[#FBF3E4] text-[#7A1C3B]' : 'bg-[#F3ECE2] text-[#6A5B60]'
                }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'products'
              ? 'bg-[#7A1C3B] text-white shadow-xs'
              : 'bg-white text-[#6A5B60] border border-[#EFE8E1] hover:bg-[#FAF7F2] hover:text-[#1C1917]'
              }`}
          >
            <Package className="w-4 h-4" />
            <span>Products &amp; Crafts</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'products' ? 'bg-[#FBF3E4] text-[#7A1C3B]' : 'bg-[#F3ECE2] text-[#6A5B60]'
                }`}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('realms')}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'realms'
              ? 'bg-[#7A1C3B] text-white shadow-xs'
              : 'bg-white text-[#6A5B60] border border-[#EFE8E1] hover:bg-[#FAF7F2] hover:text-[#1C1917]'
              }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({realms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'inventory'
              ? 'bg-[#7A1C3B] text-white shadow-xs'
              : 'bg-white text-[#6A5B60] border border-[#EFE8E1] hover:bg-[#FAF7F2] hover:text-[#1C1917]'
              }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventory &amp; Stock</span>
            {products.filter((p) => (p.stockQuantity ?? 10) <= 5).length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {products.filter((p) => (p.stockQuantity ?? 10) <= 5).length} low
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'sheets'
              ? 'bg-[#7A1C3B] text-white shadow-xs'
              : 'bg-white text-[#6A5B60] border border-[#EFE8E1] hover:bg-[#FAF7F2] hover:text-[#1C1917]'
              }`}
          >
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>Custom Studios</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'sheets' ? 'bg-[#FBF3E4] text-[#7A1C3B]' : 'bg-[#F3ECE2] text-[#6A5B60]'
                }`}
            >
              {sheets.length + custOptions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'requests'
              ? 'bg-[#7A1C3B] text-white shadow-xs'
              : 'bg-white text-[#6A5B60] border border-[#EFE8E1] hover:bg-[#FAF7F2] hover:text-[#1C1917]'
              }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Bulk Requests</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'requests' ? 'bg-[#FBF3E4] text-[#7A1C3B]' : 'bg-[#F3ECE2] text-[#6A5B60]'
                }`}
            >
              {requests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'coupons'
              ? 'bg-[#7A1C3B] text-white shadow-xs'
              : 'bg-white text-[#6A5B60] border border-[#EFE8E1] hover:bg-[#FAF7F2] hover:text-[#1C1917]'
              }`}
          >
            <Tag className="w-4 h-4" />
            <span>Coupons</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'settings'
              ? 'bg-[#7A1C3B] text-white shadow-xs'
              : 'bg-white text-[#6A5B60] border border-[#EFE8E1] hover:bg-[#FAF7F2] hover:text-[#1C1917]'
              }`}
          >
            <Save className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'analytics'
              ? 'bg-[#7A1C3B] text-white shadow-xs'
              : 'bg-white text-[#6A5B60] border border-[#EFE8E1] hover:bg-[#FAF7F2] hover:text-[#1C1917]'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Profit &amp; Analytics</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 0: DASHBOARD & WORKSHOP OVERVIEW */}
        {/* ==================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Bar: Workshop Title, Date, Report Download & Add Item */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-7 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
                    Givento Workshop Desk
                  </h1>
                </div>
                <p className="font-sans text-xs sm:text-sm text-[#78716C]">
                  Live studio orders, fulfillment tracking, and inventory control · Adirampattinam
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Date Badge */}
                <div className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFE8E1] text-xs font-semibold text-[#1C1917] flex items-center gap-2 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Download Report Button */}
                <button
                  type="button"
                  onClick={handleExportOrdersCsv}
                  className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>

                {/* Add Product Button */}
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#EFE8E1] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#7A1C3B]" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* 4 Top KPI Stat Cards with Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Revenue */}
              <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shadow-2xs">
                      ₹
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider block">
                        Total Revenue
                      </span>
                      <span className="text-2xl font-bold font-heading text-[#1C1917] tabular-nums">
                        ₹{(orders.reduce((sum, o) => sum + (o.total || 0), 0) || 32450).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Sparkline Orange */}
                  <svg className="w-16 h-8 text-orange-500 overflow-visible flex-shrink-0" viewBox="0 0 60 30">
                    <path
                      d="M 2 24 Q 15 20, 25 15 T 40 8 T 58 4"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F5EFE8] flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    ↑ 8.2%
                  </span>
                  <span className="text-[#8C827A]">vs Yesterday</span>
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider block">
                        Total Orders
                      </span>
                      <span className="text-2xl font-bold font-heading text-[#1C1917] tabular-nums">
                        {orders.length || 168}
                      </span>
                    </div>
                  </div>

                  {/* Sparkline Red/Orange */}
                  <svg className="w-16 h-8 text-red-500 overflow-visible flex-shrink-0" viewBox="0 0 60 30">
                    <path
                      d="M 2 25 Q 18 22, 30 14 T 46 12 T 58 5"
                      fill="none"
                      stroke="#EA580C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F5EFE8] flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    ↑ 6.2%
                  </span>
                  <span className="text-[#8C827A]">vs Yesterday</span>
                </div>
              </div>

              {/* Card 3: New Customers */}
              <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider block">
                        New Customers
                      </span>
                      <span className="text-2xl font-bold font-heading text-[#1C1917] tabular-nums">
                        {new Set(orders.map((o) => o.customerPhone).filter(Boolean)).size || 52}
                      </span>
                    </div>
                  </div>

                  {/* Sparkline Green */}
                  <svg className="w-16 h-8 text-emerald-500 overflow-visible flex-shrink-0" viewBox="0 0 60 30">
                    <path
                      d="M 2 26 Q 20 20, 32 16 T 48 8 T 58 4"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F5EFE8] flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    ↑ 4.1%
                  </span>
                  <span className="text-[#8C827A]">vs Yesterday</span>
                </div>
              </div>

              {/* Card 4: Average Order Value */}
              <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center text-yellow-600 shadow-2xs">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider block">
                        Avg Order Value
                      </span>
                      <span className="text-2xl font-bold font-heading text-[#1C1917] tabular-nums">
                        ₹{Math.round(
                          (orders.reduce((sum, o) => sum + (o.total || 0), 0) || 32450) /
                          Math.max(1, orders.length || 168)
                        ) || 193}
                      </span>
                    </div>
                  </div>

                  {/* Sparkline Yellow/Gold */}
                  <svg className="w-16 h-8 text-yellow-500 overflow-visible flex-shrink-0" viewBox="0 0 60 30">
                    <path
                      d="M 2 24 Q 16 20, 28 14 T 45 10 T 58 6"
                      fill="none"
                      stroke="#FBBF24"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F5EFE8] flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    ↑ 3.7%
                  </span>
                  <span className="text-[#8C827A]">vs Yesterday</span>
                </div>
              </div>
            </div>

            {/* Middle Grid: Trend Chart (Col 7) & Orders by Category (Col 5) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Revenue & Orders Trend */}
              <div className="lg:col-span-7 bg-white border border-[#EFE8E1] rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading font-normal text-lg sm:text-xl text-[#1C1917]">
                      Revenue &amp; Orders Trend
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Time range pills */}
                    <div className="flex items-center bg-[#FAF7F2] border border-[#EFE8E1] p-1 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setDashTrendPeriod('today')}
                        className={`px-3 py-1 rounded-lg transition ${dashTrendPeriod === 'today'
                          ? 'bg-[#EA580C] text-white shadow-2xs'
                          : 'text-[#6A5B60] hover:text-[#1C1917]'
                          }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setDashTrendPeriod('week')}
                        className={`px-3 py-1 rounded-lg transition ${dashTrendPeriod === 'week'
                          ? 'bg-[#EA580C] text-white shadow-2xs'
                          : 'text-[#6A5B60] hover:text-[#1C1917]'
                          }`}
                      >
                        This Week
                      </button>
                      <button
                        type="button"
                        onClick={() => setDashTrendPeriod('month')}
                        className={`px-3 py-1 rounded-lg transition ${dashTrendPeriod === 'month'
                          ? 'bg-[#EA580C] text-white shadow-2xs'
                          : 'text-[#6A5B60] hover:text-[#1C1917]'
                          }`}
                      >
                        This Month
                      </button>
                    </div>

                    {/* Legend */}
                    <div className="hidden sm:flex items-center gap-3 text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-[#1C1917]">
                        <span className="w-3 h-0.5 bg-[#EA580C] rounded-full inline-block" />
                        <span>Revenue (₹)</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[#1C1917]">
                        <span className="w-3 h-0.5 bg-[#10B981] rounded-full inline-block" />
                        <span>Orders</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Smooth Dual-Wave Curve Chart (SVG) */}
                <div className="relative w-full h-56 pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EA580C" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Guide lines */}
                    <line x1="0" y1="40" x2="600" y2="40" stroke="#F5EFE8" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke="#F5EFE8" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="600" y2="140" stroke="#F5EFE8" strokeDasharray="3 3" />
                    <line x1="0" y1="180" x2="600" y2="180" stroke="#EFE8E1" />

                    {/* Revenue Area & Curve (Orange) */}
                    <path
                      d="M 20 160 C 100 155, 180 135, 250 80 C 300 40, 350 40, 400 90 C 460 145, 520 120, 580 140 L 580 180 L 20 180 Z"
                      fill="url(#revenueGrad)"
                    />
                    <path
                      d="M 20 160 C 100 155, 180 135, 250 80 C 300 40, 350 40, 400 90 C 460 145, 520 120, 580 140"
                      fill="none"
                      stroke="#EA580C"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Orders Area & Curve (Teal/Green) */}
                    <path
                      d="M 20 170 C 100 168, 180 155, 250 115 C 300 85, 350 85, 400 120 C 460 160, 520 145, 580 160 L 580 180 L 20 180 Z"
                      fill="url(#ordersGrad)"
                    />
                    <path
                      d="M 20 170 C 100 168, 180 155, 250 115 C 300 85, 350 85, 400 120 C 460 160, 520 145, 580 160"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Peak Tooltip Badges (Matching Reference Photo) */}
                    <g transform="translate(305, 15)">
                      <rect x="-24" y="0" width="48" height="20" rx="6" fill="#EA580C" />
                      <text x="0" y="14" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                        ₹5.6K
                      </text>
                      <circle cx="0" cy="27" r="4" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2" />
                    </g>

                    <g transform="translate(305, 68)">
                      <rect x="-18" y="0" width="36" height="18" rx="5" fill="#10B981" />
                      <text x="0" y="13" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                        28
                      </text>
                      <circle cx="0" cy="24" r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                    </g>
                  </svg>

                  {/* X-Axis Time Labels */}
                  <div className="flex justify-between text-[11px] font-medium text-[#8C827A] pt-2 px-2">
                    <span>12 AM</span>
                    <span>4 AM</span>
                    <span>8 AM</span>
                    <span>12 PM</span>
                    <span>4 PM</span>
                    <span>8 PM</span>
                    <span>11 PM</span>
                  </div>
                </div>

                {/* Bottom Highlight 4 Metric Strip (Matching Reference) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#F5EFE8]">
                  <div className="bg-[#FAF7F2] p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
                      Today&apos;s Revenue
                    </span>
                    <span className="text-base font-bold text-[#1C1917] mt-0.5 block">
                      ₹8,020
                    </span>
                  </div>
                  <div className="bg-[#FAF7F2] p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
                      Today&apos;s Orders
                    </span>
                    <span className="text-base font-bold text-[#1C1917] mt-0.5 block">
                      32
                    </span>
                  </div>
                  <div className="bg-[#FAF7F2] p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
                      Peak Revenue
                    </span>
                    <span className="text-base font-bold text-[#1C1917] mt-0.5 block">
                      ₹5,600 | 4 PM
                    </span>
                  </div>
                  <div className="bg-[#FAF7F2] p-3 rounded-2xl">
                    <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
                      Peak Orders
                    </span>
                    <span className="text-base font-bold text-[#1C1917] mt-0.5 block">
                      28 | 4 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Orders by Category (Donut Chart & Top Category Callout) */}
              <div className="lg:col-span-5 bg-white border border-[#EFE8E1] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-normal text-lg sm:text-xl text-[#1C1917]">
                    Orders by Category
                  </h3>
                  <div className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#EFE8E1] text-xs font-semibold text-[#1C1917] flex items-center gap-1">
                    <span>This Week</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8C827A]" />
                  </div>
                </div>

                {/* Donut Chart & Legend */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                  {/* SVG Donut */}
                  <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F5EFE8" strokeWidth="16" />
                      {/* Bouquets 55% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#EA580C"
                        strokeWidth="16"
                        strokeDasharray="131 239"
                        strokeDashoffset="0"
                      />
                      {/* Keepsakes & Frames 20% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#FBBF24"
                        strokeWidth="16"
                        strokeDasharray="48 239"
                        strokeDashoffset="-131"
                      />
                      {/* Jewellery 15% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#10B981"
                        strokeWidth="16"
                        strokeDasharray="36 239"
                        strokeDashoffset="-179"
                      />
                      {/* Gift Hampers & Resin 10% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#9A3412"
                        strokeWidth="16"
                        strokeDasharray="24 239"
                        strokeDashoffset="-215"
                      />
                    </svg>

                    {/* Center text in hollow */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold font-heading text-[#1C1917] leading-tight">
                        {orders.length || 168}
                      </span>
                      <span className="text-[9px] font-bold tracking-widest text-[#8C827A] uppercase">
                        Total Orders
                      </span>
                    </div>
                  </div>

                  {/* Category Breakdown Rows */}
                  <div className="space-y-2.5 w-full text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                        <span className="font-semibold text-[#1C1917]">Bouquets</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#1C1917]">55%</span>
                        <span className="text-[11px] text-[#8C827A] ml-2">93 Orders</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                        <span className="font-semibold text-[#1C1917]">Keepsakes &amp; Frames</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#1C1917]">20%</span>
                        <span className="text-[11px] text-[#8C827A] ml-2">34 Orders</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                        <span className="font-semibold text-[#1C1917]">Jewellery</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#1C1917]">15%</span>
                        <span className="text-[11px] text-[#8C827A] ml-2">25 Orders</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#9A3412]" />
                        <span className="font-semibold text-[#1C1917]">Hampers &amp; Resin</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#1C1917]">10%</span>
                        <span className="text-[11px] text-[#8C827A] ml-2">16 Orders</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Category Callout Box (Matching Reference Peach Card) */}
                <div className="p-3.5 bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDBA74]/30 text-[#EA580C] flex items-center justify-center font-bold text-lg flex-shrink-0">
                    👑
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#EA580C] block uppercase tracking-wider">
                      Top Category
                    </span>
                    <p className="text-xs font-semibold text-[#7C2D12]">
                      Bouquets is the most ordered category this week.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: 3 Cards (Top Selling, Order Status, Business Insights) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Top Selling Products */}
              <div className="bg-white border border-[#EFE8E1] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F5EFE8] pb-3">
                  <h3 className="font-heading font-normal text-lg text-[#1C1917]">
                    Top Selling Crafts
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-bold text-[#7A1C3B] hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      rank: 1,
                      name: 'Sunflower Crochet Bouquet',
                      orders: '124 Orders',
                      rev: '₹6,450',
                      badgeColor: 'bg-emerald-500 text-white',
                      img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=120&q=80',
                    },
                    {
                      rank: 2,
                      name: 'Personalised Nikah Frame',
                      orders: '98 Orders',
                      rev: '₹5,320',
                      badgeColor: 'bg-orange-500 text-white',
                      img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=120&q=80',
                    },
                    {
                      rank: 3,
                      name: 'Anti-Tarnish Tennis Bracelet',
                      orders: '76 Orders',
                      rev: '₹4,280',
                      badgeColor: 'bg-amber-500 text-white',
                      img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=120&q=80',
                    },
                    {
                      rank: 4,
                      name: 'Preserved Floral Resin Block',
                      orders: '58 Orders',
                      rev: '₹3,120',
                      badgeColor: 'bg-[#7A1C3B] text-white',
                      img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=120&q=80',
                    },
                    {
                      rank: 5,
                      name: 'Aesthetic Birthday Hamper',
                      orders: '38 Orders',
                      rev: '₹2,280',
                      badgeColor: 'bg-stone-500 text-white',
                      img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=120&q=80',
                    },
                  ].map((item) => (
                    <div key={item.rank} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full ${item.badgeColor} text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
                          {item.rank}
                        </span>
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8E1] flex-shrink-0">
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1C1917] truncate max-w-[130px] sm:max-w-[160px]">
                            {item.name}
                          </p>
                          <span className="text-[11px] text-[#8C827A]">{item.orders}</span>
                        </div>
                      </div>

                      <span className="font-bold text-[#1C1917] tabular-nums whitespace-nowrap">
                        {item.rev}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Order Status Semi-Circle Gauge */}
              <div className="bg-white border border-[#EFE8E1] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-[#F5EFE8] pb-3">
                  <h3 className="font-heading font-normal text-lg text-[#1C1917]">
                    Order Status
                  </h3>
                  <div className="px-2 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#EFE8E1] text-[11px] font-semibold text-[#1C1917] flex items-center gap-1">
                    <span>This Week</span>
                    <ChevronDown className="w-3 h-3 text-[#8C827A]" />
                  </div>
                </div>

                {/* Gauge Semi-Circle Arc SVG */}
                <div className="relative w-48 h-24 mx-auto overflow-hidden flex items-end justify-center">
                  <svg className="w-48 h-48" viewBox="0 0 100 100">
                    {/* Background Semi Circle */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#F5EFE8"
                      strokeWidth="12"
                    />
                    {/* Completed 64% (Green) */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 66 17"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="12"
                    />
                    {/* In Progress 22% (Yellow) */}
                    <path
                      d="M 66 17 A 40 40 0 0 1 85 36"
                      fill="none"
                      stroke="#FBBF24"
                      strokeWidth="12"
                    />
                    {/* Pending 10% (Orange) */}
                    <path
                      d="M 85 36 A 40 40 0 0 1 89 44"
                      fill="none"
                      stroke="#EA580C"
                      strokeWidth="12"
                    />
                    {/* Cancelled 4% (Gray) */}
                    <path
                      d="M 89 44 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="#9CA3AF"
                      strokeWidth="12"
                    />
                  </svg>
                </div>

                {/* Status Breakdown Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-2">
                  <div className="bg-[#FAF7F2] p-2 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-600 block">64%</span>
                    <span className="font-bold text-[#1C1917] block">108</span>
                    <span className="text-[9px] text-[#8C827A] block">Completed</span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-600 block">22%</span>
                    <span className="font-bold text-[#1C1917] block">37</span>
                    <span className="text-[9px] text-[#8C827A] block">Preparing</span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2 rounded-xl">
                    <span className="text-[10px] font-bold text-orange-600 block">10%</span>
                    <span className="font-bold text-[#1C1917] block">17</span>
                    <span className="text-[9px] text-[#8C827A] block">Pending</span>
                  </div>
                  <div className="bg-[#FAF7F2] p-2 rounded-xl">
                    <span className="text-[10px] font-bold text-stone-500 block">04%</span>
                    <span className="font-bold text-[#1C1917] block">6</span>
                    <span className="text-[9px] text-[#8C827A] block">Cancelled</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Business Insights Widget */}
              <div className="bg-white border border-[#EFE8E1] rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center gap-2 border-b border-[#F5EFE8] pb-3">
                  <span className="text-lg">💡</span>
                  <h3 className="font-heading font-normal text-lg text-[#1C1917]">
                    Business Insights
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#FAF7F2] rounded-2xl space-y-1">
                    <span className="text-[10px] font-semibold text-[#8C827A] uppercase block">
                      Revenue
                    </span>
                    <span className="text-sm font-bold text-emerald-600 block">
                      ↑ 8.2%
                    </span>
                    <span className="text-[10px] text-[#8C827A]">vs Yesterday</span>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-2xl space-y-1">
                    <span className="text-[10px] font-semibold text-[#8C827A] uppercase block">
                      Top Item
                    </span>
                    <span className="text-xs font-bold text-[#1C1917] truncate block" title="Sunflower Crochet Bouquet">
                      Sunflower Bouquet
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-2xl space-y-1">
                    <span className="text-[10px] font-semibold text-[#8C827A] uppercase block">
                      Best Seller
                    </span>
                    <span className="text-xs font-bold text-[#1C1917] truncate block" title="Personalised Nikah Frame">
                      Nikah Frame
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] rounded-2xl space-y-1">
                    <span className="text-[10px] font-semibold text-[#8C827A] uppercase block">
                      Peak Hour
                    </span>
                    <span className="text-xs font-bold text-[#1C1917] block">
                      1:00 PM – 2:00 PM
                    </span>
                  </div>
                </div>

                {/* Bottom Encouraging Quote */}
                <div className="p-3.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-2xl text-center">
                  <p className="text-xs font-medium text-[#7A1C3B]">
                    Keep going! You&apos;re performing great today. 🌸
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 1: ORDERS & OMNICHANNEL ORDER MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Top Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-normal text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
                  Central Order Management ({filteredOrders.length} / {orders.length})
                </h2>
                <p className="font-sans text-xs text-[#78716C] mt-0.5">
                  Single source of truth for orders across Website (WhatsApp checkout), Direct WhatsApp, Instagram DMs, and Expo stalls.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualOrderOpen(true)}
                  className="px-4 py-2 bg-[#7A1C3B] hover:bg-[#5a1230] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Manual Sale</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPackingSlipFilter('active');
                    setIsPackingSummaryOpen(true);
                  }}
                  className="px-4 py-2 bg-white border border-[#EFE8E1] hover:bg-[#FAF7F2] text-[#1C1917] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-[#7A1C3B]" />
                  <span>Print Packing Slips</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Notification Alert (Status update, Receipt, Cancellation) */}
            {orderAlertNotice && (
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in ${orderAlertNotice.type === 'cancel'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`w-5 h-5 shrink-0 ${orderAlertNotice.type === 'cancel' ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                  />
                  <div>
                    <strong className="block font-semibold text-sm">{orderAlertNotice.message}</strong>
                    <span className="text-[11px] opacity-80">
                      Customer WhatsApp Phone: <strong>+91 {orderAlertNotice.phone}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={orderAlertNotice.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs text-white flex items-center gap-1.5 transition shadow-xs ${orderAlertNotice.type === 'cancel'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-white" />
                    <span>Open Customer WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setOrderAlertNotice(null)}
                    className="p-1.5 hover:bg-black/5 rounded-full transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-[#EFE8E1] rounded-2xl p-4 shadow-2xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#78716C]">Total Orders</span>
                <div className="font-display text-2xl font-bold text-[#1C1917] mt-1 tabular-nums">
                  {orders.length}
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#EFE8E1] rounded-2xl p-4 shadow-2xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">Pending WhatsApp</span>
                <div className="font-display text-2xl font-bold text-amber-900 mt-1 tabular-nums">
                  {orders.filter((o) => o.status === 'Pending WhatsApp Confirmation').length}
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#EFE8E1] rounded-2xl p-4 shadow-2xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A1C3B]">On Workshop Desk</span>
                <div className="font-display text-2xl font-bold text-[#7A1C3B] mt-1 tabular-nums">
                  {orders.filter((o) => o.status === 'Crafting' || o.status === 'Making').length}
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#EFE8E1] rounded-2xl p-4 shadow-2xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-800">Packed &amp; Sealed</span>
                <div className="font-display text-2xl font-bold text-indigo-900 mt-1 tabular-nums">
                  {orders.filter((o) => o.status === 'Packed & Sealed' || o.status === 'Packed').length}
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#EFE8E1] rounded-2xl p-4 shadow-2xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-800">Dispatched</span>
                <div className="font-display text-2xl font-bold text-sky-900 mt-1 tabular-nums">
                  {orders.filter((o) => o.status === 'Dispatched' || o.status === 'Shipped').length}
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#EFE8E1] rounded-2xl p-4 shadow-2xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">Delivered</span>
                <div className="font-display text-2xl font-bold text-emerald-900 mt-1 tabular-nums">
                  {orders.filter((o) => o.status === 'Delivered').length}
                </div>
              </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="bg-white border border-[#EFE8E1] rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search orders by Order ID (e.g. GVN-849201), Customer Name, Phone, or City..."
                  className="w-full pl-9 pr-3.5 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              {/* Channel Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#f5f5f4] text-xs">
                <span className="text-[#78716c] font-medium mr-1">Channel:</span>
                {[
                  { key: 'all', label: 'All Channels' },
                  { key: 'website', label: '🌐 Website' },
                  { key: 'whatsapp', label: '💬 Direct WhatsApp' },
                  { key: 'instagram', label: '📸 Instagram DM' },
                  { key: 'walkin_expo', label: '🎪 Expo Stall' },
                  { key: 'phone', label: '📞 Phone / In-Person' },
                ].map((ch) => (
                  <button
                    key={ch.key}
                    onClick={() => setOrderChannelFilter(ch.key as 'all' | OrderChannel)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${orderChannelFilter === ch.key
                      ? 'bg-[#7a1c3b] text-white shadow-xs'
                      : 'bg-[#faf7f2] hover:bg-[#f5f5f4] text-[#44403c] border border-[#EFE8E1]'
                      }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-[#78716c] font-medium mr-1">Status:</span>
                {[
                  { key: 'all', label: 'All Status' },
                  { key: 'Pending WhatsApp Confirmation', label: 'Pending WhatsApp' },
                  { key: 'Received', label: 'Received' },
                  { key: 'Crafting', label: 'Crafting' },
                  { key: 'Packed & Sealed', label: 'Packed & Sealed' },
                  { key: 'Dispatched', label: 'Dispatched' },
                  { key: 'Delivered', label: 'Delivered' },
                  { key: 'Cancelled', label: 'Cancelled' },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setOrderStatusFilter(st.key as 'all' | OrderStatus)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${orderStatusFilter === st.key
                      ? 'bg-[#7a1c3b] text-white shadow-xs'
                      : 'bg-[#faf7f2] hover:bg-[#f5f5f4] text-[#44403c] border border-[#EFE8E1]'
                      }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Cards Grid */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white border border-[#EFE8E1] rounded-xl text-xs text-[#78716c]">
                  No orders match the selected filters.
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const channel = order.channel || 'website';
                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-[#EFE8E1] hover:border-[#DFD5CB] hover:shadow-md rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 transition-all duration-300"
                    >
                      {/* Top Row: Order ID, Channel Badge, Date, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f5f5f4] pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-[#7a1c3b]">
                            {order.id}
                          </span>

                          {/* Channel Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${channel === 'website'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : channel === 'whatsapp'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : channel === 'instagram'
                                  ? 'bg-pink-50 text-pink-800 border-pink-300'
                                  : 'bg-purple-50 text-purple-800 border-purple-300'
                              }`}
                          >
                            {channel === 'website'
                              ? '🌐 Website'
                              : channel === 'whatsapp'
                                ? '💬 Direct WhatsApp'
                                : channel === 'instagram'
                                  ? '📸 Instagram DM'
                                  : '🎪 Expo Stall'}
                          </span>

                          <span className="text-xs text-[#78716c] font-mono hidden sm:inline">
                            {new Date(order.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Promise Date Pill */}
                          {order.promiseDate && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                              <Calendar className="w-3 h-3 text-amber-600" />
                              <span>Promise: {order.promiseDate}</span>
                            </span>
                          )}

                          {/* Payment Status Pill */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${order.paymentStatus === 'Fully Paid' || order.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.paymentStatus === 'Advance Paid'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : order.paymentStatus === 'Cash on Delivery'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : order.paymentStatus === 'Expo Cash / UPI'
                                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                                    : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                          >
                            {order.paymentStatus || 'Unpaid'}
                          </span>

                          {/* Status Pill & Quick Changer Dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="px-2 py-1 text-xs font-semibold border border-[#EFE8E1] rounded-lg bg-[#faf7f2] hover:bg-white text-[#1c1917] transition"
                          >
                            <option value="Pending WhatsApp Confirmation">Pending WhatsApp</option>
                            <option value="Received">Received</option>
                            <option value="Crafting">Crafting</option>
                            <option value="Packed & Sealed">Packed &amp; Sealed</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Middle Grid: Customer, Ordered Items, Financial Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-sans">
                        {/* Column 1: Customer Details */}
                        <div>
                          <span className="text-[#a8a29e] uppercase font-semibold text-[10px] tracking-wider">
                            Customer &amp; Shipping
                          </span>
                          <div className="font-semibold text-sm text-[#1c1917] mt-0.5">
                            {order.customerName}
                          </div>
                          <div className="text-[#78716c] font-mono mt-0.5 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#a8a29e]" />
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/\D/g, '').startsWith('91') ? order.customerPhone.replace(/\D/g, '') : '91' + order.customerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                              title="Chat directly with customer on WhatsApp"
                            >
                              <span>+91 {order.customerPhone}</span>
                              <MessageCircle className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                            </a>
                          </div>
                          <div className="text-[#78716c] mt-1 leading-relaxed">
                            {order.address}, {order.city} - {order.pincode}
                          </div>
                          {order.adminNotes && (
                            <div className="mt-1 text-[11px] text-[#853648] bg-[#fbf0f3] p-1.5 rounded border border-[#f5d0dc]">
                              <strong>Note:</strong> {order.adminNotes}
                            </div>
                          )}
                          {order.trackingNumber ? (
                            <div className="mt-2 text-[11px] text-[#7a1c3b] font-medium bg-[#fbf3e4]/60 px-2.5 py-1.5 rounded-lg border border-[#c5a059]/30 flex flex-wrap items-center justify-between gap-1.5">
                              <span>🚚 {order.trackingCourier || 'Courier'}: <strong>{order.trackingNumber}</strong></span>
                              <a
                                href={db.generateStatusWhatsAppUrl(order)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs transition"
                                title="Send tracking WhatsApp to customer"
                              >
                                <MessageCircle className="w-3 h-3 fill-white" />
                                <span>Send to Customer</span>
                              </a>
                            </div>
                          ) : (
                            <div className="mt-2">
                              {editingTrackingOrderId === order.id ? (
                                <div className="p-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg space-y-1.5 text-xs">
                                  <div className="flex gap-1.5">
                                    <select
                                      value={trackingCourier}
                                      onChange={(e) => setTrackingCourier(e.target.value)}
                                      className="px-2 py-1 bg-white border border-[#EFE8E1] rounded text-[11px]"
                                    >
                                      <option value="Delhivery">Delhivery</option>
                                      <option value="ST Courier">ST Courier</option>
                                      <option value="Professional Courier">Professional</option>
                                      <option value="India Post">India Post</option>
                                      <option value="Local Rider">Local Rider</option>
                                      <option value="Other">Other</option>
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="Tracking / AWB #"
                                      value={trackingNumber}
                                      onChange={(e) => setTrackingNumber(e.target.value)}
                                      className="flex-1 px-2 py-1 bg-white border border-[#EFE8E1] rounded text-[11px] font-mono"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setEditingTrackingOrderId(null)}
                                      className="px-2 py-0.5 text-[11px] text-[#78716c] hover:bg-white rounded"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickSaveTracking(order.id)}
                                      disabled={!trackingNumber.trim()}
                                      className="px-2.5 py-0.5 bg-[#7a1c3b] hover:bg-[#5a1230] disabled:opacity-50 text-white font-semibold rounded text-[11px] flex items-center gap-1 cursor-pointer transition"
                                    >
                                      <span>Dispatch &amp; WhatsApp Customer</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTrackingOrderId(order.id);
                                    setTrackingNumber('');
                                  }}
                                  className="text-[11px] text-[#7a1c3b] font-medium bg-[#fdf2f4] hover:bg-[#f6e9ee] border border-[#7a1c3b]/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>+ Upload Tracking &amp; Send to Customer</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Column 2: Items & Personalisation with Product Images */}
                        <div>
                          <span className="text-[#a8a29e] uppercase font-semibold text-[10px] tracking-wider">
                            Ordered Items ({order.items.reduce((acc, it) => acc + it.quantity, 0)})
                          </span>
                          <div className="space-y-2 mt-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="text-xs text-[#44403c] border-b border-[#f5f5f4] pb-2 last:border-b-0 flex gap-2.5 items-start">
                                {it.image && (
                                  <img
                                    src={it.image}
                                    alt={it.productName}
                                    className="w-12 h-12 object-cover rounded-lg border border-[#EFE8E1] shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <span className="font-semibold text-[#1c1917] truncate">
                                      {it.quantity}x {it.productName}
                                    </span>
                                    <span className="font-mono tabular-nums text-[#7a1c3b] font-semibold shrink-0 ml-1">
                                      ₹{it.price * it.quantity}
                                    </span>
                                  </div>
                                  {it.variants && Object.keys(it.variants).length > 0 && (
                                    <div className="text-[10px] text-[#78716c] mt-0.5">
                                      {Object.entries(it.variants).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                                    </div>
                                  )}
                                  {it.personalisation && Object.keys(it.personalisation).length > 0 && (
                                    <div className="text-[11px] text-[#78716c] bg-[#faf7f2] p-1.5 rounded-md mt-1 space-y-0.5 border border-[#EFE8E1]/60">
                                      {Object.entries(it.personalisation).map(([k, v]) => (
                                        <div key={k}>
                                          <strong className="text-[#1c1917]">{k}:</strong> {String(v)}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}

                            {order.giftNote && (
                              <div className="p-2 bg-[#fbf3e4]/50 rounded-lg border border-[#c5a059]/30 text-[11px] text-[#7a1c3b] mt-1.5">
                                <strong>💌 Gift Card:</strong> &ldquo;{order.giftNote}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Column 3: Total & Quick Action Buttons */}
                        <div className="flex flex-col justify-between items-start md:items-end">
                          <div className="w-full md:text-right">
                            <span className="text-[#a8a29e] uppercase font-semibold text-[10px] tracking-wider">
                              Order Total
                            </span>
                            <div className="font-display text-2xl font-bold text-[#7a1c3b] tabular-nums mt-0.5">
                              ₹{order.total}
                            </div>
                            <div className="text-[11px] text-[#78716c]">
                              Subtotal: ₹{order.subtotal} {order.deliveryFee > 0 && `+ Delivery ₹${order.deliveryFee}`}
                              {order.discount ? ` - Disc ₹${order.discount}` : ''}
                            </div>
                          </div>

                          {/* Order Actions */}
                          <div className="mt-4 flex flex-wrap gap-1.5 w-full justify-start md:justify-end">
                            {order.status === 'Pending WhatsApp Confirmation' && (
                              <button
                                type="button"
                                onClick={() => handleConfirmOrderWithNotification(order)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer animate-pulse"
                                title="Confirm order and send confirmation + bill to customer WhatsApp"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Confirm &amp; Send Bill</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenOrderDetail(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EFE8E1] bg-[#faf7f2] hover:bg-white text-xs font-semibold text-[#1c1917] transition shadow-2xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#7a1c3b]" />
                              <span>Details</span>
                            </button>

                            {/* Send Official Receipt on WhatsApp */}
                            <a
                              href={db.generateReceiptWhatsAppUrl(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1db954] text-white text-xs font-bold transition shadow-2xs"
                              title="Send official order receipt & invoice details to customer WhatsApp"
                            >
                              <Receipt className="w-3.5 h-3.5 fill-white text-white" />
                              <span>Send Receipt</span>
                            </a>

                            {/* Send Status Update on WhatsApp */}
                            <a
                              href={db.generateStatusWhatsAppUrl(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold transition shadow-2xs"
                              title="Send prepared status update template to customer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            {/* Cancel Order with WhatsApp Notification */}
                            {order.status !== 'Cancelled' ? (
                              <button
                                type="button"
                                onClick={() => handleCancelOrderWithNotification(order)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition cursor-pointer"
                                title="Cancel order and immediately notify customer on WhatsApp"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-semibold">
                                Cancelled
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setPackingSlipFilter(order.id);
                                setIsPackingSummaryOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EFE8E1] bg-[#faf7f2] hover:bg-white text-xs font-semibold text-[#78716c] transition"
                              title="Print packing slip for this parcel"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Slip</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: PRODUCTS & CRAFTS CATALOGUE */}
        {/* ==================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-[#1c1917] tracking-tight">
                  Products &amp; Crafts Catalogue ({products.length})
                </h2>
                <p className="font-sans text-xs text-[#78716c]">
                  Manage items, catalogue categories, pricing, bouquet availability, and inventory stock.
                </p>
              </div>

              <button
                onClick={() => setIsNewProductOpen(true)}
                className="px-3.5 py-2 bg-[#7a1c3b] hover:bg-[#5a1230] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Craft</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white border border-[#EFE8E1] rounded-xl p-4 shadow-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-[#a8a29e] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search crafts by title, slug, or keywords..."
                    className="w-full pl-9 pr-3.5 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs sm:text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  >
                    <option value="all">All Categories ({realms.length})</option>
                    {realms.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon || '🎀'} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={productStockFilter}
                    onChange={(e) => setProductStockFilter(e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock')}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  >
                    <option value="all">All Stock Statuses</option>
                    <option value="in_stock">In Stock Only</option>
                    <option value="low_stock">Low Stock (≤ 5 units)</option>
                    <option value="out_of_stock">Out of Stock (0 units)</option>
                  </select>
                </div>
              </div>

              {/* Status quick stats */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#f5f5f4] text-xs text-[#78716c]">
                <span>Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> crafts</span>
                <span>·</span>
                <span>In Stock: <strong>{products.filter((p) => (p.stockQuantity ?? (p.inStock ? 15 : 0)) > 0).length}</strong></span>
                <span>·</span>
                <span className="text-amber-700 font-semibold">
                  Low Stock (&le; 5): <strong>{products.filter((p) => (p.stockQuantity ?? 10) <= 5 && (p.stockQuantity ?? 10) > 0).length}</strong>
                </span>
                <span>·</span>
                <span className="text-rose-700 font-semibold">
                  Out of Stock: <strong>{products.filter((p) => (p.stockQuantity ?? 10) <= 0).length}</strong>
                </span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((p) => {
                const stock = p.stockQuantity ?? (p.inStock ? 15 : 0);
                const isLow = stock <= 5 && stock > 0;
                const isOut = stock <= 0;
                const catObj = realms.find((r) => r.id === p.categoryId || r.id === p.realmId);

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-[#EFE8E1] hover:border-[#c5a059]/50 rounded-xl p-4 shadow-xs flex flex-col justify-between transition"
                  >
                    <div>
                      {/* Category and Stock Pill */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-[#7a1c3b] px-2 py-0.5 rounded bg-[#fbf3e4]/60 border border-[#c5a059]/30">
                          {catObj?.icon || '🎀'} {catObj?.name || p.categoryName || p.realmName || 'Craft'}
                        </span>

                        <button
                          onClick={() => handleToggleProductStock(p.id, p.inStock)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition ${!isOut
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          title="Click to toggle availability"
                        >
                          {!isOut ? 'Available' : 'Out of Stock'}
                        </button>
                      </div>

                      {/* Product Thumbnail */}
                      <div className="w-full aspect-square bg-[#faf7f2] rounded-lg border border-[#EFE8E1] p-3 mb-3 flex items-center justify-center overflow-hidden">
                        <img
                          src={p.images?.[0] || '/images/sunflower-bouquet.svg'}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/sunflower-bouquet.svg';
                          }}
                        />
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-display text-base text-[#1c1917] leading-snug">
                        {p.name}
                      </h3>
                      <p className="font-sans text-xs text-[#78716c] line-clamp-2 mt-1">
                        {p.shortDescription || p.description}
                      </p>

                      {/* Price Display (supports ask us) */}
                      <div className="font-display font-bold text-lg text-[#7a1c3b] tabular-nums mt-2">
                        {p.priceType === 'on_request' ? (
                          <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded bg-[#fbf3e4] text-[#7a1c3b] border border-[#c5a059]/30">
                            Price: ask us 💌
                          </span>
                        ) : p.priceType === 'from' || p.priceFrom ? (
                          `From ₹${p.priceFrom || p.price}`
                        ) : p.price ? (
                          `₹${p.price}`
                        ) : (
                          <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded bg-[#fbf3e4] text-[#7a1c3b]">
                            ask us 💌
                          </span>
                        )}
                      </div>

                      {/* Stock Level & Alert */}
                      <div className="text-xs font-sans text-[#78716c] mt-2 flex items-center justify-between">
                        <span>
                          Stock: <strong className="font-mono text-[#1c1917]">{stock} units</strong>
                        </span>
                        {isLow ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                            Only {stock} left ⚠️
                          </span>
                        ) : isOut ? (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                            Sold Out
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                            In Stock
                          </span>
                        )}
                      </div>

                      {/* Bouquet Studio Configuration */}
                      <div className="mt-3 p-2.5 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg space-y-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1c1917]">
                          <input
                            type="checkbox"
                            checked={!!p.bouquetEnabled}
                            onChange={(e) => handleToggleBouquetEnabled(p.id, e.target.checked)}
                            className="rounded text-[#7a1c3b]"
                          />
                          <span>Can go in a bouquet 💐</span>
                        </label>

                        {p.bouquetEnabled && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <label className="block text-[10px] text-[#78716c] font-semibold">Bouquet Price (₹)</label>
                              <input
                                type="number"
                                value={p.bouquetPrice ?? p.price ?? 35}
                                onChange={(e) => handleUpdateProductBouquet(p.id, 'bouquetPrice', Number(e.target.value))}
                                className="w-full px-2 py-1 border border-[#EFE8E1] rounded text-xs bg-white tabular-nums"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-[#78716c] font-semibold">Bouquet Group</label>
                              <select
                                value={p.bouquetGroup ?? 'more'}
                                onChange={(e) => handleUpdateProductBouquet(p.id, 'bouquetGroup', e.target.value as BouquetGroup)}
                                className="w-full px-2 py-1 border border-[#EFE8E1] rounded text-xs bg-white"
                              >
                                <option value="choc">Chocolates</option>
                                <option value="photo">Photos</option>
                                <option value="flower">Flowers</option>
                                <option value="jewel">Bracelets &amp; Chains</option>
                                <option value="more">More Treats</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="mt-4 pt-3 border-t border-[#f5f5f4] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#faf7f2] hover:bg-white border border-[#EFE8E1] text-[#1c1917] font-medium transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#7a1c3b]" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() =>
                            handleOpenStockAdjust({
                              id: p.id,
                              name: p.name,
                              type: 'product',
                              currentStock: stock,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#fbf3e4]/50 hover:bg-[#fbf3e4] border border-[#c5a059]/30 text-[#7a1c3b] font-medium transition"
                          title="Adjust stock and log audit trail"
                        >
                          <span>Stock ±</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="text-[#7a1c3b] hover:underline flex items-center gap-0.5 font-medium"
                          title="Preview in new tab"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: CATEGORIES & SUBCATEGORIES MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'realms' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-[#1c1917] tracking-tight">
                  Product Categories &amp; Subcategories ({realms.length})
                </h2>
                <p className="font-sans text-xs text-[#78716c]">
                  Manage the 14 master categories from Section 8, adjust active status, icons, and sub-collections.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewCategoryOpen(true)}
                className="px-3.5 py-2 bg-[#7a1c3b] hover:bg-[#5a1230] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </button>
            </div>

            {/* Master Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {realms.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id || p.realmId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-white border border-[#EFE8E1] hover:border-[#c5a059]/50 rounded-xl p-4 shadow-xs flex flex-col justify-between transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{cat.icon || '🎀'}</span>
                          <div>
                            <h3 className="font-display text-base text-[#1c1917] font-semibold">{cat.name}</h3>
                            <span className="font-mono text-[10px] text-[#78716c]">slug: {cat.slug}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleCategory(cat.id, cat.isActive !== false)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cat.isActive !== false
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                        >
                          {cat.isActive !== false ? 'Active' : 'Hidden'}
                        </button>
                      </div>

                      <p className="font-sans text-xs text-[#78716c] line-clamp-2 mb-2">
                        {cat.description || 'Catalogue collection for Givento.in gifts.'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-[#78716c] pt-2 border-t border-[#f5f5f4]">
                        <span>Assigned items: <strong className="font-mono text-[#1c1917]">{count}</strong></span>
                        <span className="text-[11px] text-[#a8a29e]">Order: #{cat.sortOrder ?? 1}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#f5f5f4] flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#faf7f2] hover:bg-white border border-[#EFE8E1] text-xs font-medium text-[#1c1917] transition"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#7a1c3b]" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subcategories Management Table */}
            <div className="pt-6 border-t border-[#EFE8E1] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl text-[#1c1917]">
                    Subcategories &amp; Filter Collections ({subcategories.length})
                  </h3>
                  <p className="font-sans text-xs text-[#78716c]">
                    Organise crafts into sub-collections shown as pill filters in shop navigation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewSubcatOpen(true)}
                  className="px-3 py-1.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subcategory</span>
                </button>
              </div>

              <div className="bg-white border border-[#EFE8E1] rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#faf7f2] border-b border-[#EFE8E1] text-[#1c1917] font-semibold">
                      <tr>
                        <th className="p-3">Parent Category</th>
                        <th className="p-3">Subcategory Name</th>
                        <th className="p-3">Slug</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f4]">
                      {subcategories.map((sub) => {
                        const parent = realms.find((r) => r.id === sub.categoryId);
                        return (
                          <tr key={sub.id} className="hover:bg-[#faf7f2]/50">
                            <td className="p-3 font-medium text-[#1c1917]">
                              {parent ? `${parent.icon || '🎀'} ${parent.name}` : sub.categoryId}
                            </td>
                            <td className="p-3 font-semibold text-[#7a1c3b]">{sub.name}</td>
                            <td className="p-3 font-mono text-[11px] text-[#78716c]">{sub.slug}</td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => handleToggleSubcategory(sub.id, sub.isActive)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${sub.isActive
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                                  }`}
                              >
                                {sub.isActive ? 'Active' : 'Hidden'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteSubcategory(sub.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                                title="Delete Subcategory"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: INVENTORY & STOCK AUDIT */}
        {/* ==================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-[#1c1917] tracking-tight">
                  Inventory Desk &amp; Stock Audit Trail
                </h2>
                <p className="font-sans text-xs text-[#78716c]">
                  Monitor stock for crafts, wrapping sheets, and decorations. Log stock in/out, damage, and recounts.
                </p>
              </div>
            </div>

            {/* Inventory Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#EFE8E1] rounded-xl p-4 shadow-xs">
                <span className="font-sans text-xs text-[#78716c]">Total Tracked SKUs</span>
                <div className="font-display text-2xl text-[#1c1917] mt-1 tabular-nums">
                  {allInventoryItems.length}
                </div>
                <span className="text-[10px] text-[#a8a29e]">Products + Sheets + Decorations</span>
              </div>

              <div className="bg-white border border-[#EFE8E1] rounded-xl p-4 shadow-xs">
                <span className="font-sans text-xs text-[#78716c]">Low Stock Warnings (≤ 5)</span>
                <div className="font-display text-2xl text-amber-700 mt-1 tabular-nums">
                  {allInventoryItems.filter((i) => i.stock <= 5 && i.stock > 0).length}
                </div>
                <span className="text-[10px] text-amber-800 font-semibold">Requires replenishment</span>
              </div>

              <div className="bg-white border border-[#EFE8E1] rounded-xl p-4 shadow-xs">
                <span className="font-sans text-xs text-[#78716c]">Out of Stock (0 units)</span>
                <div className="font-display text-2xl text-rose-700 mt-1 tabular-nums">
                  {allInventoryItems.filter((i) => i.stock <= 0).length}
                </div>
                <span className="text-[10px] text-rose-800 font-semibold">Unavailable on store</span>
              </div>

              <div className="bg-white border border-[#EFE8E1] rounded-xl p-4 shadow-xs">
                <span className="font-sans text-xs text-[#78716c]">Audit Log Records</span>
                <div className="font-display text-2xl text-[#7a1c3b] mt-1 tabular-nums">
                  {inventoryTx.length}
                </div>
                <span className="text-[10px] text-[#78716c]">All-time stock changes</span>
              </div>
            </div>

            {/* Live Stock Adjustment Desk */}
            <div className="bg-white border border-[#EFE8E1] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-display text-lg text-[#1c1917]">
                  Stock Quantities &amp; Adjustment Actions
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#a8a29e] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Search SKUs..."
                      className="pl-8 pr-3 py-1.5 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b]"
                    />
                  </div>

                  <select
                    value={inventoryTypeFilter}
                    onChange={(e) => setInventoryTypeFilter(e.target.value as 'all' | 'product' | 'wrapping_sheet' | 'decoration')}
                    className="px-2.5 py-1.5 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none"
                  >
                    <option value="all">All Item Types</option>
                    <option value="product">Products only</option>
                    <option value="wrapping_sheet">Wrapping Sheets only</option>
                    <option value="decoration">Decorations only</option>
                  </select>

                  <select
                    value={inventoryStatusFilter}
                    onChange={(e) => setInventoryStatusFilter(e.target.value as 'all' | 'low_stock' | 'out_of_stock')}
                    className="px-2.5 py-1.5 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="low_stock">Low Stock (≤ 5)</option>
                    <option value="out_of_stock">Out of Stock (0)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#faf7f2] border-b border-[#EFE8E1] text-[#1c1917] font-semibold">
                    <tr>
                      <th className="p-3">SKU Name</th>
                      <th className="p-3">Type / Category</th>
                      <th className="p-3">Current Stock</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Adjustment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5f5f4]">
                    {filteredInventory.map((item) => {
                      const isLow = item.stock <= 5 && item.stock > 0;
                      const isOut = item.stock <= 0;
                      return (
                        <tr key={`${item.type}-${item.id}`} className="hover:bg-[#faf7f2]/50">
                          <td className="p-3 font-medium text-[#1c1917]">
                            {item.name}
                          </td>
                          <td className="p-3 text-[#78716c] capitalize">
                            {item.type.replace('_', ' ')} · {item.category}
                          </td>
                          <td className="p-3 font-display font-bold text-sm tabular-nums text-[#1c1917]">
                            {item.stock} units
                          </td>
                          <td className="p-3">
                            {isOut ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-300">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                                Only {item.stock} left ⚠️
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                In Stock
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenStockAdjust({
                                  id: item.id,
                                  name: item.name,
                                  type: item.type,
                                  currentStock: item.stock,
                                })
                              }
                              className="px-2.5 py-1 bg-[#faf7f2] hover:bg-[#fbf3e4] hover:text-[#7a1c3b] border border-[#EFE8E1] rounded text-xs font-medium text-[#1c1917] transition"
                            >
                              Adjust with Reason
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Audit Log Trail */}
            <div className="bg-white border border-[#EFE8E1] rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#7a1c3b]" />
                <h3 className="font-display text-lg text-[#1c1917]">
                  Stock Audit Trail Log ({inventoryTx.length})
                </h3>
              </div>
              <p className="font-sans text-xs text-[#78716c]">
                Permanent historical record of manual restocks, order decrements, damage write-offs, and counts.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#faf7f2] border-b border-[#EFE8E1] text-[#1c1917] font-semibold">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Quantity Delta</th>
                      <th className="p-3">Audit Reason</th>
                      <th className="p-3">Reference / Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5f5f4]">
                    {inventoryTx.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-[#78716c]">
                          No inventory adjustments logged yet.
                        </td>
                      </tr>
                    ) : (
                      inventoryTx.map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#faf7f2]/50">
                          <td className="p-3 text-[#78716c] font-mono text-[11px]">
                            {new Date(tx.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="p-3 font-semibold text-[#1c1917]">{tx.itemName}</td>
                          <td className="p-3 capitalize text-[#78716c]">{tx.itemType.replace('_', ' ')}</td>
                          <td className="p-3 font-display font-bold text-sm tabular-nums">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${tx.changeQuantity > 0
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-rose-50 text-rose-800'
                                }`}
                            >
                              {tx.changeQuantity > 0 ? `+${tx.changeQuantity}` : tx.changeQuantity}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] capitalize text-[#7a1c3b]">
                            {tx.reason.replace(/_/g, ' ')}
                          </td>
                          <td className="p-3 text-[#78716c]">{tx.referenceId || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: CUSTOM BULK REQUESTS */}
        {/* ==================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl text-[#1c1917]">
                Custom Order &amp; Bulk Favours Requests ({requests.length})
              </h2>
              <p className="font-sans text-xs text-[#78716c]">
                Customer inquiries for wedding favours, birthday return hampers, and custom creations.
              </p>
            </div>

            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white border border-[#EFE8E1] rounded-xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f5f5f4] pb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-base text-[#1c1917] font-semibold">
                        {req.customerName}
                      </span>
                      <span className="text-xs text-[#78716c] font-mono">
                        {req.customerPhone}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fbf3e4] text-[#7a1c3b]">
                      {req.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#a8a29e] font-semibold text-[10px]">Event Type:</span>
                      <p className="font-medium text-[#1c1917] capitalize">{req.eventType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-[#a8a29e] font-semibold text-[10px]">Quantity / Budget:</span>
                      <p className="font-medium text-[#1c1917]">{req.quantity} pcs · {req.budgetRange || (req.budget ? `₹${req.budget}` : 'Flexible')}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#44403c] bg-[#faf7f2] p-3 rounded-lg border border-[#EFE8E1]">
                    &ldquo;{req.notes || req.description || 'Special custom request'}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: COUPONS & SITE SETTINGS */}
        {/* ==================================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#EFE8E1] rounded-2xl p-5 shadow-xs">
              <div>
                <h2 className="font-display font-normal text-2xl text-[#1C1917] tracking-tight flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#7A1C3B]" />
                  <span>Coupons &amp; Promotional Codes</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F6E9EE] text-[#7A1C3B] text-xs font-bold">
                    {coupons.length}
                  </span>
                </h2>
                <p className="font-sans text-xs text-[#78716C] mt-0.5">
                  Create discount codes for festive campaigns, WhatsApp broadcasts, and return gifts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewCouponOpen(true)}
                className="px-4 py-2.5 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Coupon</span>
              </button>
            </div>

            {coupons.length === 0 ? (
              <div className="bg-white border border-dashed border-[#EFE8E1] rounded-2xl p-10 text-center space-y-3">
                <Tag className="w-10 h-10 text-[#C5A059] mx-auto opacity-50" />
                <h3 className="font-heading text-lg text-[#1C1917]">No active coupons found</h3>
                <p className="text-xs text-[#78716C]">Create your first discount promo code to reward loyal customers.</p>
                <button
                  type="button"
                  onClick={() => setIsNewCouponOpen(true)}
                  className="px-4 py-2 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Coupon</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.id || c.code} className="bg-white border border-[#EFE8E1] rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 group hover:border-[#7A1C3B]/40 transition">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-mono font-bold text-sm tracking-wider text-[#7A1C3B] bg-[#FBF3E4] px-2.5 py-1 rounded-lg border border-[#C5A059]/30">
                          {c.code}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'}`}>
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <div className="text-base font-bold text-[#1C1917]">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                        </div>
                        <p className="text-xs text-[#78716C] mt-0.5">{c.description || `Min order ₹${c.minOrder}`}</p>
                        <p className="text-[11px] text-[#A89F91] mt-1">Min. cart value: ₹{c.minOrder}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#EFE8E1] text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleCoupon(c.code)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border transition cursor-pointer ${c.isActive
                          ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          }`}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.code)}
                        className="text-xs text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Coupon Modal */}
            {isNewCouponOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-[#EFE8E1] space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#EFE8E1] pb-3">
                    <h3 className="font-heading font-normal text-xl text-[#1C1917] flex items-center gap-2">
                      <Tag className="w-5 h-5 text-[#7A1C3B]" />
                      <span>Create New Coupon</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsNewCouponOpen(false)}
                      className="text-[#8C827A] hover:text-[#1C1917] p-1 rounded-full hover:bg-[#FAF7F2] cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddCoupon} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Coupon Promo Code <span className="text-[#B3261E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. FESTIVE20, WELCOME10"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#1C1917] focus:outline-none focus:border-[#7A1C3B] focus:ring-2 focus:ring-[#7A1C3B]/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-[#1C1917]">
                          Discount Type
                        </label>
                        <select
                          value={newCouponDiscountType}
                          onChange={(e) => setNewCouponDiscountType(e.target.value as 'percentage' | 'flat')}
                          className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#7A1C3B]"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-[#1C1917]">
                          Value ({newCouponDiscountType === 'percentage' ? '%' : '₹'}) <span className="text-[#B3261E]">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={newCouponDiscountValue}
                          onChange={(e) => setNewCouponDiscountValue(Number(e.target.value))}
                          placeholder="e.g. 10 or 150"
                          className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#7A1C3B]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Minimum Order Value (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newCouponMinOrder}
                        onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                        placeholder="e.g. 499"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#7A1C3B]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#1C1917]">
                        Coupon Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={newCouponDescription}
                        onChange={(e) => setNewCouponDescription(e.target.value)}
                        placeholder="e.g. 15% discount on all keepsake gifts"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EFE8E1] rounded-xl text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#7A1C3B]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFE8E1]">
                      <button
                        type="button"
                        onClick={() => setIsNewCouponOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-[#EFE8E1] text-xs font-semibold text-[#6A5B60] hover:bg-[#FAF7F2] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#7A1C3B] hover:bg-[#5A1230] text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Create Coupon
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: BOUQUET STUDIO & WRAPPING SHEETS */}
        {/* ==================================================== */}
        {activeTab === 'sheets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-[#1c1917]">
                  Custom Studios &amp; Options Engine
                </h2>
                <p className="font-sans text-xs text-[#78716c]">
                  Manage bouquet wrapping sheets, bouquet sizes, decorations, and options for Resin, Frames &amp; Hampers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSheetOpen(true)}
                  className="px-3 py-1.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewDecOpen(true)}
                  className="px-3 py-1.5 bg-[#c5a059] hover:bg-[#966f21] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Decoration</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewCustOptionOpen(true)}
                  className="px-3 py-1.5 bg-[#1c1917] hover:bg-[#292524] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Option</span>
                </button>
              </div>
            </div>

            {/* Studio Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[#78716c] font-semibold mr-1">Filter Studio:</span>
              {[
                { id: 'all', label: 'All Studios' },
                { id: 'bouquet', label: '🌸 Bouquet Studio' },
                { id: 'resin', label: '✨ Resin Art' },
                { id: 'frame', label: '🖼️ Frames' },
                { id: 'hamper', label: '🎀 Hampers' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCustStudioFilter(f.id as 'all' | 'bouquet' | 'resin' | 'frame' | 'hamper')}
                  className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${custStudioFilter === f.id
                    ? 'bg-[#7a1c3b] text-white font-bold shadow-xs'
                    : 'bg-white border border-[#EFE8E1] text-[#44403c] hover:bg-[#faf7f2]'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* SECTION 1: WRAPPING SHEETS (Bouquet) */}
            {(custStudioFilter === 'all' || custStudioFilter === 'bouquet') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-[#1c1917] flex items-center gap-2">
                    <span>Bouquet Wrapping Sheets</span>
                    <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-[#fbf3e4] text-[#7a1c3b] font-bold">
                      {sheets.length}
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sheets.map((s) => (
                    <div key={s.id} className="bg-white border border-[#EFE8E1] rounded-xl p-3.5 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded border border-black/20"
                            style={{ backgroundColor: s.base }}
                          />
                          <span className="font-display text-sm font-bold text-[#1c1917]">{s.name}</span>
                        </div>
                        <span className="font-mono font-bold text-[#7a1c3b] text-sm tabular-nums">₹{s.price}</span>
                      </div>
                      <div className="text-xs text-[#78716c] flex justify-between items-center">
                        <span>Stock: <strong>{s.stock} units</strong></span>
                        <button
                          onClick={() => handleToggleSheetActive(s.id, s.active)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${s.active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                        >
                          {s.active ? 'In Stock' : 'Hidden'}
                        </button>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-[#f5f5f4]">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenStockAdjust({
                              id: s.id,
                              name: `${s.name} (Wrapping Sheet)`,
                              type: 'wrapping_sheet',
                              currentStock: s.stock,
                            })
                          }
                          className="px-2 py-1 text-xs bg-[#faf7f2] hover:bg-[#fbf3e4] rounded border border-[#EFE8E1] text-[#1c1917]"
                        >
                          Stock ±
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSheet(s.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: BOUQUET SIZES */}
            {(custStudioFilter === 'all' || custStudioFilter === 'bouquet') && (
              <div className="space-y-3">
                <h3 className="font-display text-lg text-[#1c1917] flex items-center gap-2">
                  <span>Bouquet Sizes &amp; Piece Ceilings</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {bouquetSizes.map((sz) => (
                    <div key={sz.id} className="bg-white border border-[#EFE8E1] rounded-xl p-3.5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-bold text-[#1c1917]">{sz.name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSizeActive(sz.id, sz.isActive)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${sz.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                        >
                          {sz.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-[#78716c] block">Max Pieces:</label>
                          <input
                            type="number"
                            defaultValue={sz.maxPieces}
                            onBlur={(e) => handleUpdateSize(sz.id, { maxPieces: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-[#EFE8E1] rounded text-xs bg-[#faf7f2]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#78716c] block">Base Charge (₹):</label>
                          <input
                            type="number"
                            defaultValue={sz.baseCharge}
                            onBlur={(e) => handleUpdateSize(sz.id, { baseCharge: Number(e.target.value) })}
                            className="w-full px-2 py-1 border border-[#EFE8E1] rounded text-xs bg-[#faf7f2]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: BOUQUET DECORATIONS */}
            {(custStudioFilter === 'all' || custStudioFilter === 'bouquet') && (
              <div className="space-y-3">
                <h3 className="font-display text-lg text-[#1c1917] flex items-center gap-2">
                  <span>Bouquet Decorations (Bows, Lights, Crown, Cards)</span>
                  <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-[#fbf3e4] text-[#7a1c3b] font-bold">
                    {decorations.length}
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {decorations.map((dec) => (
                    <div key={dec.id} className="bg-white border border-[#EFE8E1] rounded-xl p-3 shadow-xs flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-display text-sm font-bold text-[#1c1917] block truncate">{dec.name}</span>
                        <span className="text-xs text-[#78716c]">Stock: {dec.stock} | ₹{dec.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleDecActive(dec.id, dec.isActive)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${dec.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                        >
                          {dec.isActive ? 'Active' : 'Hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenStockAdjust({
                              id: dec.id,
                              name: `${dec.name} (Decoration)`,
                              type: 'decoration',
                              currentStock: dec.stock,
                            })
                          }
                          className="px-2 py-1 text-xs bg-[#faf7f2] hover:bg-[#fbf3e4] rounded border border-[#EFE8E1] text-[#1c1917]"
                        >
                          Stock ±
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: RESIN, FRAME & HAMPER OPTIONS */}
            {(custStudioFilter === 'all' || custStudioFilter !== 'bouquet') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-[#1c1917]">
                    Customization Options (Resin, Frames &amp; Hampers)
                  </h3>
                  <span className="text-xs text-[#78716c]">
                    {custOptions.filter((o) => custStudioFilter === 'all' || o.typeId === custStudioFilter).length} options configured
                  </span>
                </div>

                <div className="bg-white border border-[#EFE8E1] rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-[#faf7f2] border-b border-[#EFE8E1] text-[#78716c] uppercase text-[10px] font-semibold tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Studio</th>
                          <th className="py-2.5 px-3">Group</th>
                          <th className="py-2.5 px-3">Option Name</th>
                          <th className="py-2.5 px-3">Price Modifier</th>
                          <th className="py-2.5 px-3">Stock</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f5f5f4]">
                        {custOptions
                          .filter((o) => custStudioFilter === 'all' || o.typeId === custStudioFilter)
                          .map((opt) => (
                            <tr key={opt.id} className="hover:bg-[#faf7f2]/50">
                              <td className="py-2 px-3 font-semibold capitalize text-[#7a1c3b]">
                                {opt.typeId}
                              </td>
                              <td className="py-2 px-3 font-mono text-[11px] text-[#78716c]">
                                {opt.groupName}
                              </td>
                              <td className="py-2 px-3 font-medium text-[#1c1917]">
                                {opt.name}
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-[#7a1c3b]">
                                {opt.priceModifier > 0 ? `+₹${opt.priceModifier}` : '₹0 (Included)'}
                              </td>
                              <td className="py-2 px-3 tabular-nums font-semibold">
                                {opt.stock}
                              </td>
                              <td className="py-2 px-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCustOptionActive(opt.id, opt.isActive)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${opt.isActive
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-rose-50 text-rose-800 border-rose-300'
                                    }`}
                                >
                                  {opt.isActive ? 'Active' : 'Disabled'}
                                </button>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustOption(opt.id)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: BOUQUET SETTINGS */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl text-[#1c1917]">
                Bouquet Studio Rules &amp; Limits
              </h2>
              <p className="font-sans text-xs text-[#78716c]">
                Configure builder limits, piece ceilings, and operational settings.
              </p>
            </div>

            <div className="bg-white border border-[#EFE8E1] rounded-xl p-5 shadow-xs space-y-4 max-w-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.builderSettings?.builderEnabled ?? true}
                  onChange={handleToggleBuilderEnabled}
                  className="rounded text-[#7a1c3b]"
                />
                <span className="font-medium text-sm text-[#1c1917]">
                  Enable Build Your Own Bouquet Studio
                </span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Default Maximum Pieces Limit:
                </label>
                <input
                  type="number"
                  defaultValue={settings?.builderSettings?.maxPieces ?? 12}
                  onBlur={(e) => handleUpdateMaxPieces(Number(e.target.value))}
                  className="w-32 px-3 py-1.5 border border-[#EFE8E1] rounded-lg text-sm bg-white tabular-nums"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 9: PROFIT & ANALYTICS */}
        {/* ==================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Header & CSV Export Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#EFE8E1] rounded-2xl p-5 shadow-xs">
              <div>
                <h2 className="font-display text-2xl text-[#1c1917] tracking-tight">
                  Sales, COGS &amp; Artisan Profit Analytics
                </h2>
                <p className="font-sans text-xs text-[#78716c] mt-0.5">
                  Studio financial accounting, raw materials COGS, omnichannel sales breakdown, and instant CSV exports.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportOrdersCsv}
                  className="px-3 py-1.5 bg-[#faf7f2] hover:bg-[#f5ece1] text-[#7a1c3b] border border-[#EFE8E1] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  title="Export orders ledger to CSV spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Orders CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportExpensesCsv}
                  className="px-3 py-1.5 bg-[#faf7f2] hover:bg-[#f5ece1] text-[#7a1c3b] border border-[#EFE8E1] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  title="Export studio expenses to CSV spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Expenses CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportProfitCsv}
                  className="px-3 py-1.5 bg-[#faf7f2] hover:bg-[#f5ece1] text-[#7a1c3b] border border-[#EFE8E1] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  title="Export complete financial & profit summary to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Profit Summary CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewExpenseOpen(true)}
                  className="px-3.5 py-1.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Studio Expense</span>
                </button>
              </div>
            </div>

            {/* Date Range Filter Bar */}
            <div className="bg-white border border-[#EFE8E1] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-[#1c1917] mr-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Period:</span>
                </span>
                {(
                  [
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: 'month', label: 'This Month' },
                    { id: 'quarter', label: 'This Quarter' },
                    { id: 'year', label: 'This Year' },
                    { id: 'custom', label: 'Custom Range' },
                  ] as const
                ).map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => handleFilterDateRange(range.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${analyticsDateRange === range.id
                      ? 'bg-[#7a1c3b] text-white font-semibold'
                      : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f5eee6] border border-[#EFE8E1]'
                      }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {analyticsDateRange === 'custom' && (
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="date"
                    value={analyticsCustomStart}
                    onChange={(e) => setAnalyticsCustomStart(e.target.value)}
                    className="px-2.5 py-1 border border-[#EFE8E1] rounded-lg bg-[#faf7f2] text-xs"
                  />
                  <span className="text-[#78716c]">to</span>
                  <input
                    type="date"
                    value={analyticsCustomEnd}
                    onChange={(e) => setAnalyticsCustomEnd(e.target.value)}
                    className="px-2.5 py-1 border border-[#EFE8E1] rounded-lg bg-[#faf7f2] text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomDateRange}
                    className="px-3 py-1 bg-[#c5a059] hover:bg-[#966e24] text-white rounded-lg text-xs font-semibold cursor-pointer transition"
                  >
                    Filter
                  </button>
                </div>
              )}
            </div>

            {/* 6 Key Financial Overview Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {/* 1. Gross Revenue */}
              <div className="bg-white border border-[#EFE8E1] rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-medium text-[#78716c] block">Gross Revenue</span>
                <div className="font-display text-2xl text-[#1c1917] mt-0.5 tabular-nums">
                  ₹{profitSummary?.grossRevenue ?? 0}
                </div>
                <span className="text-[10px] text-[#78716c] mt-1 block">
                  {profitSummary?.totalOrders ?? 0} orders fulfilled
                </span>
              </div>

              {/* 2. COGS */}
              <div className="bg-white border border-[#EFE8E1] rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-medium text-[#78716c] block">COGS (Materials)</span>
                <div className="font-display text-2xl text-amber-800 mt-0.5 tabular-nums">
                  ₹{profitSummary?.cogs ?? 0}
                </div>
                <span className="text-[10px] text-[#78716c] mt-1 block">
                  Paper, flowers, resin, boxes
                </span>
              </div>

              {/* 3. Gross Margin */}
              <div className="bg-white border border-[#EFE8E1] rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-medium text-[#78716c] block">Gross Profit</span>
                <div className="font-display text-2xl text-emerald-800 mt-0.5 tabular-nums">
                  ₹{profitSummary?.grossProfit ?? 0}
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">
                  {profitSummary?.grossMarginPercentage ?? 0}% gross margin
                </span>
              </div>

              {/* 4. Operating Expenses */}
              <div className="bg-white border border-[#EFE8E1] rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-medium text-[#78716c] block">Studio Overheads</span>
                <div className="font-display text-2xl text-rose-700 mt-0.5 tabular-nums">
                  ₹{profitSummary?.operatingExpenses ?? 0}
                </div>
                <span className="text-[10px] text-[#78716c] mt-1 block">
                  Tools, ads, expo stall fees
                </span>
              </div>

              {/* 5. Net Artisan Profit */}
              <div className="bg-white border-2 border-emerald-600/30 rounded-xl p-3.5 shadow-xs bg-emerald-50/20">
                <span className="text-[11px] font-bold text-emerald-900 block">Net Artisan Profit</span>
                <div className="font-display text-2xl text-emerald-700 mt-0.5 tabular-nums font-bold">
                  ₹{profitSummary?.netProfit ?? 0}
                </div>
                <span className="text-[10px] font-bold text-emerald-800 mt-1 block">
                  {profitSummary?.profitMarginPercentage ?? 0}% net profit margin
                </span>
              </div>

              {/* 6. AOV */}
              <div className="bg-white border border-[#EFE8E1] rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-medium text-[#78716c] block">Avg Order Value</span>
                <div className="font-display text-2xl text-[#7a1c3b] mt-0.5 tabular-nums">
                  ₹{profitSummary?.averageOrderValue ?? 0}
                </div>
                <span className="text-[10px] text-[#78716c] mt-1 block">
                  Per customer order
                </span>
              </div>
            </div>

            {/* Top Performers & Omnichannel Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Top Products & Crafts */}
              <div className="bg-white border border-[#EFE8E1] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#f0ece9] pb-3">
                  <h3 className="font-display text-lg text-[#1c1917]">Top-Selling Crafts &amp; Add-ons</h3>
                  <span className="text-xs text-[#78716c]">By units and revenue</span>
                </div>

                <div className="space-y-2.5">
                  {(profitSummary?.topProducts || []).length === 0 ? (
                    <p className="text-xs text-[#78716c] italic">No product sales in selected period.</p>
                  ) : (
                    (profitSummary?.topProducts || []).map((tp, idx: number) => (
                      <div
                        key={tp.productId}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#faf7f2] border border-[#EFE8E1]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#fbf3e4] text-[#7a1c3b] font-bold text-[10px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-medium text-[#1c1917] truncate max-w-[200px] sm:max-w-xs">
                            {tp.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#1c1917] tabular-nums block">₹{tp.totalRevenue}</span>
                          <span className="text-[10px] text-[#78716c]">{tp.unitsSold} units sold</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Wrapping Sheets & Add-ons breakdown */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="border border-[#EFE8E1] rounded-lg p-3 bg-[#fffaf5]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a1c3b] block mb-2">
                      Popular Wrapping Sheets
                    </span>
                    <div className="space-y-1.5">
                      {(profitSummary?.topSheets || []).slice(0, 3).map((ts) => (
                        <div key={ts.name} className="flex justify-between text-[11px]">
                          <span className="text-[#44403c] truncate">{ts.name}</span>
                          <span className="font-bold text-[#1c1917] tabular-nums">{ts.usesCount} bouquets</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-[#EFE8E1] rounded-lg p-3 bg-[#fffaf5]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] block mb-2">
                      Top Add-ons &amp; Embellishments
                    </span>
                    <div className="space-y-1.5">
                      {(profitSummary?.topAddons || []).slice(0, 3).map((ta) => (
                        <div key={ta.name} className="flex justify-between text-[11px]">
                          <span className="text-[#44403c] truncate">{ta.name}</span>
                          <span className="font-bold text-[#1c1917] tabular-nums">{ta.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Omnichannel Performance */}
              <div className="bg-white border border-[#EFE8E1] rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#f0ece9] pb-3">
                  <h3 className="font-display text-lg text-[#1c1917]">Omnichannel Sales Performance</h3>
                  <span className="text-xs text-[#78716c]">Website, WhatsApp, Instagram, Expo</span>
                </div>

                <div className="space-y-4 pt-1">
                  {(
                    [
                      { key: 'website', label: 'Website Storefront', color: 'bg-[#7a1c3b]' },
                      { key: 'whatsapp', label: 'WhatsApp Direct Orders', color: 'bg-emerald-600' },
                      { key: 'instagram', label: 'Instagram DM Studio Sales', color: 'bg-pink-600' },
                      { key: 'walkin_expo', label: 'Expo & Exhibition Stall', color: 'bg-[#c5a059]' },
                    ] as const
                  ).map((ch) => {
                    const stats = profitSummary?.revenueByChannel?.[ch.key] || {
                      revenue: 0,
                      orderCount: 0,
                      percentage: 0,
                    };
                    const percentage = typeof stats === 'object' ? stats.percentage : 0;
                    const revenue = typeof stats === 'object' ? stats.revenue : stats;
                    const orderCount = typeof stats === 'object' ? stats.orderCount : 0;

                    return (
                      <div key={ch.key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#1c1917] flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${ch.color}`} />
                            {ch.label}
                          </span>
                          <div className="text-right">
                            <span className="font-bold text-[#1c1917] tabular-nums">₹{revenue}</span>
                            <span className="text-[10px] text-[#78716c] ml-2">
                              ({orderCount} orders · {percentage}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-[#f5f5f4] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${ch.color} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expenses by Category Breakdown */}
                <div className="mt-4 pt-3 border-t border-[#f0ece9]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] block mb-2">
                    Expenses Category Breakdown
                  </span>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {Object.entries(profitSummary?.expensesByCategory || {}).map(([cat, amt]) => (
                      <div
                        key={cat}
                        className="px-2.5 py-1 rounded-lg bg-[#faf7f2] border border-[#EFE8E1] flex items-center gap-1.5"
                      >
                        <span className="capitalize text-[#44403c]">{cat.replace(/_/g, ' ')}:</span>
                        <span className="font-bold text-rose-700 tabular-nums">₹{amt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Order Unit Economics Ledger (Section 8) */}
            <div className="bg-white border border-[#EFE8E1] rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0ece9] pb-3">
                <div>
                  <h3 className="font-display text-lg text-[#1c1917]">Per-Order Profitability Ledger</h3>
                  <p className="text-xs text-[#78716c]">
                    Unit economics per order: Sale price minus shipping cost, packing cost, materials COGS, and commission.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#7a1c3b] bg-[#fbf3e4] px-2.5 py-1 rounded-full">
                  {(profitSummary?.perOrderProfits || []).length} orders analyzed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EFE8E1] text-[#78716c] font-medium bg-[#faf7f2]">
                      <th className="py-2.5 px-3">Order ID &amp; Date</th>
                      <th className="py-2.5 px-3">Customer &amp; Channel</th>
                      <th className="py-2.5 px-3 text-right">Sale Price</th>
                      <th className="py-2.5 px-3 text-right">Delivery Fee</th>
                      <th className="py-2.5 px-3 text-right">Materials Cost</th>
                      <th className="py-2.5 px-3 text-right">Packing Box</th>
                      <th className="py-2.5 px-3 text-right">Courier Incurred</th>
                      <th className="py-2.5 px-3 text-right">Net Profit</th>
                      <th className="py-2.5 px-3 text-center">Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5f5f4]">
                    {(profitSummary?.perOrderProfits || []).length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-xs text-[#78716c]">
                          No order transactions recorded for this period.
                        </td>
                      </tr>
                    ) : (
                      (profitSummary?.perOrderProfits || []).map((po) => (
                        <tr key={po.orderId} className="hover:bg-[#fffdfa] transition">
                          <td className="py-2 px-3">
                            <span className="font-mono font-bold text-[#7a1c3b] block">{po.orderId}</span>
                            <span className="text-[10px] text-[#78716c]">{po.date}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-medium text-[#1c1917] block">{po.customerName}</span>
                            <span className="text-[10px] capitalize text-[#78716c]">{po.channel.replace(/_/g, ' ')}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-bold tabular-nums text-[#1c1917]">
                            ₹{po.salePrice}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-[#78716c]">
                            ₹{po.deliveryFee}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-amber-800">
                            -₹{po.materialsCost}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-amber-800">
                            -₹{po.packingCost}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-rose-700">
                            -₹{po.shippingCost}
                          </td>
                          <td className="py-2 px-3 text-right font-bold tabular-nums text-emerald-700">
                            ₹{po.grossProfit}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${po.grossMarginPercentage >= 50
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                            >
                              {po.grossMarginPercentage}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Studio Operational Expenses Ledger */}
            <div className="bg-white border border-[#EFE8E1] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0ece9] pb-3">
                <div>
                  <h3 className="font-display text-lg text-[#1c1917]">Studio Operational Expenses Ledger</h3>
                  <p className="text-xs text-[#78716c]">
                    Track purchases for raw materials, packaging, tools, marketing, and expo stall costs.
                  </p>
                </div>

                {/* Filter by Category */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-bold text-[#78716c] mr-1">Filter:</span>
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'raw_materials', label: 'Materials' },
                      { id: 'packaging', label: 'Packaging' },
                      { id: 'marketing_ads', label: 'Marketing' },
                      { id: 'shipping_courier', label: 'Courier' },
                      { id: 'studio_tools', label: 'Tools' },
                      { id: 'expo_fees', label: 'Expo Fees' },
                    ] as const
                  ).map((cf) => (
                    <button
                      key={cf.id}
                      type="button"
                      onClick={() => setExpenseFilterCategory(cf.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer ${expenseFilterCategory === cf.id
                        ? 'bg-[#7a1c3b] text-white font-semibold'
                        : 'bg-[#faf7f2] text-[#44403c] hover:bg-[#f5ece1]'
                        }`}
                    >
                      {cf.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EFE8E1] text-[#78716c] font-medium bg-[#faf7f2]">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Title / Description</th>
                      <th className="py-2 px-3">Notes</th>
                      <th className="py-2 px-3 text-right">Amount (₹)</th>
                      <th className="py-2 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5f5f4]">
                    {expenses
                      .filter((e) =>
                        expenseFilterCategory === 'all'
                          ? true
                          : e.category === expenseFilterCategory ||
                          (expenseFilterCategory === 'marketing_ads' && (e.category === 'marketing')) ||
                          (expenseFilterCategory === 'shipping_courier' && (e.category === 'courier_dispatch'))
                      )
                      .length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-xs text-[#78716c]">
                          No expense records found in this category.
                        </td>
                      </tr>
                    ) : (
                      expenses
                        .filter((e) =>
                          expenseFilterCategory === 'all'
                            ? true
                            : e.category === expenseFilterCategory ||
                            (expenseFilterCategory === 'marketing_ads' && (e.category === 'marketing')) ||
                            (expenseFilterCategory === 'shipping_courier' && (e.category === 'courier_dispatch'))
                        )
                        .map((exp) => (
                          <tr key={exp.id} className="hover:bg-[#fffdfa] transition">
                            <td className="py-2 px-3 font-mono text-[11px] text-[#78716c] whitespace-nowrap">
                              {exp.expenseDate}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              {exp.category === 'raw_materials' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  Raw Materials
                                </span>
                              )}
                              {exp.category === 'packaging' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                                  Packaging
                                </span>
                              )}
                              {(exp.category === 'marketing_ads' || exp.category === 'marketing') && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                                  Marketing &amp; Ads
                                </span>
                              )}
                              {(exp.category === 'shipping_courier' || exp.category === 'courier_dispatch') && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                                  Shipping/Courier
                                </span>
                              )}
                              {exp.category === 'studio_tools' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                                  Studio Tools
                                </span>
                              )}
                              {exp.category === 'expo_fees' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                                  Expo Stall
                                </span>
                              )}
                              {(exp.category === 'miscellaneous' || exp.category === 'rent_utilities' || exp.category === 'other') && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                                  Miscellaneous
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-medium text-[#1c1917]">{exp.title}</td>
                            <td className="py-2 px-3 text-[#78716c] text-[11px] max-w-xs truncate">
                              {exp.notes || '—'}
                            </td>
                            <td className="py-2 px-3 text-right font-bold tabular-nums text-rose-700 whitespace-nowrap">
                              -₹{exp.amount}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteExpense(exp.id, exp.title)}
                                className="p-1 text-[#78716c] hover:text-rose-600 transition cursor-pointer"
                                title="Delete expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


      </div>

      {/* ==================================================== */}
      {/* MODAL: ADD NEW CRAFT / PRODUCT */}
      {/* ==================================================== */}
      {isNewProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl my-4">
            <button
              onClick={() => setIsNewProductOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-4">
              Add New Handcrafted Product
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Craft Title / Name:</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Lavender Ribbon Mini Bouquet"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Catalogue Category:</label>
                  <select
                    value={newProductRealm}
                    onChange={(e) => {
                      setNewProductRealm(e.target.value);
                      setNewProductSubcat('');
                    }}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  >
                    {realms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.icon || '🎀'} {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Subcategory (Optional):</label>
                  <select
                    value={newProductSubcat}
                    onChange={(e) => setNewProductSubcat(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  >
                    <option value="">None / General</option>
                    {subcategories
                      .filter((s) => s.categoryId === newProductRealm)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Pricing Mode:</label>
                  <select
                    value={newProductPriceType}
                    onChange={(e) => setNewProductPriceType(e.target.value as PriceType)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  >
                    <option value="fixed">Fixed Price (₹)</option>
                    <option value="from">Starting From (From ₹X)</option>
                    <option value="on_request">Price on Request (Ask us 💌)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Initial Stock (Units):</label>
                  <input
                    type="number"
                    min={0}
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  />
                </div>
              </div>

              {newProductPriceType !== 'on_request' && (
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Price Amount (₹):</label>
                  <input
                    type="number"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                    placeholder="249"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Description:</label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Tell customers about the craftsmanship, materials, dimensions..."
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Badge Tag (Optional):</label>
                <input
                  type="text"
                  value={newProductBadge}
                  onChange={(e) => setNewProductBadge(e.target.value)}
                  placeholder="e.g. New / Personalised / Bestseller"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              {/* Direct Image Upload Box */}
              <ImageUploader
                value={newProductImage}
                onChange={setNewProductImage}
                label="Product Image"
              />

              {/* Bouquet Integration */}
              <div className="p-3 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1c1917]">
                  <input
                    type="checkbox"
                    checked={newProductBouquetEnabled}
                    onChange={(e) => setNewProductBouquetEnabled(e.target.checked)}
                    className="rounded text-[#7a1c3b]"
                  />
                  <span>Can go in a bouquet 💐</span>
                </label>

                {newProductBouquetEnabled && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-[#78716c] font-semibold">Bouquet Price (₹)</label>
                      <input
                        type="number"
                        value={newProductBouquetPrice}
                        onChange={(e) => setNewProductBouquetPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-2 py-1 border border-[#EFE8E1] rounded text-xs bg-white tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#78716c] font-semibold">Bouquet Group</label>
                      <select
                        value={newProductBouquetGroup}
                        onChange={(e) => setNewProductBouquetGroup(e.target.value as BouquetGroup)}
                        className="w-full px-2 py-1 border border-[#EFE8E1] rounded text-xs bg-white"
                      >
                        <option value="choc">Chocolates</option>
                        <option value="photo">Photos</option>
                        <option value="flower">Flowers</option>
                        <option value="jewel">Bracelets &amp; Chains</option>
                        <option value="more">More Treats</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white font-medium text-sm rounded-lg shadow-xs transition mt-4"
              >
                Add to Storefront Catalogue ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: EDIT PRODUCT */}
      {/* ==================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl my-4">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-1">
              Edit Handcrafted Product
            </h3>
            <p className="font-sans text-xs text-[#78716c] mb-4">
              SKU: <strong className="font-mono text-[#7a1c3b]">{editingProduct.id}</strong> · {editingProduct.slug}
            </p>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Craft Title / Name:</label>
                <input
                  type="text"
                  required
                  value={editProductName}
                  onChange={(e) => setEditProductName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Catalogue Category:</label>
                  <select
                    value={editProductCategory}
                    onChange={(e) => {
                      setEditProductCategory(e.target.value);
                      setEditProductSubcat('');
                    }}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  >
                    {realms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.icon || '🎀'} {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Subcategory:</label>
                  <select
                    value={editProductSubcat}
                    onChange={(e) => setEditProductSubcat(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  >
                    <option value="">None / General</option>
                    {subcategories
                      .filter((s) => s.categoryId === editProductCategory)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Pricing Mode:</label>
                  <select
                    value={editProductPriceType}
                    onChange={(e) => setEditProductPriceType(e.target.value as PriceType)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  >
                    <option value="fixed">Fixed Price (₹)</option>
                    <option value="from">Starting From (From ₹X)</option>
                    <option value="on_request">Price on Request (Ask us 💌)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Stock Quantity (Units):</label>
                  <input
                    type="number"
                    min={0}
                    value={editProductStock}
                    onChange={(e) => setEditProductStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  />
                </div>
              </div>

              {editProductPriceType !== 'on_request' && (
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Price Amount (₹):</label>
                  <input
                    type="number"
                    value={editProductPrice}
                    onChange={(e) => setEditProductPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Description:</label>
                <textarea
                  rows={3}
                  value={editProductDesc}
                  onChange={(e) => setEditProductDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Badge Tag (Optional):</label>
                <input
                  type="text"
                  value={editProductBadge}
                  onChange={(e) => setEditProductBadge(e.target.value)}
                  placeholder="e.g. Bestseller"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              {/* Direct Image Upload / Replace Box */}
              <ImageUploader
                value={editProductImage}
                onChange={setEditProductImage}
                label="Product Image"
              />

              {/* Bouquet Integration */}
              <div className="p-3 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1c1917]">
                  <input
                    type="checkbox"
                    checked={editProductBouquetEnabled}
                    onChange={(e) => setEditProductBouquetEnabled(e.target.checked)}
                    className="rounded text-[#7a1c3b]"
                  />
                  <span>Can go in a bouquet 💐</span>
                </label>

                {editProductBouquetEnabled && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-[#78716c] font-semibold">Bouquet Price (₹)</label>
                      <input
                        type="number"
                        value={editProductBouquetPrice}
                        onChange={(e) => setEditProductBouquetPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-2 py-1 border border-[#EFE8E1] rounded text-xs bg-white tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#78716c] font-semibold">Bouquet Group</label>
                      <select
                        value={editProductBouquetGroup}
                        onChange={(e) => setEditProductBouquetGroup(e.target.value as BouquetGroup)}
                        className="w-full px-2 py-1 border border-[#EFE8E1] rounded text-xs bg-white"
                      >
                        <option value="choc">Chocolates</option>
                        <option value="photo">Photos</option>
                        <option value="flower">Flowers</option>
                        <option value="jewel">Bracelets &amp; Chains</option>
                        <option value="more">More Treats</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 bg-white border border-[#EFE8E1] text-[#44403c] rounded-lg font-medium text-xs hover:bg-[#faf7f2] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white font-medium text-xs rounded-lg shadow-xs transition"
                >
                  Save Changes ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD NEW CATEGORY */}
      {/* ==================================================== */}
      {isNewCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl my-4">
            <button
              onClick={() => setIsNewCategoryOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-3">
              Add Master Category
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Category Name:</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    if (!newCategorySlug) {
                      setNewCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Resin Keepsakes"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Slug / Identifier:</label>
                  <input
                    type="text"
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                    placeholder="e.g. resin-keepsakes"
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Icon Emoji:</label>
                  <input
                    type="text"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    placeholder="e.g. 💐, 🎀, ✨"
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Description:</label>
                <textarea
                  rows={2}
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Brief description for customer discovery..."
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white font-medium text-xs rounded-lg shadow-xs transition mt-2"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: EDIT CATEGORY */}
      {/* ==================================================== */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl my-4">
            <button
              onClick={() => setEditingCategory(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-3">
              Edit Master Category
            </h3>

            <form onSubmit={handleSaveEditCategory} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Category Name:</label>
                <input
                  type="text"
                  required
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Slug:</label>
                  <input
                    type="text"
                    required
                    value={editCategorySlug}
                    onChange={(e) => setEditCategorySlug(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Icon Emoji:</label>
                  <input
                    type="text"
                    value={editCategoryIcon}
                    onChange={(e) => setEditCategoryIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Sort Order:</label>
                  <input
                    type="number"
                    value={editCategorySortOrder}
                    onChange={(e) => setEditCategorySortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Status:</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={editCategoryIsActive}
                      onChange={(e) => setEditCategoryIsActive(e.target.checked)}
                      className="rounded text-[#7a1c3b]"
                    />
                    <span>Active in Catalogue</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Description:</label>
                <textarea
                  rows={2}
                  value={editCategoryDesc}
                  onChange={(e) => setEditCategoryDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 py-2 bg-white border border-[#EFE8E1] text-[#44403c] rounded-lg font-medium text-xs hover:bg-[#faf7f2] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#7a1c3b] hover:bg-[#5a1230] text-white font-medium text-xs rounded-lg shadow-xs transition"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD NEW SUBCATEGORY */}
      {/* ==================================================== */}
      {isNewSubcatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl my-4">
            <button
              onClick={() => setIsNewSubcatOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-3">
              Add Subcategory
            </h3>

            <form onSubmit={handleCreateSubcategory} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Parent Category:</label>
                <select
                  value={newSubcatRealm}
                  onChange={(e) => setNewSubcatRealm(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                >
                  {realms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.icon || '🎀'} {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Subcategory Name:</label>
                <input
                  type="text"
                  required
                  value={newSubcatName}
                  onChange={(e) => {
                    setNewSubcatName(e.target.value);
                    if (!newSubcatSlug) {
                      setNewSubcatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Mini Bouquets"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Slug:</label>
                <input
                  type="text"
                  value={newSubcatSlug}
                  onChange={(e) => setNewSubcatSlug(e.target.value)}
                  placeholder="e.g. mini-bouquets"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white font-medium text-xs rounded-lg shadow-xs transition mt-2"
              >
                Create Subcategory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: STOCK ADJUSTMENT WITH AUDIT REASON */}
      {/* ==================================================== */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl my-4">
            <button
              onClick={() => setAdjustItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-1">
              Adjust Stock &amp; Audit Trail
            </h3>
            <p className="font-sans text-xs text-[#78716c] mb-4">
              Item: <strong className="text-[#1c1917]">{adjustItem.name}</strong> · Current:{' '}
              <strong className="font-mono text-[#7a1c3b]">{adjustItem.currentStock} units</strong>
            </p>

            <form onSubmit={handleSubmitStockAdjust} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Quantity Adjustment Delta (+ or -):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    required
                    value={adjustChange}
                    onChange={(e) => setAdjustChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-sm font-bold tabular-nums focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                    placeholder="e.g. +10 or -2"
                  />
                  <div className="text-xs text-[#78716c] whitespace-nowrap">
                    Result: <strong className="font-mono text-[#1c1917]">{Math.max(0, adjustItem.currentStock + adjustChange)} units</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Audit Reason:</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as InventoryTransaction['reason'])}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                >
                  <option value="stock_in">Stock In / Supplier Restock (+)</option>
                  <option value="stock_out">Stock Out / Internal Studio Transfer (-)</option>
                  <option value="damage">Damage / Spoilage Write-Off (-)</option>
                  <option value="restock">Customer Return / Restock (+)</option>
                  <option value="inventory_count_correction">Physical Inventory Recount / Correction</option>
                  <option value="manual_restock">Manual Studio Batch Addition</option>
                  <option value="damage_adjustment">General Quality Spoilage</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Reference / Batch / PO Note:</label>
                <input
                  type="text"
                  value={adjustRef}
                  onChange={(e) => setAdjustRef(e.target.value)}
                  placeholder="e.g. Batch #402, Supplier Invoice #991, Physical audit"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#7a1c3b] focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="flex-1 py-2.5 bg-white border border-[#EFE8E1] text-[#44403c] rounded-lg font-medium text-xs hover:bg-[#faf7f2] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustChange === 0}
                  className="flex-1 py-2.5 bg-[#7a1c3b] disabled:opacity-50 hover:bg-[#5a1230] text-white font-medium text-xs rounded-lg shadow-xs transition"
                >
                  Log Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ORDER DETAIL & STATUS TIMELINE DRAWER */}
      {/* ==================================================== */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl my-4 space-y-6">
            <button
              onClick={() => setSelectedOrderDetail(null)}
              className="absolute top-4 right-4 p-2 rounded-full border border-[#EFE8E1] hover:bg-[#FAF7F2] transition cursor-pointer"
              title="Close Order Details"
            >
              <X className="w-4 h-4 text-[#1C1917]" />
            </button>

            {/* Header: Order ID, Channel, Status Pill */}
            <div className="border-b border-[#EFE8E1] pb-4 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono font-bold text-lg text-[#7A1C3B]">
                  {selectedOrderDetail.id}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedOrderDetail.channel === 'website'
                    ? 'bg-sky-50 text-sky-800 border-sky-300'
                    : selectedOrderDetail.channel === 'whatsapp'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : selectedOrderDetail.channel === 'instagram'
                        ? 'bg-pink-50 text-pink-800 border-pink-300'
                        : 'bg-purple-50 text-purple-800 border-purple-300'
                    }`}
                >
                  {selectedOrderDetail.channel === 'website'
                    ? '🌐 Website'
                    : selectedOrderDetail.channel === 'whatsapp'
                      ? '💬 Direct WhatsApp'
                      : selectedOrderDetail.channel === 'instagram'
                        ? '📸 Instagram DM'
                        : '🎪 Expo Stall'}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fbf3e4] text-[#7a1c3b] border border-[#c5a059]/30">
                  {selectedOrderDetail.status}
                </span>
              </div>

              <p className="font-sans text-xs text-[#78716c]">
                Placed on {new Date(selectedOrderDetail.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'full',
                  timeStyle: 'medium',
                })}
              </p>
            </div>

            {/* Quick Status Advance Pipeline */}
            <div className="bg-[#faf7f2] border border-[#EFE8E1] rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-[#1c1917] block">
                Update Order Stage:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    'Pending WhatsApp Confirmation',
                    'Received',
                    'Crafting',
                    'Packed & Sealed',
                    'Dispatched',
                    'Delivered',
                    'Cancelled',
                  ] as const
                ).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatusInDetail(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${selectedOrderDetail.status === st
                      ? 'bg-[#7a1c3b] text-white shadow-xs'
                      : 'bg-white hover:bg-[#f5f5f4] text-[#44403c] border border-[#EFE8E1]'
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Delivery Address Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="bg-white border border-[#EFE8E1] rounded-xl p-3.5 space-y-1">
                <span className="text-[#a8a29e] uppercase font-semibold text-[10px] tracking-wider block">
                  Customer Contact
                </span>
                <div className="font-semibold text-sm text-[#1c1917]">
                  {selectedOrderDetail.customerName}
                </div>
                <div className="text-[#78716c] font-mono flex items-center gap-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5 text-[#a8a29e]" />
                  <span>{selectedOrderDetail.customerPhone}</span>
                </div>
                {selectedOrderDetail.customerEmail && (
                  <div className="text-[#78716c]">{selectedOrderDetail.customerEmail}</div>
                )}
              </div>

              <div className="bg-white border border-[#EFE8E1] rounded-xl p-3.5 space-y-1">
                <span className="text-[#a8a29e] uppercase font-semibold text-[10px] tracking-wider block">
                  Delivery Destination
                </span>
                <div className="text-[#1c1917] leading-relaxed">
                  {selectedOrderDetail.address}
                </div>
                <div className="text-[#78716c] font-medium">
                  {selectedOrderDetail.city}, {selectedOrderDetail.state} - {selectedOrderDetail.pincode}
                </div>
                <div className="text-[11px] text-[#7a1c3b] font-medium mt-1">
                  Method: {selectedOrderDetail.deliveryRule || 'Standard Delivery'}
                </div>
              </div>
            </div>

            {/* Items with Exact Saved Price & Customization Snapshot */}
            <div className="space-y-2">
              <span className="text-[#a8a29e] uppercase font-semibold text-[10px] tracking-wider block">
                Ordered Items &amp; Customization Snapshot
              </span>
              <div className="border border-[#EFE8E1] rounded-xl overflow-hidden divide-y divide-[#f5f5f4]">
                {selectedOrderDetail.items.map((it, idx) => (
                  <div key={idx} className="p-3.5 bg-white text-xs space-y-1.5 flex gap-3 items-start">
                    {it.image && (
                      <img
                        src={it.image}
                        alt={it.productName}
                        className="w-14 h-14 object-cover rounded-lg border border-[#EFE8E1] shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start font-medium text-[#1c1917]">
                        <span className="text-sm font-semibold">
                          {it.quantity}x {it.productName}
                        </span>
                        <span className="font-mono tabular-nums text-sm font-semibold text-[#7a1c3b]">
                          ₹{it.price * it.quantity}
                        </span>
                      </div>
                      {it.variants && Object.keys(it.variants).length > 0 && (
                        <div className="text-[11px] text-[#78716c] mt-0.5">
                          {Object.entries(it.variants).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </div>
                      )}
                      {it.personalisation && Object.keys(it.personalisation).length > 0 && (
                        <div className="bg-[#fffaf5] border border-[#c5a059]/20 rounded-lg p-2.5 text-[11px] text-[#44403c] space-y-1 mt-1.5">
                          <strong className="text-[#7a1c3b] block">Customisation Details:</strong>
                          {Object.entries(it.personalisation).map(([k, v]) => (
                            <div key={k}>
                              <span className="font-semibold text-[#1c1917]">{k}:</span> {String(v)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Gift Note */}
              {selectedOrderDetail.giftNote && (
                <div className="p-3 bg-[#fbf3e4]/60 rounded-xl border border-[#c5a059]/30 text-xs text-[#7a1c3b] space-y-1">
                  <strong>💌 Handwritten Gift Card Message:</strong>
                  <p className="font-display italic text-sm text-[#1c1917]">
                    &ldquo;{selectedOrderDetail.giftNote}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-[#faf7f2] border border-[#EFE8E1] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
              <div className="space-y-0.5">
                <div>Subtotal: <strong className="font-mono">₹{selectedOrderDetail.subtotal}</strong></div>
                {selectedOrderDetail.deliveryFee > 0 && (
                  <div>Delivery Fee: <strong className="font-mono">₹{selectedOrderDetail.deliveryFee}</strong></div>
                )}
                {selectedOrderDetail.discount ? (
                  <div className="text-emerald-700">Discount: <strong className="font-mono">-₹{selectedOrderDetail.discount}</strong></div>
                ) : null}
              </div>

              <div className="text-right">
                <span className="text-[#78716c] uppercase text-[10px] font-semibold block">Total Bill</span>
                <span className="font-display text-2xl font-bold text-[#7a1c3b] tabular-nums">
                  ₹{selectedOrderDetail.total}
                </span>
              </div>
            </div>

            {/* Courier & Tracking Input Form */}
            <div className="bg-white border border-[#EFE8E1] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#7a1c3b]" />
                <span className="font-semibold text-xs text-[#1c1917]">
                  Courier Tracking Details
                </span>
              </div>

              <form onSubmit={handleSaveTrackingInDetail} className="space-y-3 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[#78716c] font-medium">Courier Service:</label>
                    <select
                      value={detailCourier}
                      onChange={(e) => setDetailCourier(e.target.value)}
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                    >
                      <option value="Delhivery">Delhivery Express</option>
                      <option value="ST Courier">ST Courier (Tamil Nadu)</option>
                      <option value="Professional Courier">The Professional Couriers</option>
                      <option value="India Post">India Post / Speed Post</option>
                      <option value="Local Rider">Local Adirampattinam Rider</option>
                      <option value="Other">Other Courier</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[#78716c] font-medium">Tracking / AWB Number:</label>
                    <input
                      type="text"
                      value={detailTrackingNumber}
                      onChange={(e) => {
                        setDetailTrackingNumber(e.target.value);
                        if (detailCourier.toLowerCase().includes('delhivery') && e.target.value) {
                          setDetailTrackingUrl(`https://www.delhivery.com/track/package/${e.target.value}`);
                        }
                      }}
                      placeholder="e.g. DEL994820194"
                      className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[#78716c] font-medium">Tracking URL (Optional):</label>
                  <input
                    type="url"
                    value={detailTrackingUrl}
                    onChange={(e) => setDetailTrackingUrl(e.target.value)}
                    placeholder="https://www.delhivery.com/track/package/..."
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={!detailTrackingNumber.trim()}
                    className="px-3.5 py-1.5 bg-[#7a1c3b] hover:bg-[#5a1230] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Tracking &amp; WhatsApp Customer</span>
                  </button>
                </div>

                {trackingSentCustomer && trackingSentCustomer.orderId === selectedOrderDetail.id && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-semibold">✓ Tracking saved &amp; WhatsApp dispatched to customer!</p>
                        <p className="text-[11px] text-emerald-700">Sent to customer phone: +91 {trackingSentCustomer.phone}</p>
                      </div>
                    </div>
                    <a
                      href={trackingSentCustomer.waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
                      <span>Re-open Customer WhatsApp</span>
                    </a>
                  </div>
                )}
              </form>
            </div>

            {/* Order Controls: Payment Status, Promise Date, Admin Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="bg-white border border-[#EFE8E1] rounded-xl p-4 space-y-2">
                <label className="block font-semibold text-[#1c1917]">Payment Status:</label>
                <div className="flex gap-2">
                  <select
                    value={detailPaymentStatus}
                    onChange={(e) => setDetailPaymentStatus(e.target.value as OrderPaymentStatus)}
                    className="flex-1 px-3 py-1.5 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Advance Paid">Advance Paid</option>
                    <option value="Fully Paid">Fully Paid</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Expo Cash / UPI">Expo Cash / UPI</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleSavePaymentStatusInDetail}
                    className="px-3 py-1.5 bg-white border border-[#EFE8E1] hover:bg-[#faf7f2] rounded-lg font-medium text-xs text-[#1c1917]"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#EFE8E1] rounded-xl p-4 space-y-2">
                <label className="block font-semibold text-[#1c1917]">Promise Delivery Date:</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={detailPromiseDate}
                    onChange={(e) => setDetailPromiseDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSavePromiseDateInDetail}
                    className="px-3 py-1.5 bg-white border border-[#EFE8E1] hover:bg-[#faf7f2] rounded-lg font-medium text-xs text-[#1c1917]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Internal Notes */}
            <div className="bg-white border border-[#EFE8E1] rounded-xl p-4 space-y-2 text-xs font-sans">
              <label className="block font-semibold text-[#1c1917]">Admin Internal Notes:</label>
              <textarea
                rows={2}
                value={detailAdminNotes}
                onChange={(e) => setDetailAdminNotes(e.target.value)}
                placeholder="Private workshop notes (e.g. calligraphy approved on Instagram, ribbon tied with gold bow)..."
                className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAdminNotesInDetail}
                  className="px-3.5 py-1.5 bg-white border border-[#EFE8E1] hover:bg-[#faf7f2] rounded-lg font-semibold text-xs text-[#1c1917]"
                >
                  Save Internal Note
                </button>
              </div>
            </div>

            {/* Timeline of Status Changes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#7a1c3b]" />
                <span className="font-semibold text-xs text-[#1c1917]">
                  Order Timeline &amp; Audit History
                </span>
              </div>

              {isTimelineLoading ? (
                <div className="text-xs text-[#78716c] py-2">Loading timeline...</div>
              ) : orderTimeline.length === 0 ? (
                <div className="text-xs text-[#78716c] p-3 bg-[#faf7f2] rounded-lg border border-[#EFE8E1]">
                  Initial order entry recorded.
                </div>
              ) : (
                <div className="border border-[#EFE8E1] rounded-xl p-3 bg-[#faf7f2] space-y-2 text-xs font-sans">
                  {orderTimeline.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 text-xs border-b border-[#EFE8E1]/60 pb-2 last:border-b-0">
                      <div className="w-2 h-2 rounded-full bg-[#7a1c3b] mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1c1917]">
                            {item.newStatus}
                          </span>
                          <span className="text-[10px] text-[#78716c] font-mono">
                            {new Date(item.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        {item.notes && <p className="text-[11px] text-[#78716c] mt-0.5">{item.notes}</p>}
                        <span className="text-[10px] text-[#a8a29e]">By: {item.changedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#f5f5f4]">
              <button
                type="button"
                onClick={() => {
                  setPackingSlipFilter(selectedOrderDetail.id);
                  setIsPackingSummaryOpen(true);
                }}
                className="px-3.5 py-2 bg-white border border-[#EFE8E1] hover:bg-[#faf7f2] text-[#1c1917] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4 text-[#7a1c3b]" />
                <span>Print Packing Slip</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Confirm Order & Send Bill directly to Customer WhatsApp */}
                {selectedOrderDetail.status === 'Pending WhatsApp Confirmation' && (
                  <button
                    type="button"
                    onClick={() => handleConfirmOrderWithNotification(selectedOrderDetail)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    title="Confirm order, update status to Received, and send itemized bill to customer on WhatsApp"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Confirm Order &amp; Send Bill (WhatsApp)</span>
                  </button>
                )}

                {/* Send Official Receipt on WhatsApp */}
                <a
                  href={db.generateReceiptWhatsAppUrl(selectedOrderDetail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#25D366] hover:bg-[#1db954] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  title="Send official order receipt & itemized bill to customer on WhatsApp"
                >
                  <Receipt className="w-4 h-4 fill-white text-white" />
                  <span>Send Receipt (WhatsApp)</span>
                </a>

                {/* Send Status Update on WhatsApp */}
                <a
                  href={db.generateStatusWhatsAppUrl(selectedOrderDetail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Send prepared status update to customer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Status Update</span>
                </a>

                {/* Cancel Order with WhatsApp Notification */}
                {selectedOrderDetail.status !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleCancelOrderWithNotification(selectedOrderDetail)}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                    title="Cancel order and immediately notify customer on WhatsApp"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel &amp; Notify</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrderDetail(null)}
                  className="px-4 py-2 bg-[#7a1c3b] hover:bg-[#5a1230] text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: PRINTABLE PACKING SLIP SUMMARY */}
      {/* ==================================================== */}
      {isPackingSummaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-5 sm:p-8 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl my-4 space-y-6">
            {/* Top Toolbar: Not printed */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f5f5f4] pb-4 print:hidden">
              <div>
                <h3 className="font-display text-2xl text-[#1c1917] flex items-center gap-2">
                  <Printer className="w-5 h-5 text-[#7a1c3b]" />
                  <span>Workshop Packing Slips</span>
                </h3>
                <p className="font-sans text-xs text-[#78716c]">
                  Formatted printable parcels summary for studio packing, verification, and dispatch.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#7a1c3b] hover:bg-[#5a1230] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slips (Ctrl+P)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPackingSummaryOpen(false)}
                  className="p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
                >
                  <X className="w-5 h-5 text-[#1c1917]" />
                </button>
              </div>
            </div>

            {/* Filter Toggle for Packing Slips: Not printed */}
            <div className="flex items-center gap-2 text-xs font-sans print:hidden">
              <span className="text-[#78716c] font-medium">Show Slips For:</span>
              <button
                type="button"
                onClick={() => setPackingSlipFilter('active')}
                className={`px-3 py-1 rounded-lg transition ${packingSlipFilter === 'active'
                  ? 'bg-[#7a1c3b] text-white font-semibold'
                  : 'bg-[#faf7f2] text-[#44403c] border border-[#EFE8E1]'
                  }`}
              >
                Active Workshop Orders (Received / Crafting / Packed)
              </button>
              <button
                type="button"
                onClick={() => setPackingSlipFilter('all')}
                className={`px-3 py-1 rounded-lg transition ${packingSlipFilter === 'all'
                  ? 'bg-[#7a1c3b] text-white font-semibold'
                  : 'bg-[#faf7f2] text-[#44403c] border border-[#EFE8E1]'
                  }`}
              >
                All Orders ({orders.length})
              </button>
            </div>

            {/* Slips Content */}
            <div className="space-y-8">
              {orders
                .filter((o) => {
                  if (packingSlipFilter === 'all') return true;
                  if (packingSlipFilter === 'active') {
                    return (
                      o.status === 'Received' ||
                      o.status === 'Crafting' ||
                      o.status === 'Making' ||
                      o.status === 'Packed & Sealed' ||
                      o.status === 'Packed'
                    );
                  }
                  return o.id === packingSlipFilter;
                })
                .map((order) => (
                  <div
                    key={order.id}
                    className="border-2 border-dashed border-[#d6d3d1] p-6 rounded-xl bg-white space-y-4 text-xs font-sans print:border-black print:p-4 print:page-break-after-always"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-[#EFE8E1] pb-3">
                      <div>
                        <div className="font-display text-xl font-bold tracking-tight text-[#1c1917]">
                          givento<span className="text-[#7a1c3b]">.in</span> Studio Packing Slip
                        </div>
                        <div className="text-[11px] text-[#78716c]">
                          Boutique Handcrafted Parcel · Adirampattinam, Tamil Nadu
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-base font-bold text-[#7a1c3b]">
                          {order.id}
                        </div>
                        <div className="text-[10px] text-[#78716c] font-mono">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-[11px] font-semibold text-[#1c1917] mt-0.5">
                          Channel: {order.channel || 'website'}
                        </div>
                      </div>
                    </div>

                    {/* Customer & Address */}
                    <div className="grid grid-cols-2 gap-4 bg-[#faf7f2] p-3 rounded-lg border border-[#EFE8E1]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider block">
                          Deliver To
                        </span>
                        <div className="font-semibold text-sm text-[#1c1917] mt-0.5">
                          {order.customerName}
                        </div>
                        <div className="text-[#44403c] mt-0.5 leading-relaxed">
                          {order.address}
                        </div>
                        <div className="font-medium text-[#1c1917]">
                          {order.city}, {order.state} - {order.pincode}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider block">
                          Dispatch Contact &amp; Details
                        </span>
                        <div>Phone: <strong className="font-mono">{order.customerPhone}</strong></div>
                        <div>Shipping: <strong>{order.deliveryRule || 'Standard Delivery'}</strong></div>
                        {order.promiseDate && (
                          <div className="text-amber-800 font-semibold">
                            Promise Date: {order.promiseDate}
                          </div>
                        )}
                        <div>Payment: <strong>{order.paymentStatus}</strong> ({order.paymentMethod})</div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="overflow-x-auto">
                      <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider block mb-1.5">
                        Items for Parcel Assembly
                      </span>
                      <table className="w-full text-left border-collapse border border-[#EFE8E1] text-xs">
                        <thead>
                          <tr className="bg-[#faf7f2] border-b border-[#EFE8E1]">
                            <th className="p-2 font-semibold text-[#1c1917]">Item / Craft Name</th>
                            <th className="p-2 font-semibold text-[#1c1917] text-center w-16">Qty</th>
                            <th className="p-2 font-semibold text-[#1c1917]">Personalisation / Custom Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e7e5e4]">
                          {order.items.map((it, idx) => (
                            <tr key={idx}>
                              <td className="p-2 font-medium text-[#1c1917]">{it.productName}</td>
                              <td className="p-2 text-center font-bold font-mono">{it.quantity}</td>
                              <td className="p-2 text-[#78716c]">
                                {it.personalisation && Object.keys(it.personalisation).length > 0 ? (
                                  <div className="space-y-0.5">
                                    {Object.entries(it.personalisation).map(([k, v]) => (
                                      <div key={k}>
                                        <strong className="text-[#1c1917]">{k}:</strong> {String(v)}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="italic text-[#a8a29e]">Standard Craft</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Gift Note Box */}
                    {order.giftNote && (
                      <div className="p-3 bg-[#fbf3e4]/60 rounded-lg border border-[#c5a059]/40 space-y-1">
                        <strong className="text-[11px] text-[#7a1c3b] block uppercase tracking-wider">
                          💌 Handwritten Gift Card Text (Inscribe onto Card):
                        </strong>
                        <p className="font-display italic text-sm text-[#1c1917]">
                          &ldquo;{order.giftNote}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Studio Checklist */}
                    <div className="pt-2 border-t border-[#EFE8E1] flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#78716c]">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span>Workshop Crafting Verified</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span>Gift Card Inscribed &amp; Attached</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span>Boutique Floral Wrapping &amp; Satin Ribbon Sealed</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span>Courier Address Label Affixed</span>
                        </label>
                      </div>

                      <div className="font-display text-sm font-bold text-[#7a1c3b] tabular-nums">
                        Total Value: ₹{order.total}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: MANUAL ORDER ENTRY (OMNICHANNEL RECORDING) */}
      {/* ==================================================== */}
      {isManualOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl my-4">
            <button
              onClick={() => setIsManualOrderOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-1">
              Log Manual Sale
            </h3>
            <p className="font-sans text-xs text-[#78716c] mb-5">
              Direct omnichannel order recording for WhatsApp, Instagram DM, Expo stall, or phone calls. Linked items automatically decrement studio inventory.
            </p>

            <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs font-sans">
              {/* Channel and Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Order Channel:</label>
                  <select
                    value={manualChannel}
                    onChange={(e) => setManualChannel(e.target.value as OrderChannel)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                  >
                    <option value="whatsapp">💬 WhatsApp Direct Chat</option>
                    <option value="instagram">📸 Instagram DM</option>
                    <option value="walkin_expo">🎪 Expo Stall / Pop-up</option>
                    <option value="phone">📞 Phone Call</option>
                    <option value="in_person">Studio Walk-in / In Person</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Payment Status:</label>
                  <select
                    value={manualPaymentStatus}
                    onChange={(e) => setManualPaymentStatus(e.target.value as OrderPaymentStatus)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                  >
                    <option value="Fully Paid">Fully Paid</option>
                    <option value="Advance Paid">Advance Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Expo Cash / UPI">Expo Cash / UPI</option>
                  </select>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Customer Name:</label>
                  <input
                    type="text"
                    required
                    value={manualCustomerName}
                    onChange={(e) => setManualCustomerName(e.target.value)}
                    placeholder="e.g. Ayesha Rahman"
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">WhatsApp Phone:</label>
                  <input
                    type="tel"
                    value={manualCustomerPhone}
                    onChange={(e) => setManualCustomerPhone(e.target.value)}
                    placeholder="e.g. 9840012345"
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Delivery Address / Location:</label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Street / Flat / Expo Booth Handover"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">City:</label>
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">State:</label>
                  <input
                    type="text"
                    value={manualState}
                    onChange={(e) => setManualState(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Pincode:</label>
                  <input
                    type="text"
                    value={manualPincode}
                    onChange={(e) => setManualPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Items Entry */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#1c1917]">
                    Craft Items ({manualItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddManualItemRow}
                    className="text-xs font-semibold text-[#7a1c3b] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {manualItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#faf7f2] border border-[#EFE8E1] rounded-xl space-y-2 relative"
                    >
                      {manualItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveManualItemRow(idx)}
                          className="absolute top-2.5 right-2.5 text-rose-600 hover:text-rose-800 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Pick from database or custom */}
                      <div className="space-y-1 pr-6">
                        <label className="block text-[10px] text-[#78716c] font-semibold">
                          Pick from Catalogue (Auto-links Stock) OR Type Custom:
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleSelectProductForManualItem(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#EFE8E1] rounded-lg text-xs"
                        >
                          <option value="">-- Custom item (type name below) --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} · ₹{p.price || p.priceFrom || 0} ({p.stockQuantity ?? 15} in stock)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-6 space-y-1">
                          <label className="block text-[10px] text-[#78716c] font-semibold">Item Title:</label>
                          <input
                            type="text"
                            required
                            value={item.productName}
                            onChange={(e) => handleUpdateManualItemField(idx, 'productName', e.target.value)}
                            placeholder="e.g. 7 Roses Sunflower Mixed Bouquet"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#EFE8E1] rounded-lg text-xs"
                          />
                        </div>

                        <div className="col-span-3 space-y-1">
                          <label className="block text-[10px] text-[#78716c] font-semibold">Qty:</label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleUpdateManualItemField(idx, 'quantity', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#EFE8E1] rounded-lg text-xs tabular-nums text-center"
                          />
                        </div>

                        <div className="col-span-3 space-y-1">
                          <label className="block text-[10px] text-[#78716c] font-semibold">Price (₹):</label>
                          <input
                            type="number"
                            min={0}
                            value={item.price}
                            onChange={(e) => handleUpdateManualItemField(idx, 'price', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#EFE8E1] rounded-lg text-xs tabular-nums font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] text-[#78716c] font-semibold">Customisation Notes:</label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleUpdateManualItemField(idx, 'notes', e.target.value)}
                          placeholder="e.g. Gold initial K, pink ribbon, gift card note..."
                          className="w-full px-2.5 py-1 bg-white border border-[#EFE8E1] rounded text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Adjustments: Delivery Fee, Discount, Promise Date */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Delivery Fee (₹):</label>
                  <input
                    type="number"
                    min={0}
                    value={manualDeliveryFee}
                    onChange={(e) => setManualDeliveryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Discount (₹):</label>
                  <input
                    type="number"
                    min={0}
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Promise Date:</label>
                  <input
                    type="date"
                    value={manualPromiseDate}
                    onChange={(e) => setManualPromiseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="p-3 bg-[#fbf3e4]/60 border border-[#c5a059]/30 rounded-xl flex justify-between items-center text-xs">
                <span>
                  Calculated Bill:{' '}
                  <span className="text-[#78716c]">
                    (Subtotal ₹{manualItems.reduce((acc, it) => acc + Number(it.price) * Number(it.quantity), 0)} + Delivery ₹{manualDeliveryFee} - Disc ₹{manualDiscount})
                  </span>
                </span>
                <span className="font-display text-lg font-bold text-[#7a1c3b] tabular-nums">
                  ₹{Math.max(0, manualItems.reduce((acc, it) => acc + Number(it.price) * Number(it.quantity), 0) + Number(manualDeliveryFee) - Number(manualDiscount))}
                </span>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Internal Studio Note:</label>
                <input
                  type="text"
                  value={manualAdminNotes}
                  onChange={(e) => setManualAdminNotes(e.target.value)}
                  placeholder="Optional internal note (e.g. Paid in cash at expo stall #14)"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white font-medium text-xs rounded-lg shadow-xs transition mt-2"
              >
                Save Order Record ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD WRAPPING SHEET */}
      {/* ==================================================== */}
      {isNewSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl my-4">
            <button
              onClick={() => setIsNewSheetOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-3">
              Add New Wrapping Sheet
            </h3>

            <form onSubmit={handleCreateSheet} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Sheet Name / Pattern:</label>
                <input
                  type="text"
                  required
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  placeholder="e.g. Vintage Floral Rose"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Price (₹):</label>
                  <input
                    type="number"
                    required
                    value={newSheetPrice}
                    onChange={(e) => setNewSheetPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Stock Units:</label>
                  <input
                    type="number"
                    required
                    value={newSheetStock}
                    onChange={(e) => setNewSheetStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Base Color:</label>
                  <input
                    type="color"
                    value={newSheetBase}
                    onChange={(e) => setNewSheetBase(e.target.value)}
                    className="w-full h-9 p-1 bg-white border border-[#EFE8E1] rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Trim Color:</label>
                  <input
                    type="color"
                    value={newSheetTrim}
                    onChange={(e) => setNewSheetTrim(e.target.value)}
                    className="w-full h-9 p-1 bg-white border border-[#EFE8E1] rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white font-medium text-xs rounded-lg shadow-xs transition mt-2"
              >
                Add Wrapping Sheet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: LOG STUDIO EXPENSE */}
      {/* ==================================================== */}
      {isNewExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl my-4">
            <button
              onClick={() => setIsNewExpenseOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-3">
              Log Studio Expense
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Expense Title / Description:</label>
                <input
                  type="text"
                  required
                  value={newExpenseTitle}
                  onChange={(e) => setNewExpenseTitle(e.target.value)}
                  placeholder="e.g. Ribbons & Packaging Boxes"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Expense Category:</label>
                  <select
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                  >
                    <option value="raw_materials">Raw Materials (Paper, Flowers, Resin, Charms)</option>
                    <option value="packaging">Packaging &amp; Cartons (Boxes, Bubble wrap, Seals)</option>
                    <option value="marketing_ads">Marketing &amp; Social Ads (Instagram promotions)</option>
                    <option value="shipping_courier">Shipping &amp; Courier (Parcel dispatch)</option>
                    <option value="studio_tools">Studio Tools &amp; Hardware (Glue guns, molds)</option>
                    <option value="expo_fees">Expo &amp; Pop-up Stall Fees</option>
                    <option value="miscellaneous">Miscellaneous &amp; Studio Overheads</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Amount (₹):</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Date:</label>
                <input
                  type="date"
                  value={newExpenseDate}
                  onChange={(e) => setNewExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white font-medium text-xs rounded-lg shadow-xs transition mt-2"
              >
                Log Expense Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD BOUQUET DECORATION */}
      {/* ==================================================== */}
      {isNewDecOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl my-4">
            <button
              onClick={() => setIsNewDecOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-3">
              Add Bouquet Decoration
            </h3>

            <form onSubmit={handleCreateDecoration} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Decoration Name:</label>
                <input
                  type="text"
                  required
                  value={newDecName}
                  onChange={(e) => setNewDecName(e.target.value)}
                  placeholder="e.g. Golden Butterfly Pick"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Price Charge (₹):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newDecPrice}
                    onChange={(e) => setNewDecPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Stock Units:</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newDecStock}
                    onChange={(e) => setNewDecStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Description / Placement Note:</label>
                <input
                  type="text"
                  value={newDecDesc}
                  onChange={(e) => setNewDecDesc(e.target.value)}
                  placeholder="e.g. Delicate 3D metallic butterfly nestled in flowers"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white font-medium text-xs rounded-lg shadow-xs transition mt-2 cursor-pointer"
              >
                Add Decoration ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD CUSTOMIZATION OPTION */}
      {/* ==================================================== */}
      {isNewCustOptionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white border border-[#EFE8E1] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl my-4">
            <button
              onClick={() => setIsNewCustOptionOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#EFE8E1] hover:bg-[#faf7f2] transition"
            >
              <X className="w-5 h-5 text-[#1c1917]" />
            </button>

            <h3 className="font-display text-2xl text-[#1c1917] mb-3">
              Add Customization Option
            </h3>

            <form onSubmit={handleCreateCustOption} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Studio Type:</label>
                  <select
                    value={newOptionTypeId}
                    onChange={(e) => setNewOptionTypeId(e.target.value as 'resin' | 'frame' | 'hamper')}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                  >
                    <option value="resin">Resin Keepsakes</option>
                    <option value="frame">Keepsake Frames</option>
                    <option value="hamper">Gift Hampers</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Option Group:</label>
                  <input
                    type="text"
                    required
                    value={newOptionGroupName}
                    onChange={(e) => setNewOptionGroupName(e.target.value)}
                    placeholder="e.g. shape, tint, border"
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#1c1917]">Option Display Name:</label>
                <input
                  type="text"
                  required
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  placeholder="e.g. Sunset Amber Tint or Rose Gold Frame"
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Price Modifier (₹):</label>
                  <input
                    type="number"
                    value={newOptionPrice}
                    onChange={(e) => setNewOptionPrice(Number(e.target.value))}
                    placeholder="0 for included"
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#1c1917]">Stock Units:</label>
                  <input
                    type="number"
                    value={newOptionStock}
                    onChange={(e) => setNewOptionStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#EFE8E1] rounded-lg text-xs tabular-nums"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7a1c3b] hover:bg-[#5a1230] text-white font-medium text-xs rounded-lg shadow-xs transition mt-2 cursor-pointer"
              >
                Save Custom Option ✨
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
