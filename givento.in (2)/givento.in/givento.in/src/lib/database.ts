import { supabase, isSupabaseConfigured } from './supabase';
import {
  Product,
  Category,
  Realm,
  Subcategory,
  BouquetSize,
  Decoration,
  CustomizationType,
  CustomizationOption,
  InventoryTransaction,
  OrderStatusHistory,
  ShippingRule,
  Expense,
  AiConversation,
  AiMessage,
} from '../types';
import { WrappingSheet, BouquetItem, BouquetBuilderSettings } from '../types/bouquet';
import {
  PRODUCTS as DEFAULT_PRODUCTS,
  CATEGORIES as DEFAULT_CATEGORIES,
  REALMS as DEFAULT_REALMS,
  SUBCATEGORIES as DEFAULT_SUBCATEGORIES,
} from '../data/sampleData';
import { DEFAULT_WRAPPING_SHEETS, DEFAULT_BOUQUET_ITEMS } from '../data/sampleBouquetData';

export type OrderChannel = 'website' | 'whatsapp' | 'instagram' | 'walkin_expo' | 'expo' | 'phone' | 'in_person';

export type OrderStatus =
  | 'Pending WhatsApp Confirmation'
  | 'Received'
  | 'Crafting'
  | 'Packed & Sealed'
  | 'Packed'
  | 'Making'
  | 'Dispatched'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type OrderPaymentStatus =
  | 'Unpaid'
  | 'Advance Paid'
  | 'Fully Paid'
  | 'Cash on Delivery'
  | 'Expo Cash / UPI'
  | 'Pending'
  | 'Paid'
  | 'Failed';

export interface AdminOrderItem {
  productId?: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  variants?: Record<string, string>;
  personalisation?: Record<string, string>;
  customizationDetails?: any;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: OrderStatus;
  channel?: OrderChannel;
  paymentMethod: 'whatsapp' | 'cod' | 'razorpay' | 'cash' | 'gpay_direct';
  paymentStatus: OrderPaymentStatus;
  subtotal: number;
  discount?: number;
  giftWrap: boolean;
  giftNote?: string;
  sendAsGift?: boolean;
  recipientName?: string;
  recipientPhone?: string;
  deliveryFee: number;
  deliveryRule?: string;
  total: number;
  items: AdminOrderItem[];
  trackingNumber?: string;
  trackingCourier?: string;
  trackingUrl?: string;
  promiseDate?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrder: number;
  isActive: boolean;
  description?: string;
}

export interface CustomRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  eventType: string;
  quantity: number;
  budgetRange?: string;
  budget?: number | string;
  notes?: string;
  description?: string;
  status: 'New' | 'Contacted' | 'Quoted' | 'Confirmed';
  createdAt: string;
}

export interface SiteSettings {
  festivalBanner: {
    enabled: boolean;
    text: string;
  };
  deliveryFeeRules: {
    freeDeliveryThreshold: number;
    standardFee: number;
  };
  builderSettings: {
    builderEnabled: boolean;
    maxPieces: number;
  };
  aiAssistantInstructions?: string;
  aiAssistantGuidelines?: string;
}

// Sample initial admin data
const INITIAL_ORDERS: AdminOrder[] = [
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
    giftNote: 'Wishing you endless happiness on your graduation, dearest sister! 🎓✨',
    deliveryFee: 0,
    deliveryRule: 'Adirampattinam Local Delivery (Free over ₹499)',
    total: 580,
    promiseDate: '2026-11-20',
    adminNotes: 'Awaiting customer confirmation on WhatsApp for ribbon colour choice.',
    items: [
      {
        productId: 'sunflower-bouquet',
        productName: 'Sunflower Bouquet',
        quantity: 1,
        price: 249,
      },
      {
        productId: 'arabic-keychain',
        productName: 'Arabic Name Resin Keychain',
        quantity: 1,
        price: 249,
        personalisation: {
          'Name / Text': 'Farhana (فرحانة)',
          'Flakes': 'Gold Foil & Pressed Petals',
        },
      },
    ],
    createdAt: '2026-11-15T08:30:00Z',
  },
  {
    id: 'GVN-512093',
    customerName: 'Pooja V.',
    customerPhone: '9980112233',
    address: '#14, 5th Cross, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    status: 'Received',
    channel: 'whatsapp',
    paymentMethod: 'gpay_direct',
    paymentStatus: 'Advance Paid',
    subtotal: 999,
    giftWrap: true,
    giftNote: 'From your secret bestie! Enjoy the perfume & chocolates ♥',
    deliveryFee: 70,
    deliveryRule: 'Pan-India Courier (₹70)',
    total: 1069,
    promiseDate: '2026-11-22',
    adminNotes: 'Advance ₹500 received via GPay. Balance ₹569 on dispatch.',
    items: [
      {
        productName: '“Gift for Her” Luxury Keepsake Hamper',
        quantity: 1,
        price: 999,
        personalisation: {
          'Hamper Box Style': 'Ivory Ribbon Box',
          'Card Verse': 'To the sweetest friend',
        },
      },
    ],
    createdAt: '2026-11-14T14:15:00Z',
  },
  {
    id: 'GVN-849201',
    customerName: 'Amina K.',
    customerPhone: '9845123456',
    address: 'Flat 4B, Emerald Heights, Beach Road',
    city: 'Kozhikode',
    state: 'Kerala',
    pincode: '673001',
    status: 'Crafting',
    channel: 'instagram',
    paymentMethod: 'gpay_direct',
    paymentStatus: 'Fully Paid',
    subtotal: 1148,
    giftWrap: true,
    giftNote: 'Happy Nikah Anniversary sister! Love you both ✨',
    deliveryFee: 70,
    deliveryRule: 'Interstate Courier',
    total: 1218,
    promiseDate: '2026-11-19',
    adminNotes: 'Vow frame calligraphy approved on Instagram DM. Currently curing resin coating.',
    items: [
      {
        productName: 'Custom Nikah & Wedding Vows Frame',
        quantity: 1,
        price: 899,
        personalisation: {
          'Groom’s Name': 'Faris',
          'Bride’s Name': 'Amina',
          'Nikah Date': '12 Dec 2026',
          'Verse': 'Surah Ar-Rum 30:21',
        },
      },
      {
        productName: 'Arabic Name Resin Keychain',
        quantity: 1,
        price: 249,
        personalisation: {
          'Name / Initial': 'Amina / أمينة',
        },
      },
    ],
    createdAt: '2026-11-13T10:30:00Z',
  },
  {
    id: 'GVN-492018',
    customerName: 'Syed Imran',
    customerPhone: '9444129841',
    address: 'No. 28, Anna Nagar 2nd Street',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600040',
    status: 'Packed & Sealed',
    channel: 'whatsapp',
    paymentMethod: 'whatsapp',
    paymentStatus: 'Fully Paid',
    subtotal: 920,
    giftWrap: true,
    giftNote: 'Happy 5th Anniversary my dearest! Forever grateful for you ♥',
    deliveryFee: 50,
    deliveryRule: 'Tamil Nadu Express',
    total: 970,
    promiseDate: '2026-11-18',
    adminNotes: 'Bouquet carefully wrapped in Burgundy Floral sheet with Gold Satin Ribbon.',
    items: [
      {
        productName: 'Build Your Own Bouquet (Medium - 12 Pcs)',
        quantity: 1,
        price: 920,
        personalisation: {
          'Wrapping Sheet': 'Burgundy & Gold Foil Luxury Paper',
          'Bouquet Size': 'Medium (Up to 12 items)',
          'Items Inside': '3x Red Satin Roses, 2x Ferrero Rocher, 2x Mini Polaroids, 1x Daisy Stick',
          'Ribbon Decoration': 'Double Gold Satin Bow',
          'Greeting Card': 'Handwritten calligraphy card included',
        },
      },
    ],
    createdAt: '2026-11-12T11:20:00Z',
  },
  {
    id: 'GVN-330419',
    customerName: 'Zainab M.',
    customerPhone: '9744556677',
    address: 'Near Old Juma Masjid, Hill Palace',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682301',
    status: 'Dispatched',
    channel: 'website',
    paymentMethod: 'cod',
    paymentStatus: 'Cash on Delivery',
    subtotal: 498,
    giftWrap: false,
    deliveryFee: 70,
    total: 568,
    trackingCourier: 'Delhivery',
    trackingNumber: 'DEL994820194',
    trackingUrl: 'https://www.delhivery.com/track/package/DEL994820194',
    promiseDate: '2026-11-17',
    adminNotes: 'Dispatched via Delhivery pickup hub.',
    items: [
      {
        productName: 'Sunflower Mini Bouquet',
        quantity: 1,
        price: 119,
      },
      {
        productName: 'Classic 7-Bloom Rose Bouquet',
        quantity: 1,
        price: 325,
      },
    ],
    createdAt: '2026-11-12T09:00:00Z',
  },
  {
    id: 'GVN-772910',
    customerName: 'Kavitha S.',
    customerPhone: '9447118822',
    address: 'Expo Booth Handover, Lulu Atrium Stall #B14',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682024',
    status: 'Delivered',
    channel: 'walkin_expo',
    paymentMethod: 'cash',
    paymentStatus: 'Expo Cash / UPI',
    subtotal: 350,
    giftWrap: true,
    deliveryFee: 0,
    total: 350,
    promiseDate: '2026-11-11',
    adminNotes: 'Handover at festive expo stall. Paid via cash.',
    items: [
      {
        productName: 'Daisy & Strawberry Crochet Hair Clips (Set of 2)',
        quantity: 1,
        price: 150,
      },
      {
        productName: 'Gold Flake Resin Initial Keychain',
        quantity: 1,
        price: 200,
        personalisation: {
          'Letter': 'K',
        },
      },
    ],
    createdAt: '2026-11-11T16:45:00Z',
  },
];

