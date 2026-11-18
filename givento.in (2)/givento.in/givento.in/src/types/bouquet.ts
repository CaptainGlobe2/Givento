export type BouquetGroup = 'choc' | 'photo' | 'flower' | 'jewel' | 'more';

export interface WrappingSheet {
  id: string;
  name: string;
  price: number;
  stock: number;
  base: string;
  trim: string;
  dots?: boolean;
  image?: string;
  active: boolean;
}

export interface BouquetItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  stock: number;
  group: BouquetGroup;
  shape: 'choc' | 'photo' | 'rose' | 'bracelet' | 'chain' | 'key' | 'clip' | 'card';
  color: string;
  image?: string;
}

export interface CustomBouquetItemSelection {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  group: BouquetGroup;
}

export interface CustomBouquetLine {
  key: string;
  sheetId: string;
  sheetName: string;
  sheetPrice: number;
  selectedSizeId?: string;
  selectedSizeName?: string;
  sizeBaseCharge?: number;
  decorations?: { id: string; name: string; price: number }[];
  cardMessage?: string;
  items: CustomBouquetItemSelection[];
  totalPrice: number;
  description: string;
  hasPhotos: boolean;
  uploadedPhotos?: string[];
  photoUploadNote?: string;
}

export interface BouquetBuilderSettings {
  builderEnabled: boolean;
  maxPieces: number;
}
