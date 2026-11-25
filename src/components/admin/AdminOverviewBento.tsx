'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Package,
  Users,
  Clock,
  Sparkles,
  ShoppingBag,
  Download,
  Plus,
  Search,
  CheckCircle2,
  MapPin,
  AlertTriangle,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react';
import { AdminOrder, Coupon, CustomRequest, OrderStatus } from '../../lib/database';
import { Category, Product } from '../../types';
import CustomerDemographicMap from './CustomerDemographicMap';

export type AdminTabKey =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'realms'
  | 'requests'
  | 'coupons'
  | 'sheets'
  | 'settings'
  | 'inventory'
  | 'analytics';

interface AdminOverviewBentoProps {
  orders: AdminOrder[];
  products: Product[];
  categories: Category[];
  requests: CustomRequest[];
  coupons: Coupon[];
  lowStockCount: number;
  onNavigateTab: (tab: AdminTabKey) => void;
  onFilterOrdersByStatus: (status: 'all' | OrderStatus) => void;
  onOpenOrderDetail: (order: AdminOrder) => void;
  onExportOrdersCsv: () => void;
  onOpenNewProduct: () => void;
  onOpenManualOrder: () => void;
}

type OrderFilterPill = 'all' | 'pending' | 'crafting' | 'dispatched' | 'delivered';