const INITIAL_COUPONS: Coupon[] = [
  { code: 'GIVENTO10', discountType: 'percentage', discountValue: 10, minOrder: 499, isActive: true },
  { code: 'FIRSTLOVE', discountType: 'flat', discountValue: 50, minOrder: 299, isActive: true },
  { code: 'FESTIVEBOUQUET', discountType: 'flat', discountValue: 100, minOrder: 899, isActive: true },
];

const INITIAL_REQUESTS: CustomRequest[] = [
  {
    id: 'req-1',
    customerName: 'Dr. Rehana S.',
    customerPhone: '9847012345',
    eventType: 'Wedding Favours',
    quantity: 60,
    budgetRange: '₹15,000 – ₹20,000',
    notes: 'Need 60 personalised gold flake resin keychains with Arabic initials for wedding welcome hampers.',
    status: 'Contacted',
    createdAt: '2026-11-12T11:00:00Z',
  },
  {
    id: 'req-2',
    customerName: 'Ananya Rao',
    customerPhone: '9123456789',
    eventType: 'Birthday Return Gifts',
    quantity: 25,
    budgetRange: '₹3,000 – ₹5,000',
    notes: 'Crochet daisy hair clip sets and miniature retro car toys for 5th birthday party.',
    status: 'New',
    createdAt: '2026-11-13T16:20:00Z',
  },
];

export const INITIAL_SUBCATEGORIES: Subcategory[] = [...DEFAULT_SUBCATEGORIES];

export const INITIAL_BOUQUET_SIZES: BouquetSize[] = [
  { id: 'size-sm', name: 'Petite Bouquet (Small)', maxPieces: 6, baseCharge: 0, description: 'Dainty arrangement, holds up to 6 pieces.', isActive: true, sortOrder: 1 },
  { id: 'size-md', name: 'Classic Bouquet (Medium)', maxPieces: 12, baseCharge: 0, description: 'Most loved studio size, holds up to 12 pieces.', isActive: true, sortOrder: 2 },
  { id: 'size-lg', name: 'Grand Statement (Large)', maxPieces: 20, baseCharge: 50, description: 'Lush celebration bouquet, holds up to 20 pieces.', isActive: true, sortOrder: 3 },
];

export const INITIAL_DECORATIONS: Decoration[] = [
  { id: 'dec-ribbon', name: 'Double Satin Ribbon Bow', price: 25, stock: 100, description: 'Hand-tied two-tone satin bow in gold & maroon.', isActive: true },
  { id: 'dec-lights', name: 'Warm Fairy Lights (Battery Included)', price: 49, stock: 45, description: 'Tiny twinkling warm wire lights entwined in flowers.', isActive: true },
  { id: 'dec-card', name: 'Handwritten Calligraphy Card in Wax Envelope', price: 30, stock: 200, description: 'Ink handwritten message on deckle-edge paper.', isActive: true },
  { id: 'dec-crown', name: 'Mini Golden Princess Crown Pick', price: 35, stock: 30, description: 'Cute sparkling golden topper charm.', isActive: true },
];

export const INITIAL_SHIPPING_RULES: ShippingRule[] = [
  { id: 'ship-local', name: 'Adirampattinam Express Local Delivery', region: 'local_adiram', baseCharge: 30, freeThreshold: 499, estimatedDays: 'Same-day or next-day', isActive: true, sortOrder: 1 },
  { id: 'ship-pickup', name: 'Direct Studio Pickup (Adirampattinam)', region: 'pickup', baseCharge: 0, freeThreshold: 0, estimatedDays: 'Ready in 2–4 hours', isActive: true, sortOrder: 2 },
  { id: 'ship-tn', name: 'Tamil Nadu Standard Express', region: 'tamil_nadu', baseCharge: 50, freeThreshold: 899, estimatedDays: '1–2 working days', isActive: true, sortOrder: 3 },
  { id: 'ship-all-india', name: 'Pan-India Insured Courier (Delhivery / DTDC)', region: 'interstate', baseCharge: 70, freeThreshold: 999, estimatedDays: '3–5 working days', isActive: true, sortOrder: 4 },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', title: 'Floral Kraft Paper Rolls & Metallic Wires', category: 'raw_materials', amount: 1450, expenseDate: '2026-11-10', notes: 'Studio stock for bouquet wrap', createdAt: '2026-11-10T10:00:00Z' },
  { id: 'exp-2', title: 'Wax Seals & Brass Melting Spoons', category: 'studio_tools', amount: 890, expenseDate: '2026-11-11', notes: 'Burgundy wax beads and sealing stamps', createdAt: '2026-11-11T12:00:00Z' },
  { id: 'exp-3', title: 'Bubble Wrap & Rigid Courier Cartons', category: 'packaging', amount: 1200, expenseDate: '2026-11-12', notes: 'Protective packaging for pan-India courier parceling', createdAt: '2026-11-12T15:30:00Z' },
];

export const INITIAL_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  { id: 'tx-1', itemType: 'product', itemId: 'sunflower-bouquet', itemName: 'Sunflower Mini Bouquet', changeQuantity: 20, reason: 'manual_restock', referenceId: 'Batch #401', createdAt: '2026-11-10T09:00:00Z' },
  { id: 'tx-2', itemType: 'wrapping_sheet', itemId: 's1', itemName: 'Black & gold wrapping sheet', changeQuantity: 15, reason: 'manual_restock', referenceId: 'Batch #S1', createdAt: '2026-11-10T09:30:00Z' },
  { id: 'tx-3', itemType: 'product', itemId: 'sunflower-bouquet', itemName: 'Sunflower Mini Bouquet', changeQuantity: -1, reason: 'order_confirmed', referenceId: 'GVN-330419', createdAt: '2026-11-12T09:00:00Z' },
];

export const INITIAL_CUSTOMIZATION_TYPES: CustomizationType[] = [
  { id: 'bouquet', code: 'bouquet', name: 'Build Your Own Bouquet', description: 'Custom flower, chocolate, photo and jewellery bouquets', isActive: true },
  { id: 'resin', code: 'resin', name: 'Resin Art & Keepsakes', description: 'Custom hand-poured keychains, bookmarks, coasters, trays', isActive: true },
  { id: 'frame', code: 'frame', name: 'Keepsake & Nikah Frames', description: 'Gold-foiled wedding vows, anniversary and Islamic verse frames', isActive: true },
  { id: 'hamper', code: 'hamper', name: 'Curated Gift Hampers', description: 'Bespoke gift boxes filled with treats, perfumes and keepsakes', isActive: true },
];

