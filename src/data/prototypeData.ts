export interface PrototypeGroup {
  k: string;
  label: string;
  cats: string[];
}

export interface PrototypeProduct {
  id: number;
  cat: string;
  name: string;
  desc: string;
  price: number | null;
  from?: boolean;
  custom?: boolean;
  c: [string, string, string];
}

export const ROSE = '#e0607e';
export const GOLD = '#e0a93a';
export const MINT = '#7cc4a6';
export const SKY = '#7fb2e0';
export const LILAC = '#b79be0';
export const PEACH = '#f5a784';
export const MAROON = '#a8324f';

export const PROTOTYPE_GROUPS: PrototypeGroup[] = [
  { k: 'bouquet', label: 'Bouquets', cats: ['bouquet'] },
  { k: 'frame', label: 'Frames', cats: ['frame'] },
  { k: 'hamper', label: 'Gift hampers', cats: ['hamper'] },
  { k: 'resin', label: 'Resin & keychains', cats: ['resin', 'keychain'] },
  { k: 'jewel', label: 'Jewellery', cats: ['necklace', 'bracelet', 'handchain'] },
  { k: 'more', label: 'Accessories & toys', cats: ['accessory', 'car'] },
];

export const PROTOTYPE_PRODUCTS: PrototypeProduct[] = [
  { id: 1, cat: 'bouquet', name: 'Sunflower Bouquet', desc: "Brighten someone's day with a little sunshine.", price: 119, c: [GOLD, MINT, ROSE] },
  { id: 2, cat: 'bouquet', name: 'Rose Bouquet, 7 flowers', desc: 'Soft roses with a pearl lace edge.', price: 325, c: [ROSE, LILAC, GOLD] },
  { id: 3, cat: 'bouquet', name: 'Rose Bouquet, 17 flowers', desc: 'The big one. Seventeen roses in one wrap.', price: 599, c: [ROSE, PEACH, GOLD] },
  { id: 4, cat: 'bouquet', name: 'KitKat Chocolate Bouquet', desc: 'Chocolates in black wrap with a yellow ribbon.', price: null, c: [MAROON, GOLD, ROSE] },
  { id: 5, cat: 'bouquet', name: 'Photo Bouquet', desc: 'Roses and polaroid photos in polka-dot wrap.', price: null, custom: true, c: [LILAC, ROSE, GOLD] },
  { id: 6, cat: 'frame', name: 'Nikah Frame', desc: 'Your names, the date and a verse, framed.', price: null, custom: true, c: [GOLD, MAROON, ROSE] },
  { id: 7, cat: 'frame', name: 'Photo Frame', desc: 'A framed photo with your names and a message.', price: null, custom: true, c: [ROSE, GOLD, LILAC] },
  { id: 8, cat: 'hamper', name: 'Gift for Her Hamper', desc: 'Perfume, a stainless steel chain and chocolate in a pink box.', price: null, c: [ROSE, LILAC, GOLD] },
  { id: 9, cat: 'hamper', name: 'Chocolate & Rose Gift Set', desc: 'Chocolate, a rose, a pen and a card.', price: null, c: [MAROON, ROSE, GOLD] },
  { id: 10, cat: 'hamper', name: 'Blind Date with a Book', desc: 'A surprise book, picked and wrapped for you.', price: null, c: [SKY, GOLD, LILAC] },
  { id: 11, cat: 'resin', name: 'Resin Wall Clock', desc: 'A floral resin clock with your names or a verse.', price: null, custom: true, c: [MINT, ROSE, GOLD] },
  { id: 12, cat: 'keychain', name: 'Resin Name Keychain', desc: 'Your name in Arabic or English, with pearls and gold flakes.', price: null, custom: true, c: [ROSE, GOLD, LILAC] },
  { id: 13, cat: 'necklace', name: 'Stainless Steel Chains', desc: 'Moon, heart, infinity, bow and angel heart.', price: 199, from: true, c: [GOLD, LILAC, ROSE] },
  { id: 14, cat: 'necklace', name: 'Flower & Heart Rings', desc: 'A whole tray of coloured stone rings.', price: null, c: [GOLD, SKY, ROSE] },
  { id: 15, cat: 'necklace', name: 'Traditional Jewellery Sets', desc: 'Necklaces, earrings and jhumkas.', price: 499, from: true, c: [MAROON, GOLD, ROSE] },
  { id: 16, cat: 'bracelet', name: 'Stainless Steel Bracelets & Anklets', desc: 'Dainty bows, stars, infinity and flowers.', price: 179, from: true, c: [GOLD, SKY, ROSE] },
  { id: 17, cat: 'handchain', name: 'Mehandi Hand Chain + Watch', desc: 'Stainless steel hand chains, some with a watch.', price: 249, from: true, c: [GOLD, ROSE, MINT] },
  { id: 18, cat: 'accessory', name: 'Crochet Alligator Clips', desc: 'Little crochet flowers in soft colours.', price: null, c: [LILAC, MINT, ROSE] },
  { id: 19, cat: 'accessory', name: 'Hibiscus Mini Clutcher', desc: 'Soft-petal flower clutchers.', price: null, c: [SKY, ROSE, GOLD] },
  { id: 20, cat: 'accessory', name: 'Flower Banana Clips', desc: 'Matte flower-shaped banana clips.', price: null, c: [PEACH, MAROON, LILAC] },
  { id: 21, cat: 'accessory', name: 'Organic Henna Cones', desc: 'Organic henna, rolled into cones.', price: null, c: [PEACH, GOLD, MINT] },
  { id: 22, cat: 'car', name: 'Panda Trio Toy Set', desc: 'Three little pandas in a box.', price: null, c: [MINT, ROSE, GOLD] },
];