function normalizeStatusBucket(status: string): Exclude<OrderFilterPill, 'all'> | 'cancelled' {
  switch (status) {
    case 'Pending WhatsApp Confirmation':
      return 'pending';
    case 'Received':
    case 'Crafting':
    case 'Making':
    case 'Packed':
    case 'Packed & Sealed':
      return 'crafting';
    case 'Dispatched':
    case 'Shipped':
      return 'dispatched';
    case 'Delivered':
      return 'delivered';
    case 'Cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

function getStatusBadgeStyle(status: string): string {
  const bucket = normalizeStatusBucket(status);
  if (bucket === 'pending') return 'bg-amber-50 text-amber-800 border-amber-200';
  if (bucket === 'crafting') return 'bg-[#F6E9EE] text-[#7A1C3B] border-[#FADDE3]';
  if (bucket === 'dispatched') return 'bg-sky-50 text-sky-800 border-sky-200';
  if (bucket === 'delivered') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  return 'bg-stone-100 text-stone-600 border-stone-200';
}

function getShortStatusLabel(status: string): string {
  switch (status) {
    case 'Pending WhatsApp Confirmation':
      return 'Pending';
    case 'Packed & Sealed':
      return 'Packed';
    default:
      return status;
  }
}

function getChannelLabel(channel?: string): string {
  switch (channel) {
    case 'whatsapp':
      return 'WHATSAPP';
    case 'instagram':
      return 'INSTAGRAM';
    case 'walkin_expo':
    case 'expo':
      return 'EXPO';
    case 'phone':
    case 'in_person':
      return 'STUDIO';
    default:
      return 'WEBSITE';
  }
}

function formatCompactInr(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export default function AdminOverviewBento({
  orders,
  products,
  categories,
  requests,
  coupons,
  lowStockCount,
  onNavigateTab,
  onFilterOrdersByStatus,
  onOpenOrderDetail,
  onExportOrdersCsv,
  onOpenNewProduct,
  onOpenManualOrder,
}: AdminOverviewBentoProps) {
  const [chartPeriod, setChartPeriod] = useState<'week' | 'months'>('months');
  const [activeBarIdx, setActiveBarIdx] = useState<number | null>(null);
  const [activityMode, setActivityMode] = useState<'pending' | 'transactions'>('pending');
  const [tableFilter, setTableFilter] = useState<OrderFilterPill>('all');
  const [tableSearch, setTableSearch] = useState('');

  // Core KPI computations from live store data
  const metrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenue = activeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const pendingCount = orders.filter(
      (o) => o.status === 'Pending WhatsApp Confirmation'
    ).length;
    const workshopCount = orders.filter((o) => {
      const b = normalizeStatusBucket(o.status);
      return b === 'crafting';
    }).length;
    const dispatchedCount = orders.filter((o) => {
      const b = normalizeStatusBucket(o.status);
      return b === 'dispatched' || b === 'delivered';
    }).length;
    const uniqueCustomers = new Set(
      orders.map((o) => o.customerPhone || o.customerName).filter(Boolean)
    ).size;

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingCount,
      workshopCount,
      dispatchedCount,
      activeProducts: products.length,
      uniqueCustomers,
    };
  }, [orders, products]);

  // Dual-bar series data: Capsule vertical bars (Revenue vs Orders count)
  const chartData = useMemo(() => {
    const nonCancelled = orders.filter((o) => o.status !== 'Cancelled');
    const now = new Date();

    if (chartPeriod === 'week') {
      const days: Array<{ key: string; label: string; revenue: number; count: number }> = [];
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
        days.push({ key, label, revenue: 0, count: 0 });
      }
      nonCancelled.forEach((o) => {
        const d = o.createdAt ? new Date(o.createdAt) : null;
        if (!d || Number.isNaN(d.getTime())) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`;
        const slot = days.find((item) => item.key === key);
        if (slot) {
          slot.revenue += Number(o.total) || 0;
          slot.count += 1;
        }
      });
      return days;
    }

    const months: Array<{ key: string; label: string; revenue: number; count: number }> = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      months.push({ key, label, revenue: 0, count: 0 });
    }
    nonCancelled.forEach((o) => {
      const d = o.createdAt ? new Date(o.createdAt) : null;
      if (!d || Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const slot = months.find((item) => item.key === key);
      if (slot) {
        slot.revenue += Number(o.total) || 0;
        slot.count += 1;
      }
    });
    return months;
  }, [orders, chartPeriod]);

  const peakBarIdx = useMemo(() => {
    let bestIdx = chartData.length - 1;
    let bestVal = -1;
    chartData.forEach((d, idx) => {
      if (d.revenue >= bestVal) {
        bestVal = d.revenue;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }, [chartData]);

  const focusedBarIdx =
    activeBarIdx !== null && activeBarIdx < chartData.length ? activeBarIdx : peakBarIdx;
  const maxRevenue = Math.max(1, ...chartData.map((d) => d.revenue));
  const maxOrderCount = Math.max(1, ...chartData.map((d) => d.count));

  // Category Mix Donut segments computed from actual ordered items & products
  const categoryBreakdown = useMemo(() => {
    const productCatMap = new Map<string, string>();
    products.forEach((p) => {
      const label = p.categoryName || p.realmName || 'Handcrafted';
      productCatMap.set(p.id, label);
      productCatMap.set(p.name.toLowerCase(), label);
    });

    const counts = new Map<string, number>();
    orders.forEach((o) => {
      if (o.status === 'Cancelled') return;
      (o.items || []).forEach((it) => {
        const matched =
          (it.productId && productCatMap.get(it.productId)) ||
          productCatMap.get(it.productName.toLowerCase()) ||
          (it.productName.toLowerCase().includes('bouquet')
            ? 'Everlasting Bouquets'
            : it.productName.toLowerCase().includes('frame')
              ? 'Nikah & Frames'
              : it.productName.toLowerCase().includes('chain') ||
                it.productName.toLowerCase().includes('bracelet') ||
                it.productName.toLowerCase().includes('ring')
                ? 'Jewellery'
                : 'Gift Hampers & Resin');
        counts.set(matched, (counts.get(matched) || 0) + (it.quantity || 1));
      });
    });

    // Fallback to catalog category distribution if zero orders placed yet
    if (counts.size === 0) {
      categories.slice(0, 4).forEach((cat) => {
        const catalogCount = products.filter(
          (p) => p.categoryId === cat.id || p.realmId === cat.id
        ).length;
        if (catalogCount > 0) {
          counts.set(cat.name, catalogCount);
        }
      });
    }

    const palette = ['#1C1917', '#7A1C3B', '#B98A2E', '#D9C8BC'];
    const entries = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    const totalUnits = Math.max(
      1,
      entries.reduce((acc, [, v]) => acc + v, 0)
    );

    const circumference = 2 * Math.PI * 36;

    return {
      isCatalogFallback: orders.length === 0,
      totalLabel: orders.length === 0 ? products.length : orders.length,
      totalCaption: orders.length === 0 ? 'CRAFTS' : 'ORDERS',
      items: entries.map(([name, value], idx) => {
        const prevTotal = entries
          .slice(0, idx)
          .reduce((acc, [, v]) => acc + v, 0);
        const pct = Math.round((value / totalUnits) * 100);
        const dash = (value / totalUnits) * circumference;
        const offset = (prevTotal / totalUnits) * circumference;
        return {
          name,
          value,
          pct,
          color: palette[idx % palette.length],
          dashArray: `${dash.toFixed(1)} ${circumference.toFixed(1)}`,
          dashOffset: `${(-offset).toFixed(1)}`,
        };
      }),
    };
  }, [orders, products, categories]);

  // Pending approvals + recent transactions queues
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'Pending WhatsApp Confirmation').slice(0, 4),
    [orders]
  );

  const recentTransactions = useMemo(
    () => orders.filter((o) => o.status !== 'Cancelled').slice(0, 5),
    [orders]
  );

  // Manage Orders table / mobile feed filtered view
  const manageOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (tableFilter !== 'all') {
          const bucket = normalizeStatusBucket(o.status);
          if (bucket !== tableFilter) return false;
        }
        if (tableSearch.trim()) {
          const q = tableSearch.toLowerCase();
          return (
            o.id.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.city.toLowerCase().includes(q) ||
            o.customerPhone.includes(q)
          );
        }
        return true;
      })
      .slice(0, 6);
  }, [orders, tableFilter, tableSearch]);

  // Delivery destination cities mix from live orders
  const topCities = useMemo(() => {
    const cityCounts = new Map<string, number>();
    orders.forEach((o) => {
      const city = (o.city || 'Adirampattinam').trim();
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    });
    const list = Array.from(cityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    const maxCityCount = Math.max(1, ...(list.map(([, c]) => c)));
    return list.map(([city, count]) => ({
      city,
      count,
      widthPct: Math.round((count / maxCityCount) * 100),
    }));
  }, [orders]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ================================================================ */}
      {/* 1. TOP QUICK STATS ROW (Matches Reference 1 & 2 Bento Header) */}
      {/* ================================================================ */}
      <section aria-label="Studio Quick Stats" className="space-y-4">
        {/* Title + Live Date & Primary Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-heading font-normal text-2xl sm:text-3xl text-[#1C1917] tracking-tight">
              Studio Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              Live performance snapshot · Adirampattinam Workshop (
              {new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
              )
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenManualOrder}
              className="px-3.5 py-2 rounded-full bg-[#7A1C3B] hover:bg-[#5A1230] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Sale</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewProduct}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#EFE8E1] text-xs font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#7A1C3B]" />
              <span>Add Craft</span>
            </button>

            <button
              type="button"
              onClick={onExportOrdersCsv}
              className="px-3.5 py-2 rounded-full bg-[#1C1917] hover:bg-[#322C29] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 6 Bento Quick Stat Cards (2-col mobile, 3-col tablet, 6-col desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Card 1: Total Revenue */}
          <button
            type="button"
            onClick={() => onNavigateTab('analytics')}
            className="bg-white border border-[#EFE8E1] hover:border-[#D9C8BC] rounded-3xl p-4 sm:p-5 text-left flex flex-col items-center justify-between gap-2.5 shadow-2xs active:scale-[0.98] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EFE8E1] flex items-center justify-center text-[#7A1C3B] font-bold text-base">
              ₹
            </div>
            <div className="text-center">
              <div className="font-heading text-xl sm:text-2xl font-bold text-[#1C1917] tabular-nums tracking-tight">
                {formatCompactInr(metrics.totalRevenue)}
              </div>
              <div className="text-[11px] font-medium text-[#78716C] mt-0.5">
                Total Revenue
              </div>
            </div>
          </button>

          {/* Card 2: Total Orders (Highlighted Focal Inverse Card with Jump Arrow) */}
          <button
            type="button"
            onClick={() => {
              onFilterOrdersByStatus('all');
              onNavigateTab('orders');
            }}
            className="relative bg-[#1C1917] text-white rounded-3xl p-4 sm:p-5 text-left flex flex-col items-center justify-between gap-2.5 shadow-sm hover:bg-[#292421] active:scale-[0.98] transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#7A1C3B] text-white flex items-center justify-center shadow-xs">
              <Package className="w-4 h-4" />
            </div>
            <div className="text-center">
              <div className="font-heading text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight">
                {metrics.totalOrders}
              </div>
              <div className="text-[11px] font-medium text-white/75 mt-0.5 flex items-center justify-center gap-1">
                <span>Total Orders</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* Card 3: Pending Approvals */}
          <button
            type="button"
            onClick={() => {
              onFilterOrdersByStatus('Pending WhatsApp Confirmation');
              onNavigateTab('orders');
            }}
            className="bg-white border border-[#EFE8E1] hover:border-[#7A1C3B]/40 rounded-3xl p-4 sm:p-5 text-left flex flex-col items-center justify-between gap-2.5 shadow-2xs active:scale-[0.98] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-center">
              <div className="font-heading text-xl sm:text-2xl font-bold text-[#1C1917] tabular-nums tracking-tight">
                {metrics.pendingCount}
              </div>
              <div className="text-[11px] font-medium text-[#78716C] mt-0.5">
                Pending Confirm
              </div>
            </div>
          </button>

          {/* Card 4: On Workshop Desk */}
          <button
            type="button"
            onClick={() => {
              onFilterOrdersByStatus('Crafting');
              onNavigateTab('orders');
            }}
            className="bg-white border border-[#EFE8E1] hover:border-[#D9C8BC] rounded-3xl p-4 sm:p-5 text-left flex flex-col items-center justify-between gap-2.5 shadow-2xs active:scale-[0.98] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EFE8E1] text-[#1C1917] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#B98A2E]" />
            </div>
            <div className="text-center">
              <div className="font-heading text-xl sm:text-2xl font-bold text-[#1C1917] tabular-nums tracking-tight">
                {metrics.workshopCount}
              </div>
              <div className="text-[11px] font-medium text-[#78716C] mt-0.5">
                In Workshop
              </div>
            </div>
          </button>

          {/* Card 5: Catalog Crafts */}
          <button
            type="button"
            onClick={() => onNavigateTab('products')}
            className="bg-white border border-[#EFE8E1] hover:border-[#D9C8BC] rounded-3xl p-4 sm:p-5 text-left flex flex-col items-center justify-between gap-2.5 shadow-2xs active:scale-[0.98] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EFE8E1] text-[#1C1917] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#7A1C3B]" />
            </div>
            <div className="text-center">
              <div className="font-heading text-xl sm:text-2xl font-bold text-[#1C1917] tabular-nums tracking-tight">
                {metrics.activeProducts}
              </div>
              <div className="text-[11px] font-medium text-[#78716C] mt-0.5">
                Studio Crafts
              </div>
            </div>
          </button>

          {/* Card 6: Customers / Requests */}
          <button
            type="button"
            onClick={() => onNavigateTab('requests')}
            className="bg-white border border-[#EFE8E1] hover:border-[#D9C8BC] rounded-3xl p-4 sm:p-5 text-left flex flex-col items-center justify-between gap-2.5 shadow-2xs active:scale-[0.98] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EFE8E1] text-[#1C1917] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#1C1917]" />
            </div>
            <div className="text-center">
              <div className="font-heading text-xl sm:text-2xl font-bold text-[#1C1917] tabular-nums tracking-tight">
                {metrics.uniqueCustomers}
              </div>
              <div className="text-[11px] font-medium text-[#78716C] mt-0.5">
                Unique Buyers
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. MIDDLE BENTO GRID: STATISTICS CAPSULE BARS + DONUT + QUEUE */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Card A: Interactive Dual-Capsule Bar Chart ("Statistics") */}
        <section
          aria-label="Order and Revenue Statistics"
          className="lg:col-span-6 bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-heading font-normal text-lg sm:text-xl text-[#1C1917]">
                Statistics
              </h2>
              <div className="flex items-center gap-4 text-[11px] text-[#78716C] mt-1">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#1C1917]">
                  <span className="w-2 h-2 rounded-full bg-[#1C1917]" />
                  <span>Revenue (₹)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-[#78716C]">
                  <span className="w-2 h-2 rounded-full bg-[#D9C8BC]" />
                  <span>Order Count</span>
                </span>
              </div>
            </div>

            <div className="inline-flex items-center bg-[#FAF7F2] border border-[#EFE8E1] p-1 rounded-full text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => {
                  setChartPeriod('months');
                  setActiveBarIdx(null);
                }}
                className={`px-3 py-1 rounded-full active:scale-95 transition cursor-pointer ${chartPeriod === 'months'
                  ? 'bg-[#1C1917] text-white shadow-2xs'
                  : 'text-[#6A5B60] hover:text-[#1C1917]'
                  }`}
              >
                7 Months
              </button>
              <button
                type="button"
                onClick={() => {
                  setChartPeriod('week');
                  setActiveBarIdx(null);
                }}
                className={`px-3 py-1 rounded-full active:scale-95 transition cursor-pointer ${chartPeriod === 'week'
                  ? 'bg-[#1C1917] text-white shadow-2xs'
                  : 'text-[#6A5B60] hover:text-[#1C1917]'
                  }`}
              >
                7 Days
              </button>
            </div>
          </div>

          {/* Capsule Bar Plot Area with Dashed Gridlines & Interactive Floating Pill */}
          <div className="relative pt-10 pb-1">
            {/* Subtle Horizontal Guide Lines */}
            <div className="flex items-end gap-2 sm:gap-4 h-44 relative">
              {/* Y-Axis Scale Labels */}
              <div className="hidden sm:flex flex-col justify-between h-full text-[10px] font-medium text-[#8C827A] tabular-nums pr-1 select-none shrink-0">
                <span>{formatCompactInr(maxRevenue)}</span>
                <span>{formatCompactInr(maxRevenue / 2)}</span>
                <span>₹0</span>
              </div>

              {/* Plot Grid + Dual Capsule Bars */}
              <div className="flex-1 h-full relative flex flex-col justify-end">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-dashed border-[#EFE8E1] w-full" />
                  <div className="border-t border-dashed border-[#EFE8E1] w-full" />
                  <div className="border-t border-[#EFE8E1] w-full" />
                </div>

                <div className="relative z-10 grid grid-cols-7 gap-1.5 sm:gap-3 items-end h-full px-1">
                  {chartData.map((slot, idx) => {
                    const revPct =
                      slot.revenue > 0
                        ? Math.max(12, Math.round((slot.revenue / maxRevenue) * 100))
                        : 6;
                    const cntPct =
                      slot.count > 0
                        ? Math.max(12, Math.round((slot.count / maxOrderCount) * 100))
                        : 6;
                    const isFocused = idx === focusedBarIdx;

                    return (
                      <button
                        key={slot.key}
                        type="button"
                        onClick={() => setActiveBarIdx(idx)}
                        onMouseEnter={() => setActiveBarIdx(idx)}
                        aria-label={`${slot.label}: ${formatCompactInr(slot.revenue)} from ${slot.count} orders`}
                        className="group relative flex flex-col items-center justify-end h-full focus:outline-none cursor-pointer"
                      >
                        {/* Floating Pill Tooltip (Matches Reference 2 Peak Badge) */}
                        {isFocused && (
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                            <span className="px-2 py-0.5 rounded-full bg-[#1C1917] text-white text-[10px] font-bold whitespace-nowrap shadow-sm tabular-nums">
                              {formatCompactInr(slot.revenue)}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7A1C3B] border border-white mt-0.5" />
                          </div>
                        )}

                        <div className="flex items-end justify-center gap-1 sm:gap-1.5 w-full h-full pt-2">
                          <div
                            className={`w-2 sm:w-2.5 rounded-full transition-all duration-500 ${isFocused ? 'bg-[#7A1C3B]' : 'bg-[#1C1917] group-hover:bg-[#7A1C3B]'
                              }`}
                            style={{ height: `${revPct}%` }}
                          />
                          <div
                            className={`w-2 sm:w-2.5 rounded-full transition-all duration-500 ${isFocused ? 'bg-[#B98A2E]/70' : 'bg-[#E5DCD4] group-hover:bg-[#D9C8BC]'
                              }`}
                            style={{ height: `${cntPct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex items-center gap-2 sm:gap-4 mt-2.5">
              <div className="hidden sm:block w-8 shrink-0" />
              <div className="flex-1 grid grid-cols-7 gap-1.5 sm:gap-3 text-center px-1">
                {chartData.map((slot, idx) => (
                  <span
                    key={slot.key}
                    className={`text-[10px] sm:text-[11px] font-medium truncate ${idx === focusedBarIdx ? 'text-[#1C1917] font-bold' : 'text-[#8C827A]'
                      }`}
                  >
                    {slot.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Card B: Category Mix Donut Card (Matches Reference 1 "Sales" Donut) */}
        <section
          aria-label="Category Sales Breakdown"
          className="lg:col-span-3 bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading font-normal text-lg text-[#1C1917]">
              Sales Mix
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFE8E1] text-[10px] font-semibold text-[#78716C]">
              {categoryBreakdown.isCatalogFallback ? 'Catalog' : 'Orders'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-1">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="transparent"
                  stroke="#F5EFE8"
                  strokeWidth="12"
                />
                {categoryBreakdown.items.map((seg) => (
                  <circle
                    key={seg.name}
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                  />
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-heading text-2xl font-bold text-[#1C1917] tabular-nums leading-none">
                  {categoryBreakdown.totalLabel}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#8C827A] uppercase mt-1">
                  {categoryBreakdown.totalCaption}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {categoryBreakdown.items.length === 0 ? (
              <p className="text-center text-xs text-[#8C827A]">No sales data yet</p>
            ) : (
              categoryBreakdown.items.map((seg) => (
                <div key={seg.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="font-medium text-[#1C1917] truncate">{seg.name}</span>
                  </div>
                  <span className="font-semibold text-[#78716C] tabular-nums shrink-0">
                    {seg.pct}%
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Card C: Pending Confirmations & Recent Transactions Split Feed */}
        <section
          aria-label="Pending Confirmations and Recent Transactions"
          className="lg:col-span-3 bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center bg-[#FAF7F2] border border-[#EFE8E1] p-0.5 rounded-full text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setActivityMode('pending')}
                className={`px-3 py-1 rounded-full active:scale-95 transition cursor-pointer ${activityMode === 'pending'
                  ? 'bg-[#1C1917] text-white shadow-2xs'
                  : 'text-[#6A5B60]'
                  }`}
              >
                Pending ({pendingOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActivityMode('transactions')}
                className={`px-3 py-1 rounded-full active:scale-95 transition cursor-pointer ${activityMode === 'transactions'
                  ? 'bg-[#1C1917] text-white shadow-2xs'
                  : 'text-[#6A5B60]'
                  }`}
              >
                Recent
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            {activityMode === 'pending' ? (
              pendingOrders.length === 0 ? (
                <div className="py-8 text-center space-y-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-medium text-[#1C1917]">All caught up</p>
                  <p className="text-[11px] text-[#8C827A]">
                    No pending WhatsApp confirmations right now.
                  </p>
                </div>
              ) : (
                pendingOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => onOpenOrderDetail(order)}
                    className="w-full flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-[#FAF7F2]/80 hover:bg-[#F6E9EE]/60 border border-[#EFE8E1] text-left active:scale-[0.98] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#EFE8E1] flex items-center justify-center text-xs font-bold text-[#7A1C3B] shrink-0">
                        {order.customerName?.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1C1917] truncate">
                          {order.customerName}
                        </div>
                        <div className="text-[10px] text-[#8C827A] truncate">
                          #{order.id} · {order.city}
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold shrink-0">
                      Pending
                    </span>
                  </button>
                ))
              )
            ) : recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C827A]">
                No transactions recorded yet.
              </div>
            ) : (
              recentTransactions.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => onOpenOrderDetail(order)}
                  className="w-full flex items-center justify-between gap-2 py-2 px-1 border-b border-[#FAF7F2] last:border-b-0 text-left hover:bg-[#FAF7F2]/60 rounded-lg transition cursor-pointer"
                >
                  <span className="text-xs font-medium text-[#1C1917] truncate min-w-0">
                    {order.customerName}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-[#1C1917] text-white text-[9px] font-bold tracking-wider">
                      {getChannelLabel(order.channel)}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1C1917] tabular-nums">
                      +₹{(order.total || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="w-full py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F6E9EE] border border-[#EFE8E1] text-xs font-semibold text-[#1C1917] hover:text-[#7A1C3B] active:scale-[0.98] transition cursor-pointer"
          >
            View all orders
          </button>
        </section>
      </div>

      {/* ================================================================ */}
      {/* 3. ROW 3: MANAGE ORDERS + CUSTOMER DEMOGRAPHIC MAP (MATCHES REF) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <section
          aria-label="Manage Orders"
          className="lg:col-span-6 bg-white border border-[#EFE8E1] rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between"
        >
          {/* Header Bar: Title + Filter Pills + Search */}
          <div className="flex flex-col gap-3 pb-3 border-b border-[#F5EFE8]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading font-normal text-lg sm:text-xl text-[#1C1917]">
                Manage Orders
              </h2>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 max-w-full">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'crafting', label: 'Crafting' },
                    { id: 'dispatched', label: 'Dispatched' },
                    { id: 'delivered', label: 'Delivered' },
                  ] as const
                ).map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setTableFilter(pill.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap active:scale-95 transition cursor-pointer ${tableFilter === pill.id
                      ? 'bg-[#1C1917] text-white shadow-2xs'
                      : 'bg-[#FAF7F2] text-[#6A5B60] hover:text-[#1C1917] border border-[#EFE8E1]'
                      }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Search customer, ID, city..."
                  className="w-full h-9 pl-8 pr-3 bg-[#FAF7F2] border border-[#EFE8E1] rounded-full text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#7A1C3B]"
                />
              </div>

              <button
                type="button"
                onClick={onExportOrdersCsv}
                className="h-9 px-3.5 rounded-full bg-[#1C1917] hover:bg-[#7A1C3B] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 active:scale-95 transition cursor-pointer"
              >
                <span>Export</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {manageOrders.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#8C827A]">
              No orders match the current filter.
            </div>
          ) : (
            <>
              {/* Desktop Data Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[11px] font-semibold text-[#8C827A] border-b border-[#F5EFE8]">
                      <th className="pb-2.5 pr-3 font-medium">Order ID</th>
                      <th className="pb-2.5 px-2 font-medium">Customer</th>
                      <th className="pb-2.5 px-2 font-medium hidden xl:table-cell">Destination</th>
                      <th className="pb-2.5 px-2 font-medium">Status</th>
                      <th className="pb-2.5 px-2 font-medium hidden sm:table-cell">Date</th>
                      <th className="pb-2.5 px-2 font-medium text-right">Amount</th>
                      <th className="pb-2.5 pl-2 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7F2]">
                    {manageOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => onOpenOrderDetail(order)}
                        className="hover:bg-[#FAF7F2]/80 transition-colors cursor-pointer"
                      >
                        <td className="py-3 pr-3 font-mono font-bold text-[#1C1917] whitespace-nowrap">
                          #{order.id}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#F6E9EE] text-[#7A1C3B] flex items-center justify-center text-[11px] font-bold shrink-0">
                              {order.customerName?.charAt(0).toUpperCase() || 'G'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-[#1C1917] truncate max-w-[120px]">{order.customerName}</div>
                              <div className="text-[10px] text-[#8C827A] truncate">
                                {order.city} · {getChannelLabel(order.channel)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-[#57534E] whitespace-nowrap hidden xl:table-cell">
                          {order.city}, {order.pincode}
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeStyle(
                              order.status
                            )}`}
                          >
                            {getShortStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-[#8C827A] whitespace-nowrap hidden sm:table-cell">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })
                            : 'Recent'}
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-[#1C1917] tabular-nums whitespace-nowrap">
                          ₹{(order.total || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenOrderDetail(order);
                            }}
                            aria-label={`Manage order ${order.id}`}
                            className="p-1.5 rounded-full hover:bg-white border border-transparent hover:border-[#EFE8E1] text-[#78716C] hover:text-[#1C1917] transition cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List (< md) */}
              <div className="md:hidden space-y-2.5">
                {manageOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => onOpenOrderDetail(order)}
                    className="w-full text-left p-3.5 rounded-2xl bg-[#FAF7F2]/80 border border-[#EFE8E1] hover:border-[#7A1C3B]/30 active:scale-[0.99] transition space-y-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#1C1917]">
                        #{order.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeStyle(
                          order.status
                        )}`}
                      >
                        {getShortStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1C1917] truncate">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-[#78716C] truncate">
                          {order.city} · {order.items?.length || 1} item(s)
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-sm font-bold text-[#1C1917] tabular-nums">
                          ₹{(order.total || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-[#8C827A]">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })
                            : 'Recent'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Customer Demographic Map Card (Right Column matching Reference Screenshot) */}
        <CustomerDemographicMap orders={orders} />
      </div>

      {/* ================================================================ */}
      {/* 4. BOTTOM REGIONAL DESTINATIONS & WORKSHOP QUICK ALERTS */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Top Delivery Destinations */}
        <section className="lg:col-span-6 bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-normal text-lg text-[#1C1917] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#7A1C3B]" />
              <span>Top Dispatch Destinations</span>
            </h2>
            <span className="text-[11px] text-[#8C827A] font-medium">
              {metrics.dispatchedCount} shipped
            </span>
          </div>

          {topCities.length === 0 ? (
            <p className="text-xs text-[#8C827A] py-4 text-center">
              Delivery destinations will appear once orders arrive.
            </p>
          ) : (
            <div className="space-y-3">
              {topCities.map((row) => (
                <div key={row.city} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1C1917]">{row.city}</span>
                    <span className="font-mono text-[#78716C] tabular-nums">
                      {row.count} {row.count === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#FAF7F2] overflow-hidden border border-[#EFE8E1]">
                    <div
                      className="h-full rounded-full bg-[#1C1917]"
                      style={{ width: `${row.widthPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Workshop Attention & Shortcuts */}
        <section className="lg:col-span-6 bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-normal text-lg text-[#1C1917] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#7A1C3B]" />
              <span>Studio Controls</span>
            </h2>
            <span className="text-[11px] text-[#8C827A] font-medium">Quick jump</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => onNavigateTab('inventory')}
              className="p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F6E9EE]/70 border border-[#EFE8E1] text-left active:scale-95 transition cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <AlertTriangle
                  className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                />
                <span className="font-heading text-lg font-bold text-[#1C1917] tabular-nums">
                  {lowStockCount}
                </span>
              </div>
              <div className="font-semibold text-[#1C1917]">Low Stock Alerts</div>
              <div className="text-[10px] text-[#8C827A]">Manage inventory</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('requests')}
              className="p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F6E9EE]/70 border border-[#EFE8E1] text-left active:scale-95 transition cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <Sparkles className="w-4 h-4 text-[#7A1C3B]" />
                <span className="font-heading text-lg font-bold text-[#1C1917] tabular-nums">
                  {requests.length}
                </span>
              </div>
              <div className="font-semibold text-[#1C1917]">Bulk Inquiries</div>
              <div className="text-[10px] text-[#8C827A]">Custom requests</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('coupons')}
              className="p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F6E9EE]/70 border border-[#EFE8E1] text-left active:scale-95 transition cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <ShoppingBag className="w-4 h-4 text-[#B98A2E]" />
                <span className="font-heading text-lg font-bold text-[#1C1917] tabular-nums">
                  {coupons.filter((c) => c.isActive).length}
                </span>
              </div>
              <div className="font-semibold text-[#1C1917]">Active Coupons</div>
              <div className="text-[10px] text-[#8C827A]">Promo discounts</div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