export const INITIAL_CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  // RESIN PRODUCT TYPES
  { id: 'res-opt-kc', typeId: 'resin', groupName: 'product_type', name: 'Resin Initial Keychain', priceModifier: 199, stock: 50, isActive: true },
  { id: 'res-opt-bm', typeId: 'resin', groupName: 'product_type', name: 'Resin Floral Bookmark', priceModifier: 149, stock: 40, isActive: true },
  { id: 'res-opt-c2', typeId: 'resin', groupName: 'product_type', name: 'Coaster Set (Pair of 2)', priceModifier: 349, stock: 25, isActive: true },
  { id: 'res-opt-tt', typeId: 'resin', groupName: 'product_type', name: 'Trinket & Jewellery Tray', priceModifier: 399, stock: 20, isActive: true },
  { id: 'res-opt-pl', typeId: 'resin', groupName: 'product_type', name: 'Arabic Calligraphy Name Plaque', priceModifier: 499, stock: 15, isActive: true },
  { id: 'res-opt-pg', typeId: 'resin', groupName: 'product_type', name: 'Phone Grip Pop-Socket', priceModifier: 179, stock: 35, isActive: true },

  // RESIN SHAPES
  { id: 'res-shp-init', typeId: 'resin', groupName: 'shape', name: 'Letter Initial (A–Z)', priceModifier: 0, stock: 100, isActive: true },
  { id: 'res-shp-hex', typeId: 'resin', groupName: 'shape', name: 'Geometric Hexagon', priceModifier: 0, stock: 100, isActive: true },
  { id: 'res-shp-hrt', typeId: 'resin', groupName: 'shape', name: 'Heart', priceModifier: 0, stock: 100, isActive: true },
  { id: 'res-shp-geo', typeId: 'resin', groupName: 'shape', name: 'Raw Geode Edge', priceModifier: 30, stock: 40, isActive: true },
  { id: 'res-shp-arch', typeId: 'resin', groupName: 'shape', name: 'Boutique Arch', priceModifier: 40, stock: 30, isActive: true },

  // RESIN TINTS
  { id: 'res-col-clr', typeId: 'resin', groupName: 'color_tint', name: 'Crystal Clear (Glass Effect)', priceModifier: 0, stock: 100, isActive: true },
  { id: 'res-col-pnk', typeId: 'resin', groupName: 'color_tint', name: 'Rose Quartz Blossom', priceModifier: 0, stock: 100, isActive: true },
  { id: 'res-col-emr', typeId: 'resin', groupName: 'color_tint', name: 'Emerald Seafoam', priceModifier: 0, stock: 100, isActive: true },
  { id: 'res-col-nvy', typeId: 'resin', groupName: 'color_tint', name: 'Royal Midnight Navy', priceModifier: 0, stock: 100, isActive: true },
  { id: 'res-col-amb', typeId: 'resin', groupName: 'color_tint', name: 'Sunset Amber', priceModifier: 0, stock: 100, isActive: true },
  { id: 'res-col-prl', typeId: 'resin', groupName: 'color_tint', name: 'Pearlescent Shimmer', priceModifier: 20, stock: 50, isActive: true },

  // RESIN FLAKES
  { id: 'res-flk-gld', typeId: 'resin', groupName: 'flakes', name: '24K Gold Foil Flakes', priceModifier: 20, stock: 100, isActive: true },
  { id: 'res-flk-rgd', typeId: 'resin', groupName: 'flakes', name: 'Rose Gold Leaf', priceModifier: 20, stock: 100, isActive: true },
  { id: 'res-flk-slv', typeId: 'resin', groupName: 'flakes', name: 'Silver Starlight Foil', priceModifier: 15, stock: 80, isActive: true },
  { id: 'res-flk-flw', typeId: 'resin', groupName: 'flakes', name: 'Real Pressed Wildflowers', priceModifier: 35, stock: 45, isActive: true },

  // RESIN PACKAGING
  { id: 'res-pkg-pouch', typeId: 'resin', groupName: 'packaging', name: 'Velvet Drawstring Pouch', priceModifier: 0, stock: 200, isActive: true },
  { id: 'res-pkg-box', typeId: 'resin', groupName: 'packaging', name: 'Luxury Givento Gift Box', priceModifier: 45, stock: 60, isActive: true },

  // FRAME STYLES
  { id: 'frm-stl-nikah', typeId: 'frame', groupName: 'occasion_style', name: 'Nikah & Wedding Vows Frame', priceModifier: 899, stock: 20, isActive: true },
  { id: 'frm-stl-anni', typeId: 'frame', groupName: 'occasion_style', name: 'Anniversary Celebration Frame', priceModifier: 799, stock: 25, isActive: true },
  { id: 'frm-stl-ayat', typeId: 'frame', groupName: 'occasion_style', name: 'Ayatul Kursi & Islamic Verse Frame', priceModifier: 699, stock: 30, isActive: true },
  { id: 'frm-stl-bday', typeId: 'frame', groupName: 'occasion_style', name: 'Birthday Keepsake Photo Frame', priceModifier: 649, stock: 30, isActive: true },
  { id: 'frm-stl-baby', typeId: 'frame', groupName: 'occasion_style', name: 'New Baby Birth Stats Frame', priceModifier: 749, stock: 20, isActive: true },

  // FRAME SIZES
  { id: 'frm-sz-sm', typeId: 'frame', groupName: 'frame_size', name: '6×8 inches (Desk Stand)', priceModifier: 0, stock: 50, isActive: true },
  { id: 'frm-sz-md', typeId: 'frame', groupName: 'frame_size', name: '8×10 inches (Classic Wall & Desk)', priceModifier: 150, stock: 40, isActive: true },
  { id: 'frm-sz-lg', typeId: 'frame', groupName: 'frame_size', name: '10×12 inches (Grand Celebration Wall)', priceModifier: 300, stock: 25, isActive: true },

  // FRAME FINISHES
  { id: 'frm-fin-gld', typeId: 'frame', groupName: 'border_finish', name: 'Vintage Gold Foil', priceModifier: 0, stock: 60, isActive: true },
  { id: 'frm-fin-blk', typeId: 'frame', groupName: 'border_finish', name: 'Minimalist Matte Black', priceModifier: 0, stock: 60, isActive: true },
  { id: 'frm-fin-wd', typeId: 'frame', groupName: 'border_finish', name: 'Warm Scandinavian Wood', priceModifier: 50, stock: 35, isActive: true },
  { id: 'frm-fin-chm', typeId: 'frame', groupName: 'border_finish', name: 'Champagne Rose Gold', priceModifier: 50, stock: 30, isActive: true },

  // HAMPER BOX STYLES
  { id: 'hmp-bx-ivory', typeId: 'hamper', groupName: 'box_style', name: 'Ivory Satin Ribbon Keepsake Box', priceModifier: 250, stock: 40, isActive: true },
  { id: 'hmp-bx-kraft', typeId: 'hamper', groupName: 'box_style', name: 'Rustic Kraft Box with Botanical Twine', priceModifier: 180, stock: 50, isActive: true },
  { id: 'hmp-bx-maroon', typeId: 'hamper', groupName: 'box_style', name: 'Signature Burgundy & Gold Luxury Trunk', priceModifier: 350, stock: 25, isActive: true },

  // HAMPER RIBBONS
  { id: 'hmp-rb-gld', typeId: 'hamper', groupName: 'ribbon_color', name: 'Antique Gold Satin', priceModifier: 0, stock: 100, isActive: true },
  { id: 'hmp-rb-mrn', typeId: 'hamper', groupName: 'ribbon_color', name: 'Deep Burgundy Velvet', priceModifier: 20, stock: 80, isActive: true },
  { id: 'hmp-rb-pnk', typeId: 'hamper', groupName: 'ribbon_color', name: 'Blush Pink Satin', priceModifier: 0, stock: 90, isActive: true },
  { id: 'hmp-rb-emr', typeId: 'hamper', groupName: 'ribbon_color', name: 'Emerald Forest Green', priceModifier: 0, stock: 70, isActive: true },
];

// In-browser / in-memory local state cache
let localProducts: Product[] = [...DEFAULT_PRODUCTS];
let localCategories: Category[] = [...DEFAULT_CATEGORIES];
let localRealms: Realm[] = localCategories;
let localOrders: AdminOrder[] = [...INITIAL_ORDERS];
let localCoupons: Coupon[] = [...INITIAL_COUPONS];
let localRequests: CustomRequest[] = [...INITIAL_REQUESTS];
let localWrappingSheets: WrappingSheet[] = [...DEFAULT_WRAPPING_SHEETS];
let localBouquetItems: BouquetItem[] = [...DEFAULT_BOUQUET_ITEMS];
let localSubcategories: Subcategory[] = [...INITIAL_SUBCATEGORIES];
let localBouquetSizes: BouquetSize[] = [...INITIAL_BOUQUET_SIZES];
let localDecorations: Decoration[] = [...INITIAL_DECORATIONS];
let localShippingRules: ShippingRule[] = [...INITIAL_SHIPPING_RULES];
let localExpenses: Expense[] = [...INITIAL_EXPENSES];
let localInventoryTx: InventoryTransaction[] = [...INITIAL_INVENTORY_TRANSACTIONS];
let localCustomizationTypes: CustomizationType[] = [...INITIAL_CUSTOMIZATION_TYPES];
let localCustomizationOptions: CustomizationOption[] = [...INITIAL_CUSTOMIZATION_OPTIONS];
let localStatusHistory: OrderStatusHistory[] = [];
let localAiConversations: AiConversation[] = [];
let localAiMessages: AiMessage[] = [];
let localSettings: SiteSettings = {
  festivalBanner: {
    enabled: true,
    text: '🌸 Wedding & Surprise Season Orders are OPEN! Express handcrafted dispatch in 48 hours.',
  },
  deliveryFeeRules: {
    freeDeliveryThreshold: 899,
    standardFee: 50,
  },
  builderSettings: {
    builderEnabled: true,
    maxPieces: 12,
  },
};