export interface PrototypeBouquetSize {
  id: string;
  name: string;
  max: number;
  price: number;
}

export const PROTOTYPE_SIZES: PrototypeBouquetSize[] = [
  { id: 'sm', name: 'Small', max: 6, price: 0 },
  { id: 'md', name: 'Medium', max: 12, price: 30 },
  { id: 'lg', name: 'Large', max: 20, price: 60 },
];

export interface PrototypeWrappingSheet {
  id: string;
  name: string;
  price: number;
  stock: number;
  base: string;
  trim: string;
  dots: boolean;
}

export const PROTOTYPE_SHEETS: PrototypeWrappingSheet[] = [
  { id: 's1', name: 'Black & gold', price: 60, stock: 12, base: '#2a1d23', trim: '#e0a93a', dots: false },
  { id: 's2', name: 'Polka-dot white', price: 60, stock: 9, base: '#ffffff', trim: '#2a1d23', dots: true },
  { id: 's3', name: 'Blush pink', price: 50, stock: 15, base: '#f9c6d3', trim: '#ffffff', dots: false },
  { id: 's4', name: 'Kraft brown', price: 40, stock: 3, base: '#c9a171', trim: '#a8324f', dots: false },
  { id: 's5', name: 'Lilac shimmer', price: 70, stock: 0, base: '#c3a6e8', trim: '#ffffff', dots: false },
];

export interface PrototypeBouquetItem {
  id: string;
  group: 'choc' | 'photo' | 'flower' | 'jewel' | 'more';
  name: string;
  price: number;
  stock: number;
  shape: 'choc' | 'photo' | 'rose' | 'bracelet' | 'chain' | 'key' | 'clip' | 'card';
  color: string;
}

export const PROTOTYPE_BOUQUET_ITEMS: PrototypeBouquetItem[] = [
  { id: 'b1', group: 'choc', name: 'KitKat', price: 25, stock: 30, shape: 'choc', color: '#d93a3a' },
  { id: 'b2', group: 'choc', name: 'Dairy Milk', price: 30, stock: 24, shape: 'choc', color: '#5b3fa3' },
  { id: 'b10', group: 'choc', name: 'Ferrero Rocher', price: 45, stock: 0, shape: 'choc', color: '#c9a171' },
  { id: 'b3', group: 'photo', name: 'Polaroid photo print', price: 25, stock: 50, shape: 'photo', color: '#7fb2e0' },
  { id: 'b4', group: 'flower', name: 'Satin rose', price: 35, stock: 20, shape: 'rose', color: '#e0607e' },
  { id: 'b5', group: 'jewel', name: 'Stainless steel bracelet', price: 179, stock: 10, shape: 'bracelet', color: '#e0a93a' },
  { id: 'b6', group: 'jewel', name: 'Stainless steel chain', price: 199, stock: 4, shape: 'chain', color: '#e0a93a' },
  { id: 'b7', group: 'more', name: 'Resin name keychain', price: 120, stock: 6, shape: 'key', color: '#f4a3b8' },
  { id: 'b8', group: 'more', name: 'Crochet flower clip', price: 60, stock: 12, shape: 'clip', color: '#b79be0' },
  { id: 'b9', group: 'more', name: 'Handwritten card', price: 15, stock: 40, shape: 'card', color: '#fbe7a1' },
];

export const PROTOTYPE_BOUQUET_GROUPS: [string, string][] = [
  ['all', 'Everything'],
  ['choc', 'Chocolates'],
  ['photo', 'Photos'],
  ['flower', 'Flowers'],
  ['jewel', 'Bracelets & chains'],
  ['more', 'More treats'],
];
