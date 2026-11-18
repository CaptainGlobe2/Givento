export type PriceType = 'fixed' | 'from' | 'range' | 'on_request';

export interface PersonalisationField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'photo' | 'select' | 'arabic_text';
  placeholder?: string;
  required: boolean;
  options?: string[];
  helpText?: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive: boolean;
  groupKey?: string;
  plainName?: string;
  fantasyName?: string;
  tagColor?: 'peach' | 'rose' | 'mint' | 'sky' | 'gold' | 'lavender';
  tiltDeg?: number;
  highlightItem?: string;
}

export type Realm = Category;

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  realmId: string;
  realmName: string;
  priceType: PriceType;
  price?: number | null;
  priceFrom?: number;
  priceTo?: number;
  originalPrice?: number;
  from?: boolean;
  shortDescription: string;
  description: string;
  images: string[];
  badge?: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  isNew?: boolean;
  isPersonalised?: boolean;
  personalisationFields?: PersonalisationField[];
  subcategoryId?: string;
  subcategoryName?: string;
  variants?: ProductVariant[];
  tiltDeg?: number;
  tapeColor?: 'yellow' | 'mint' | 'rose' | 'gold' | 'sky' | 'peach' | 'lavender';
  storySnippet?: string;
  bouquetEnabled?: boolean;
  bouquetPrice?: number;
  bouquetGroup?: 'choc' | 'photo' | 'flower' | 'jewel' | 'more';
  stockQuantity?: number;
  artCategory?: string;
  colors?: [string, string, string];
}

export interface BasketItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
  personalisationData?: Record<string, string>;
  giftWrap?: boolean;
  giftNote?: string;
  isCustomBouquet?: boolean;
  customBouquet?: import('./bouquet').CustomBouquetLine;
}

export interface ExpoEvent {
  id: string;
  title: string;
  dates: string;
  location: string;
  city: string;
  booth: string;
  note: string;
  isUpcoming: boolean;
}

export interface Review {
  id: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  productPurchased: string;
  date: string;
  accentColor: string;
  tiltDeg: number;
  isApproved?: boolean;
  photoUrl?: string;
}

export * from './bouquet';
export * from './master';