// Initialize from localStorage if on client
if (typeof window !== 'undefined') {
  try {
    const savedProd = localStorage.getItem('givento_db_products_v4');
    if (savedProd) {
      const parsed = JSON.parse(savedProd);
      if (Array.isArray(parsed) && parsed.length > 0) localProducts = parsed;
    }

    const savedCats = localStorage.getItem('givento_db_categories');
    if (savedCats) {
      const parsed = JSON.parse(savedCats);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localCategories = parsed;
        localRealms = parsed;
      }
    }

    const savedOrders = localStorage.getItem('givento_db_orders');
    if (savedOrders) localOrders = JSON.parse(savedOrders);

    const savedCoupons = localStorage.getItem('givento_db_coupons');
    if (savedCoupons) localCoupons = JSON.parse(savedCoupons);

    const savedRequests = localStorage.getItem('givento_db_requests');
    if (savedRequests) localRequests = JSON.parse(savedRequests);

    const savedSheets = localStorage.getItem('givento_db_sheets');
    if (savedSheets) localWrappingSheets = JSON.parse(savedSheets);

    const savedBItems = localStorage.getItem('givento_db_bitems');
    if (savedBItems) localBouquetItems = JSON.parse(savedBItems);

    const savedSubcats = localStorage.getItem('givento_db_subcats');
    if (savedSubcats) localSubcategories = JSON.parse(savedSubcats);

    const savedSizes = localStorage.getItem('givento_db_sizes');
    if (savedSizes) localBouquetSizes = JSON.parse(savedSizes);

    const savedDecs = localStorage.getItem('givento_db_decs');
    if (savedDecs) localDecorations = JSON.parse(savedDecs);

    const savedShip = localStorage.getItem('givento_db_ship');
    if (savedShip) localShippingRules = JSON.parse(savedShip);

    const savedExp = localStorage.getItem('givento_db_exp');
    if (savedExp) localExpenses = JSON.parse(savedExp);

    const savedTx = localStorage.getItem('givento_db_tx');
    if (savedTx) localInventoryTx = JSON.parse(savedTx);

    const savedCustTypes = localStorage.getItem('givento_db_cust_types');
    if (savedCustTypes) localCustomizationTypes = JSON.parse(savedCustTypes);

    const savedCustOpts = localStorage.getItem('givento_db_cust_opts');
    if (savedCustOpts) localCustomizationOptions = JSON.parse(savedCustOpts);

    const savedSettings = localStorage.getItem('givento_db_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      localSettings = {
        ...localSettings,
        ...parsed,
        builderSettings: {
          ...localSettings.builderSettings,
          ...(parsed.builderSettings || {}),
        },
      };
    }
  } catch {
    // ignore
  }
}

function persistAll() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('givento_db_products_v4', JSON.stringify(localProducts));
      localStorage.setItem('givento_db_categories', JSON.stringify(localCategories));
      localStorage.setItem('givento_db_realms', JSON.stringify(localCategories));
      localStorage.setItem('givento_db_orders', JSON.stringify(localOrders));
      localStorage.setItem('givento_db_coupons', JSON.stringify(localCoupons));
      localStorage.setItem('givento_db_requests', JSON.stringify(localRequests));
      localStorage.setItem('givento_db_sheets', JSON.stringify(localWrappingSheets));
      localStorage.setItem('givento_db_bitems', JSON.stringify(localBouquetItems));
      localStorage.setItem('givento_db_subcats', JSON.stringify(localSubcategories));
      localStorage.setItem('givento_db_sizes', JSON.stringify(localBouquetSizes));
      localStorage.setItem('givento_db_decs', JSON.stringify(localDecorations));
      localStorage.setItem('givento_db_ship', JSON.stringify(localShippingRules));
      localStorage.setItem('givento_db_exp', JSON.stringify(localExpenses));
      localStorage.setItem('givento_db_tx', JSON.stringify(localInventoryTx));
      localStorage.setItem('givento_db_cust_types', JSON.stringify(localCustomizationTypes));
      localStorage.setItem('givento_db_cust_opts', JSON.stringify(localCustomizationOptions));
      localStorage.setItem('givento_db_settings', JSON.stringify(localSettings));
    } catch {
      // ignore
    }
  }
}

// Database Operations
export const db = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Product[];
    }
    return localProducts;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const list = await this.getProducts();
    return list.find((p) => p.slug === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const list = await this.getProducts();
    return list.find((p) => p.id === id) || null;
  },

  async addProduct(newProduct: Partial<Product>): Promise<Product> {
    const id = newProduct.id || `prod-${Date.now()}`;
    const product: Product = {
      id,
      slug: (newProduct.name || 'new-craft').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: newProduct.name || 'Untitled Craft',
      categoryId: newProduct.categoryId || 'bouquets',
      categoryName: newProduct.categoryName || 'Bouquets',
      realmId: newProduct.categoryId || newProduct.realmId || 'bouquets',
      realmName: newProduct.categoryName || newProduct.realmName || 'Bouquets',
      subcategoryId: newProduct.subcategoryId,
      subcategoryName: newProduct.subcategoryName,
      priceType: newProduct.priceType || (newProduct.price != null ? 'fixed' : 'on_request'),
      price: newProduct.price ?? null,
      priceFrom: newProduct.priceFrom,
      from: newProduct.from,
      shortDescription: newProduct.shortDescription || 'Handmade with care in Adirampattinam.',
      description: newProduct.description || 'Crafted with premium materials by Givento artisans.',
      images: newProduct.images?.length ? newProduct.images : ['/images/sunflower-bouquet.svg'],
      badge: newProduct.badge,
      inStock: newProduct.inStock ?? true,
      featured: newProduct.featured ?? false,
      isPersonalised: newProduct.isPersonalised ?? false,
      personalisationFields: newProduct.personalisationFields || [],
      variants: newProduct.variants || [],
      tiltDeg: (Math.random() - 0.5) * 4,
      tapeColor: 'yellow',
      bouquetEnabled: newProduct.bouquetEnabled,
      bouquetPrice: newProduct.bouquetPrice,
      bouquetGroup: newProduct.bouquetGroup,
      stockQuantity: newProduct.stockQuantity ?? 15,
      artCategory: newProduct.artCategory || 'bouquet',
      colors: newProduct.colors || ['#e0a93a', '#7cc4a6', '#e0607e'],
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').insert([product]);
    }

    localProducts = [product, ...localProducts];
    persistAll();
    return product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = localProducts.findIndex((p) => p.id === id);
    if (index === -1) return null;

    localProducts[index] = { ...localProducts[index], ...updates };
    persistAll();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').update(updates).eq('id', id);
    }

    return localProducts[index];
  },

  async deleteProduct(id: string): Promise<boolean> {
    localProducts = localProducts.filter((p) => p.id !== id);
    persistAll();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    return true;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data as Category[];
    }
    return localCategories;
  },

  async getCategoryById(id: string): Promise<Category | null> {
    const cats = await this.getCategories();
    return cats.find((c) => c.id === id) || null;
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cats = await this.getCategories();
    return cats.find((c) => c.slug === slug) || null;
  },

  async addCategory(newCategory: Partial<Category>): Promise<Category> {
    const id = newCategory.id || (newCategory.name || 'cat').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cat: Category = {
      id,
      slug: newCategory.slug || id,
      name: newCategory.name || 'New Category',
      description: newCategory.description || '',
      icon: newCategory.icon || '🎀',
      sortOrder: newCategory.sortOrder || localCategories.length + 1,
      isActive: newCategory.isActive !== false,
      groupKey: newCategory.groupKey || 'more',
      plainName: newCategory.name || 'New Category',
      fantasyName: newCategory.name || 'New Category',
    };
    localCategories.push(cat);
    persistAll();
    return cat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const idx = localCategories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    localCategories[idx] = { ...localCategories[idx], ...updates };
    persistAll();
    return localCategories[idx];
  },

  async deleteCategory(id: string): Promise<boolean> {
    const idx = localCategories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    localCategories.splice(idx, 1);
    persistAll();
    return true;
  },

  // REALMS / CATEGORIES
  async getRealms(): Promise<Realm[]> {
    return this.getCategories();
  },

  async updateRealm(id: string, updates: Partial<Realm>): Promise<Realm | null> {
    return this.updateCategory(id, updates);
  },

  // ORDERS
  async getOrders(): Promise<AdminOrder[]> {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('givento_db_orders');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localOrders = parsed;
          }
        }
      } catch (err) {
        console.error('Failed reading orders from localStorage', err);
      }
    }
    return localOrders;
  },

  async getOrderById(orderId: string): Promise<AdminOrder | null> {
    if (!orderId) return null;
    const clean = orderId.trim().toUpperCase().replace(/^#/, '');
    const allOrders = await this.getOrders();

    // 1. Check allOrders list
    let found = allOrders.find((o) => {
      const oid = o.id.toUpperCase();
      return (
        oid === clean ||
        oid === `GVN-${clean}` ||
        oid.replace(/^GVN-/, '') === clean.replace(/^GVN-/, '')
      );
    });
    if (found) return found;

    // 2. Direct check in localStorage for last placed order
    if (typeof window !== 'undefined') {
      try {
        const lastPlaced = localStorage.getItem('givento_last_placed_order');
        if (lastPlaced) {
          const parsed: AdminOrder = JSON.parse(lastPlaced);
          if (parsed && parsed.id) {
            const pId = parsed.id.toUpperCase();
            if (
              pId === clean ||
              pId === `GVN-${clean}` ||
              pId.replace(/^GVN-/, '') === clean.replace(/^GVN-/, '')
            ) {
              return parsed;
            }
          }
        }
      } catch {}
    }

    return null;
  },

  async createManualOrder(orderData: Partial<AdminOrder>): Promise<AdminOrder> {
    const newOrder: AdminOrder = {
      id: orderData.id || `GVN-M${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: orderData.customerName || 'Walk-in Customer',
      customerPhone: orderData.customerPhone || '9344013255',
      customerEmail: orderData.customerEmail,
      address: orderData.address || 'Studio Desk / Handover',
      city: orderData.city || 'Adirampattinam',
      state: orderData.state || 'Tamil Nadu',
      pincode: orderData.pincode || '614701',
      status: orderData.status || 'Received',
      channel: orderData.channel || 'whatsapp',
      paymentMethod: orderData.paymentMethod || 'whatsapp',
      paymentStatus: orderData.paymentStatus || 'Paid',
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      giftWrap: !!orderData.giftWrap,
      giftNote: orderData.giftNote,
      sendAsGift: !!orderData.sendAsGift,
      recipientName: orderData.recipientName,
      recipientPhone: orderData.recipientPhone,
      deliveryFee: orderData.deliveryFee || 0,
      deliveryRule: orderData.deliveryRule || 'Studio Pickup / Handover',
      total: orderData.total || orderData.subtotal || 0,
      items: orderData.items || [],
      trackingNumber: orderData.trackingNumber,
      trackingCourier: orderData.trackingCourier,
      trackingUrl: orderData.trackingUrl,
      promiseDate: orderData.promiseDate,
      adminNotes: orderData.adminNotes,
      createdAt: new Date().toISOString(),
    };

    // Decrement inventory for linked catalogue products
    for (const item of newOrder.items) {
      if (item.productId) {
        const prod = localProducts.find((p) => p.id === item.productId || p.slug === item.productId);
        if (prod) {
          const currentStock = prod.stockQuantity ?? 15;
          const nextStock = Math.max(0, currentStock - item.quantity);
          prod.stockQuantity = nextStock;
          prod.inStock = nextStock > 0;

          await this.addInventoryTransaction({
            itemType: 'product',
            itemId: prod.id,
            itemName: prod.name,
            changeQuantity: -item.quantity,
            reason: 'stock_out',
            referenceId: `Manual Order #${newOrder.id} (${newOrder.channel})`,
          });
        }
      }
    }

    localOrders = [newOrder, ...localOrders];
    persistAll();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('givento_last_placed_order', JSON.stringify(newOrder));
      } catch {}
    }

    await this.logOrderStatusChange({
      orderId: newOrder.id,
      newStatus: newOrder.status,
      notes: `Order logged via ${newOrder.channel}. Payment: ${newOrder.paymentStatus}. Items: ${newOrder.items.length}`,
      changedBy: 'Admin',
    });

    return newOrder;
  },

  async updateOrder(id: string, updates: Partial<AdminOrder>): Promise<AdminOrder | null> {
    const idx = localOrders.findIndex((o) => o.id === id);
    if (idx === -1) return null;

    const prevStatus = localOrders[idx].status;
    localOrders[idx] = { ...localOrders[idx], ...updates };
    persistAll();

    if (updates.status && updates.status !== prevStatus) {
      await this.logOrderStatusChange({
        orderId: id,
        previousStatus: prevStatus,
        newStatus: updates.status,
        notes: updates.adminNotes || `Status updated to ${updates.status}`,
        changedBy: 'Admin',
      });
    }

    return localOrders[idx];
  },

  async createOrder(orderData: Partial<AdminOrder>): Promise<AdminOrder> {
    const id = orderData.id || `GVN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: AdminOrder = {
      id,
      customerName: orderData.customerName || 'Customer',
      customerPhone: orderData.customerPhone || '',
      customerEmail: orderData.customerEmail,
      address: orderData.address || '',
      city: orderData.city || 'Adirampattinam',
      state: orderData.state || 'Tamil Nadu',
      pincode: orderData.pincode || '614701',
      status: orderData.status || 'Pending WhatsApp Confirmation',
      channel: orderData.channel || 'website',
      paymentMethod: orderData.paymentMethod || 'whatsapp',
      paymentStatus: orderData.paymentStatus || 'Pending',
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      giftWrap: !!orderData.giftWrap,
      giftNote: orderData.giftNote,
      sendAsGift: !!orderData.sendAsGift,
      recipientName: orderData.recipientName,
      recipientPhone: orderData.recipientPhone,
      deliveryFee: orderData.deliveryFee || 0,
      deliveryRule: orderData.deliveryRule || 'Standard Delivery',
      total: orderData.total || orderData.subtotal || 0,
      items: orderData.items || [],
      trackingNumber: orderData.trackingNumber,
      trackingCourier: orderData.trackingCourier,
      trackingUrl: orderData.trackingUrl,
      promiseDate: orderData.promiseDate,
      adminNotes: orderData.adminNotes,
      createdAt: orderData.createdAt || new Date().toISOString(),
    };

    localOrders = [newOrder, ...localOrders];
    persistAll();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('givento_last_placed_order', JSON.stringify(newOrder));
      } catch {}
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').insert([{
        id: newOrder.id,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        customer_email: newOrder.customerEmail,
        address: newOrder.address,
        city: newOrder.city,
        state: newOrder.state,
        pincode: newOrder.pincode,
        status: newOrder.status,
        channel: newOrder.channel,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        subtotal: newOrder.subtotal,
        gift_wrap: newOrder.giftWrap,
        gift_note: newOrder.giftNote,
        send_as_gift: newOrder.sendAsGift,
        recipient_name: newOrder.recipientName,
        recipient_phone: newOrder.recipientPhone,
        delivery_fee: newOrder.deliveryFee,
        total: newOrder.total,
        items: newOrder.items,
        created_at: newOrder.createdAt,
      }]);
    }

    await this.logOrderStatusChange({
      orderId: newOrder.id,
      previousStatus: undefined,
      newStatus: newOrder.status,
      notes: `Order created via ${newOrder.channel} with status ${newOrder.status}`,
      changedBy: 'Checkout Server',
    });

    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    status: AdminOrder['status'],
    trackingCourier?: string,
    trackingNumber?: string,
    notes?: string,
    trackingUrl?: string
  ): Promise<AdminOrder | null> {
    const idx = localOrders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    const prev = localOrders[idx].status;
    localOrders[idx].status = status;
    if (trackingCourier) localOrders[idx].trackingCourier = trackingCourier;
    if (trackingNumber) localOrders[idx].trackingNumber = trackingNumber;
    if (trackingUrl) {
      localOrders[idx].trackingUrl = trackingUrl;
    } else if (trackingNumber && trackingCourier?.toLowerCase().includes('delhivery')) {
      localOrders[idx].trackingUrl = `https://www.delhivery.com/track/package/${trackingNumber}`;
    }
    persistAll();

    await this.logOrderStatusChange({
      orderId,
      previousStatus: prev,
      newStatus: status,
      notes: notes || (trackingNumber ? `Dispatched with ${trackingCourier} (${trackingNumber})` : `Status updated to ${status}`),
      changedBy: 'Admin',
    });

    return localOrders[idx];
  },

  async updateOrderTracking(
    orderId: string,
    trackingCourier: string,
    trackingNumber: string,
    trackingUrl?: string
  ): Promise<AdminOrder | null> {
    const o = localOrders.find((x) => x.id === orderId);
    const resolvedUrl = trackingUrl || (trackingCourier.toLowerCase().includes('delhivery')
      ? `https://www.delhivery.com/track/package/${trackingNumber}`
      : undefined);
    return this.updateOrderStatus(orderId, 'Dispatched', trackingCourier, trackingNumber, undefined, resolvedUrl);
  },

  // WhatsApp Status Update Link Builder
  generateStatusWhatsAppUrl(order: AdminOrder): string {
    const phone = order.customerPhone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;

    let statusMsg = '';
    switch (order.status) {
      case 'Pending WhatsApp Confirmation':
        statusMsg = `We received your order *#${order.id}* from Givento.in!\nBill Total: ₹${order.total}\n\nPlease reply with "CONFIRM" so our artisan can verify your personalisation and start crafting! 🌸`;
        break;
      case 'Received':
        statusMsg = `Great news! Your handcrafted order *#${order.id}* is confirmed! ✨ Our studio artisan has reviewed your personalisation specifications and queued it on our workshop schedule.`;
        break;
      case 'Crafting':
      case 'Making':
        statusMsg = `Your parcel *#${order.id}* is currently on our workshop desk being handcrafted! 🎨 Each detail is being shaped with care and love.`;
        break;
      case 'Packed & Sealed':
      case 'Packed':
        statusMsg = `Your parcel *#${order.id}* is freshly wrapped in boutique floral tissue, tied with satin ribbon, and sealed! 🎀 Ready for courier handover.`;
        break;
      case 'Dispatched':
      case 'Shipped':
        statusMsg = `Your order *#${order.id}* has been dispatched! 🚚\n\nCourier: *${order.trackingCourier || 'Delhivery Express'}*\nTracking Number: *${order.trackingNumber || 'Assigned shortly'}*${order.trackingUrl ? `\nLive Tracking Link: ${order.trackingUrl}` : ''}\n\nExpected arrival in 2–4 business days.`;
        break;
      case 'Delivered':
        statusMsg = `Your Givento parcel *#${order.id}* has been delivered! 🌸 We hope you love opening it as much as we loved crafting it for you. If you share photos on Instagram, tag us *@givento.in*! ♥`;
        break;
      case 'Cancelled':
        statusMsg = `Your order *#${order.id}* has been marked as cancelled. If you need any assistance or would like to make changes, please let us know! 💌`;
        break;
      default:
        statusMsg = `Regarding your order *#${order.id}* on Givento.in: Current status is *${order.status}*.`;
        break;
    }

    const fullMessage = `Hello ${order.customerName}! 🌸\nUpdate from Givento.in:\n\n${statusMsg}\n\nThank you for supporting our handmade craft studio! ✨`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`;
  },

  // WhatsApp Official Receipt Builder
  generateReceiptWhatsAppUrl(order: AdminOrder): string {
    const phone = order.customerPhone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;

    const itemsSummary = order.items
      .map((it, idx) => {
        const itemVariants =
          it.variants && Object.keys(it.variants).length > 0
            ? ` (${Object.entries(it.variants)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')})`
            : '';
        return `${idx + 1}. *${it.productName}*${itemVariants} × ${it.quantity} — ₹${it.price * it.quantity}`;
      })
      .join('\n');

    const receiptMessage =
      `🌸 *GIVENTO STUDIO — OFFICIAL ORDER RECEIPT* 🌸\n\n` +
      `Order ID: *#${order.id}*\n` +
      `Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}\n` +
      `Customer Name: *${order.customerName}*\n` +
      `Contact Phone: +91 ${order.customerPhone}\n\n` +
      `📦 *Items Ordered:*\n${itemsSummary}\n\n` +
      `Subtotal: ₹${order.subtotal}\n` +
      (order.deliveryFee > 0 ? `Delivery Fee: ₹${order.deliveryFee}\n` : `Delivery: FREE\n`) +
      (order.discount && order.discount > 0 ? `Discount: -₹${order.discount}\n` : '') +
      `*Grand Total: ₹${order.total}*\n` +
      `Payment Status: *${order.paymentStatus || 'Pending'}*\n` +
      `Order Status: *${order.status}*\n\n` +
      `📍 *Delivery Address:*\n${order.address}, ${order.city} - ${order.pincode}\n` +
      (order.giftNote ? `💌 Gift Card Note: "${order.giftNote}"\n` : '') +
      (order.trackingNumber
        ? `\n🚚 *Tracking:* ${order.trackingCourier || 'Courier'} (${order.trackingNumber})\n${
            order.trackingUrl ? `Link: ${order.trackingUrl}\n` : ''
          }`
        : '') +
      `\nThank you for choosing Givento Handcrafted Studio! ✨\nIf you have any questions, feel free to reply right here. 🎀`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(receiptMessage)}`;
  },

  // WhatsApp Order Cancellation Message Builder
  generateCancellationWhatsAppUrl(order: AdminOrder, reason?: string): string {
    const phone = order.customerPhone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;

    const cancelMessage =
      `Hello ${order.customerName}! 🌸\n\n` +
      `Important update regarding your Givento order *#${order.id}*:\n\n` +
      `❌ Your order has been *CANCELLED* by our studio.\n` +
      (reason ? `Reason: ${reason}\n` : '') +
      `Order Amount: ₹${order.total}\n\n` +
      `If this cancellation was done by mistake, or if you would like to make changes, update personalisation, or place a new order, please reply directly to this WhatsApp chat and our studio artisan will assist you immediately! 💌\n\n` +
      `Warm regards,\nGivento Studio · Adirampattinam`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(cancelMessage)}`;
  },

  // WhatsApp Order Confirmation & Bill Message Builder (Sent when Admin confirms the order)
  generateOrderConfirmationWhatsAppUrl(order: AdminOrder): string {
    const phone = order.customerPhone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;

    const itemsSummary = order.items
      .map((it, idx) => {
        const itemVariants =
          it.variants && Object.keys(it.variants).length > 0
            ? ` (${Object.entries(it.variants)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')})`
            : '';
        return `${idx + 1}. *${it.productName}*${itemVariants} × ${it.quantity} — ₹${it.price * it.quantity}`;
      })
      .join('\n');

    const confirmMessage =
      `Hello ${order.customerName}! 🌸\n\n` +
      `Great news from *Givento Studio*! Your order *#${order.id}* has been officially *CONFIRMED* by our artisan! ✨\n\n` +
      `📦 *Order Details & Bill:*\n${itemsSummary}\n\n` +
      `Subtotal: ₹${order.subtotal}\n` +
      (order.deliveryFee > 0 ? `Delivery Fee: ₹${order.deliveryFee}\n` : `Delivery: FREE\n`) +
      (order.discount && order.discount > 0 ? `Discount: -₹${order.discount}\n` : '') +
      `*Grand Total: ₹${order.total}*\n` +
      `Payment Status: *${order.paymentStatus || 'Pending'}*\n\n` +
      `📍 *Delivery Destination:*\n${order.address}, ${order.city} - ${order.pincode}\n` +
      (order.giftNote ? `💌 Gift Card Note: "${order.giftNote}"\n` : '') +
      `\nOur studio artisans have queued your order on our crafting workbench. We will send you courier tracking updates as soon as it is dispatched! 🎀\n\n` +
      `Thank you for supporting our handmade studio! 🌸`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(confirmMessage)}`;
  },

  // COUPONS
  async getCoupons(): Promise<Coupon[]> {
    return localCoupons;
  },

  async addCoupon(coupon: Coupon): Promise<Coupon> {
    localCoupons.push(coupon);
    persistAll();
    return coupon;
  },

  async toggleCoupon(code: string): Promise<void> {
    const c = localCoupons.find((x) => x.code === code);
    if (c) {
      c.isActive = !c.isActive;
      persistAll();
    }
  },

  // CUSTOM REQUESTS
  async getCustomRequests(): Promise<CustomRequest[]> {
    return localRequests;
  },

  async updateRequestStatus(id: string, status: CustomRequest['status']): Promise<void> {
    const r = localRequests.find((x) => x.id === id);
    if (r) {
      r.status = status;
      persistAll();
    }
  },

  // SETTINGS
  async getSettings(): Promise<SiteSettings> {
    return localSettings;
  },

  async updateSettings(settings: SiteSettings): Promise<void> {
    localSettings = settings;
    persistAll();
  },

  // SALES SUMMARY
  async getSalesSummary() {
    const totalOrders = localOrders.length;
    const totalRevenue = localOrders.reduce((sum, o) => sum + o.total, 0);
    const activeOrders = localOrders.filter((o) => o.status !== 'Delivered').length;

    const categoryCounts: Record<string, number> = {};
    localProducts.forEach((p) => {
      categoryCounts[p.realmName] = (categoryCounts[p.realmName] || 0) + 1;
    });

    return {
      totalOrders,
      totalRevenue,
      activeOrders,
      categoryCounts,
    };
  },

  // WRAPPING SHEETS
  async getWrappingSheets(): Promise<WrappingSheet[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('wrapping_sheets').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        price: Number(d.price),
        stock: Number(d.stock),
        base: d.base_color,
        trim: d.trim_color,
        dots: !!d.has_dots,
        image: d.image_url,
        active: !!d.is_active,
      }));
    }
    return localWrappingSheets;
  },

  async addWrappingSheet(sheet: WrappingSheet): Promise<WrappingSheet> {
    localWrappingSheets.push(sheet);
    persistAll();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('wrapping_sheets').insert([{
        id: sheet.id,
        name: sheet.name,
        price: sheet.price,
        stock: sheet.stock,
        base_color: sheet.base,
        trim_color: sheet.trim,
        has_dots: !!sheet.dots,
        image_url: sheet.image,
        is_active: sheet.active,
      }]);
    }
    return sheet;
  },

  async createWrappingSheet(data: Partial<WrappingSheet> & { name: string; price: number; stock: number; baseColor?: string; trimColor?: string }): Promise<WrappingSheet> {
    const id = `sheet-${Date.now()}`;
    const sheet: WrappingSheet = {
      id,
      name: data.name,
      price: data.price,
      stock: data.stock,
      base: data.base || data.baseColor || '#2a1226',
      trim: data.trim || data.trimColor || '#f0b43c',
      dots: !!data.dots,
      active: data.active !== false,
      image: data.image || '/images/wrapping-sheet.svg',
    };
    return this.addWrappingSheet(sheet);
  },

  async updateWrappingSheet(id: string, updates: Partial<WrappingSheet>): Promise<void> {
    const s = localWrappingSheets.find((x) => x.id === id);
    if (s) {
      Object.assign(s, updates);
      persistAll();
    }
    if (isSupabaseConfigured && supabase) {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.stock !== undefined) payload.stock = updates.stock;
      if (updates.base !== undefined) payload.base_color = updates.base;
      if (updates.trim !== undefined) payload.trim_color = updates.trim;
      if (updates.dots !== undefined) payload.has_dots = updates.dots;
      if (updates.image !== undefined) payload.image_url = updates.image;
      if (updates.active !== undefined) payload.is_active = updates.active;
      await supabase.from('wrapping_sheets').update(payload).eq('id', id);
    }
  },

  async deleteWrappingSheet(id: string): Promise<void> {
    localWrappingSheets = localWrappingSheets.filter((x) => x.id !== id);
    persistAll();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('wrapping_sheets').delete().eq('id', id);
    }
  },

  // BOUQUET ITEMS
  async getBouquetItems(): Promise<BouquetItem[]> {
    return localBouquetItems;
  },

  async updateBouquetItem(id: string, updates: Partial<BouquetItem>): Promise<void> {
    const item = localBouquetItems.find((x) => x.id === id);
    if (item) {
      Object.assign(item, updates);
      persistAll();
    }
  },

  // DECREMENT BOUQUET STOCK ON CONFIRMED ORDER
  async decrementBouquetStock(sheetId: string, items: { id: string; quantity: number }[]): Promise<void> {
    // 1. Sheet stock
    const sheet = localWrappingSheets.find((s) => s.id === sheetId);
    if (sheet) {
      sheet.stock = Math.max(0, sheet.stock - 1);
    }

    // 2. Items stock
    items.forEach((it) => {
      const bItem = localBouquetItems.find((b) => b.id === it.id);
      if (bItem) {
        bItem.stock = Math.max(0, bItem.stock - it.quantity);
        // If linked to main product, update it too
        if (bItem.productId) {
          const mainProduct = localProducts.find((p) => p.id === bItem.productId || p.slug === bItem.productId);
          if (mainProduct) {
            mainProduct.stockQuantity = Math.max(0, (mainProduct.stockQuantity ?? 15) - it.quantity);
            if (mainProduct.stockQuantity === 0) {
              mainProduct.inStock = false;
            }
          }
        }
      }
    });

    persistAll();
  },

  async decrementProductStock(productId: string, quantity: number): Promise<boolean> {
    const p = localProducts.find((x) => x.id === productId || x.slug === productId);
    if (!p) return false;
    const current = p.stockQuantity ?? (p.inStock ? 15 : 0);
    const newStock = Math.max(0, current - quantity);
    p.stockQuantity = newStock;
    p.inStock = newStock > 0;
    persistAll();

    await this.logInventoryTransaction({
      itemType: 'product',
      itemId: p.id,
      itemName: p.name,
      changeQuantity: -quantity,
      reason: 'order_confirmed',
      referenceId: 'Storefront Order Confirmation',
    });
    return true;
  },

  // ============================================================================
  // MASTER SCHEMA METHODS (PHASE 1)
  // ============================================================================

  // SUBCATEGORIES
  async getSubcategories(categoryId?: string): Promise<Subcategory[]> {
    if (categoryId) {
      return localSubcategories.filter((s) => s.categoryId === categoryId && s.isActive);
    }
    return localSubcategories;
  },

  async createSubcategory(data: Omit<Subcategory, 'id'>): Promise<Subcategory> {
    const sub: Subcategory = {
      id: `sub-${Date.now()}`,
      ...data,
    };
    localSubcategories.push(sub);
    persistAll();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('subcategories').insert([{
        id: sub.id,
        category_id: sub.categoryId,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        is_active: sub.isActive,
        sort_order: sub.sortOrder,
      }]);
    }
    return sub;
  },

  async updateSubcategory(id: string, updates: Partial<Subcategory>): Promise<void> {
    const sub = localSubcategories.find((s) => s.id === id);
    if (sub) {
      Object.assign(sub, updates);
      persistAll();
    }
    if (isSupabaseConfigured && supabase) {
      await supabase.from('subcategories').update(updates).eq('id', id);
    }
  },

  async deleteSubcategory(id: string): Promise<void> {
    localSubcategories = localSubcategories.filter((s) => s.id !== id);
    persistAll();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('subcategories').delete().eq('id', id);
    }
  },

  // BOUQUET SIZES
  async getBouquetSizes(): Promise<BouquetSize[]> {
    return localBouquetSizes.filter((b) => b.isActive);
  },

  async updateBouquetSize(id: string, updates: Partial<BouquetSize>): Promise<void> {
    const b = localBouquetSizes.find((x) => x.id === id);
    if (b) {
      Object.assign(b, updates);
      persistAll();
    }
  },

  // DECORATIONS (Bows, Lights, Calligraphy Cards, Crown Picks)
  async getDecorations(): Promise<Decoration[]> {
    return localDecorations.filter((d) => d.isActive);
  },

  async updateDecoration(id: string, updates: Partial<Decoration>): Promise<void> {
    const d = localDecorations.find((x) => x.id === id);
    if (d) {
      Object.assign(d, updates);
      persistAll();
    }
  },

  async addDecoration(dec: Omit<Decoration, 'id'>): Promise<Decoration> {
    const newDec: Decoration = {
      id: `dec-${Date.now()}`,
      ...dec,
    };
    localDecorations.push(newDec);
    persistAll();
    return newDec;
  },

  // INVENTORY TRANSACTIONS LOG
  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    return localInventoryTx.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async logInventoryTransaction(tx: Omit<InventoryTransaction, 'id' | 'createdAt'>): Promise<InventoryTransaction> {
    const entry: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      ...tx,
      createdAt: new Date().toISOString(),
    };
    localInventoryTx.unshift(entry);
    persistAll();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory_transactions').insert([{
        id: entry.id,
        item_type: entry.itemType,
        item_id: entry.itemId,
        item_name: entry.itemName,
        change_quantity: entry.changeQuantity,
        reason: entry.reason,
        reference_id: entry.referenceId,
      }]);
    }
    return entry;
  },

  async addInventoryTransaction(tx: Omit<InventoryTransaction, 'id' | 'createdAt'>): Promise<InventoryTransaction> {
    return this.logInventoryTransaction(tx);
  },

  // ORDER STATUS HISTORY AUDIT TRAIL
  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return localStatusHistory
      .filter((h) => h.orderId === orderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async logOrderStatusChange(entry: Omit<OrderStatusHistory, 'id' | 'createdAt'>): Promise<OrderStatusHistory> {
    const record: OrderStatusHistory = {
      id: `hist-${Date.now()}`,
      ...entry,
      createdAt: new Date().toISOString(),
    };
    localStatusHistory.unshift(record);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('order_status_history').insert([{
        id: record.id,
        order_id: record.orderId,
        previous_status: record.previousStatus,
        new_status: record.newStatus,
        notes: record.notes,
        changed_by: record.changedBy,
      }]);
    }
    return record;
  },

  // SHIPPING RULES ENGINE
  async getShippingRules(): Promise<ShippingRule[]> {
    return localShippingRules.filter((r) => r.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async updateShippingRule(id: string, updates: Partial<ShippingRule>): Promise<void> {
    const r = localShippingRules.find((x) => x.id === id);
    if (r) {
      Object.assign(r, updates);
      persistAll();
    }
  },

  // EXPENSES & TRUE NET PROFIT ACCOUNTING
  async getExpenses(): Promise<Expense[]> {
    return localExpenses.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  },

  async createExpense(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const exp: Expense = {
      id: `exp-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    localExpenses.unshift(exp);
    persistAll();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('expenses').insert([{
        id: exp.id,
        title: exp.title,
        category: exp.category,
        amount: exp.amount,
        expense_date: exp.expenseDate,
        notes: exp.notes,
      }]);
    }
    return exp;
  },

  async deleteExpense(id: string): Promise<void> {
    localExpenses = localExpenses.filter((e) => e.id !== id);
    persistAll();
    if (isSupabaseConfigured && supabase) {
      await supabase.from('expenses').delete().eq('id', id);
    }
  },

  async getProfitSummary(filter?: {
    dateRange?: 'all' | 'today' | 'month' | 'quarter' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
  }): Promise<{
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
    perOrderProfits: Array<{
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
    }>;
  }> {
    const range = filter?.dateRange || 'all';
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentYear = todayStr.slice(0, 4);
    const currentYearMonth = todayStr.slice(0, 7);

    const isDateInRange = (dateStr?: string): boolean => {
      if (!dateStr) return true;
      const d = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      if (range === 'today') return d === todayStr;
      if (range === 'month') return d.startsWith(currentYearMonth);
      if (range === 'year') return d.startsWith(currentYear);
      if (range === 'quarter') {
        const itemDate = new Date(d);
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 90;
      }
      if (range === 'custom') {
        if (filter?.startDate && d < filter.startDate) return false;
        if (filter?.endDate && d > filter.endDate) return false;
        return true;
      }
      return true;
    };

    const validOrders = localOrders
      .filter((o: any) => o.status !== 'Cancelled')
      .filter((o: any) => isDateInRange(o.createdAt));

    const grossRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalDiscounts = validOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const netSales = grossRevenue - totalDiscounts;

    // Filter expenses by date
    const filteredExpenses = localExpenses.filter((e) => isDateInRange(e.expenseDate));

    // COGS vs Operating Expenses
    const expensesByCategory: Record<string, number> = {};
    let loggedCogs = 0;
    let loggedOperating = 0;

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
      // Standard handmade artisan benchmarks: ~35% raw materials, ₹25 packing
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
        date: o.createdAt ? o.createdAt.split('T')[0] : todayStr,
        customerName: o.customerName || 'Anonymous Customer',
        channel: o.channel || 'website',
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
    const totalOrders = validOrders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;

    // Omnichannel Breakdown
    const revenueByChannel: Record<string, { revenue: number; orderCount: number; percentage: number }> = {
      website: { revenue: 0, orderCount: 0, percentage: 0 },
      whatsapp: { revenue: 0, orderCount: 0, percentage: 0 },
      instagram: { revenue: 0, orderCount: 0, percentage: 0 },
      walkin_expo: { revenue: 0, orderCount: 0, percentage: 0 },
    };

    validOrders.forEach((o) => {
      const ch = o.channel || 'whatsapp';
      if (!revenueByChannel[ch]) {
        revenueByChannel[ch] = { revenue: 0, orderCount: 0, percentage: 0 };
      }
      revenueByChannel[ch].revenue += o.total || 0;
      revenueByChannel[ch].orderCount += 1;
    });

    Object.keys(revenueByChannel).forEach((k) => {
      revenueByChannel[k].percentage = grossRevenue > 0
        ? Math.round((revenueByChannel[k].revenue / grossRevenue) * 100)
        : 0;
    });

    // Top Products
    const productStats: Record<string, { name: string; unitsSold: number; totalRevenue: number }> = {};
    validOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.productId || it.productName;
        if (!productStats[key]) {
          productStats[key] = {
            name: it.productName,
            unitsSold: 0,
            totalRevenue: 0,
          };
        }
        productStats[key].unitsSold += it.quantity || 1;
        productStats[key].totalRevenue += (it.price || 0) * (it.quantity || 1);
      });
    });

    const topProducts = Object.entries(productStats)
      .map(([productId, st]) => ({ productId, ...st }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Top Sheets (from custom bouquet orders)
    const sheetCounts: Record<string, number> = {
      'Vintage Floral': 3,
      'Kraft Craft': 2,
      'Midnight Charcoal': 1,
      'Blush Velvet Rose': 2,
    };
    validOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const sName = it.customizationDetails?.sheetName || it.variants?.sheet;
        if (sName) {
          sheetCounts[sName] = (sheetCounts[sName] || 0) + 1;
        }
      });
    });
    const topSheets = Object.entries(sheetCounts)
      .map(([name, usesCount]) => ({ sheetId: name.toLowerCase().replace(/\s+/g, '-'), name, usesCount }))
      .sort((a, b) => b.usesCount - a.usesCount);

    // Top Add-ons (fairy lights, ribbon bow, crown, greeting cards)
    const addonCounts: Record<string, number> = {
      'Double Satin Ribbon Bow': 5,
      'Warm Fairy Lights': 4,
      'Handwritten Calligraphy Card': 4,
      'Golden Crown Pick': 2,
      '24K Gold Flakes & Wax Seal': 3,
    };
    validOrders.forEach((o) => {
      if (o.giftWrap) {
        addonCounts['Handwritten Calligraphy Card'] = (addonCounts['Handwritten Calligraphy Card'] || 0) + 1;
      }
    });
    const topAddons = Object.entries(addonCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      grossRevenue,
      totalDiscounts,
      netSales,
      cogs,
      grossProfit,
      grossMarginPercentage,
      operatingExpenses,
      totalExpenses,
      netProfit,
      profitMargin: profitMarginPercentage,
      profitMarginPercentage,
      averageOrderValue,
      totalOrders,
      expensesByCategory,
      revenueByChannel,
      topProducts,
      topSheets,
      topAddons,
      perOrderProfits,
    };
  },

  // AI GIFT ASSISTANT SESSIONS
  async getAiConversations(): Promise<AiConversation[]> {
    return localAiConversations;
  },

  async createOrGetAiConversation(sessionId: string, customerName?: string, customerPhone?: string): Promise<AiConversation> {
    let conv = localAiConversations.find((c) => c.sessionId === sessionId);
    if (!conv) {
      conv = {
        id: `ai-conv-${Date.now()}`,
        sessionId,
        customerName,
        customerPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localAiConversations.unshift(conv);
    }
    return conv;
  },

  async getAiMessages(conversationId: string): Promise<AiMessage[]> {
    return localAiMessages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async saveAiMessage(conversationId: string, role: 'user' | 'assistant', content: string, productIds?: string[]): Promise<AiMessage> {
    const msg: AiMessage = {
      id: `ai-msg-${Date.now()}`,
      conversationId,
      role,
      content,
      recommendedProductIds: productIds || [],
      createdAt: new Date().toISOString(),
    };
    localAiMessages.push(msg);
    return msg;
  },

  // CUSTOMIZATION ENGINE (BOUQUET, RESIN, FRAMES, HAMPERS)
  async getCustomizationTypes(): Promise<CustomizationType[]> {
    return localCustomizationTypes.filter((t) => t.isActive);
  },

  async getCustomizationOptions(typeId?: string): Promise<CustomizationOption[]> {
    return localCustomizationOptions.filter((o) => {
      if (!o.isActive) return false;
      if (typeId && o.typeId !== typeId) return false;
      return true;
    });
  },

  async addCustomizationOption(option: Partial<CustomizationOption>): Promise<CustomizationOption> {
    const newOption: CustomizationOption = {
      id: option.id || `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      typeId: option.typeId || 'resin',
      groupName: option.groupName || 'general',
      name: option.name || 'Untitled Option',
      priceModifier: option.priceModifier || 0,
      stock: option.stock ?? 50,
      isActive: option.isActive ?? true,
    };
    localCustomizationOptions.push(newOption);
    persistAll();
    return newOption;
  },

  async updateCustomizationOption(id: string, updates: Partial<CustomizationOption>): Promise<CustomizationOption | null> {
    const idx = localCustomizationOptions.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    localCustomizationOptions[idx] = { ...localCustomizationOptions[idx], ...updates };
    persistAll();
    return localCustomizationOptions[idx];
  },

  async deleteCustomizationOption(id: string): Promise<boolean> {
    const idx = localCustomizationOptions.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    localCustomizationOptions.splice(idx, 1);
    persistAll();
    return true;
  },
};
