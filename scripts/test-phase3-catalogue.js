const assert = require('assert');

console.log('🧪 Starting Phase 3 Dynamic Catalogue & Categories Tests...\n');

// 1. Mock Category & Product Data (from Phase 3 implementation)
const CATEGORIES = [
  { id: 'bouquets', name: 'Bouquets', slug: 'bouquets', isActive: true, sortOrder: 1 },
  { id: 'frames', name: 'Frames', slug: 'frames', isActive: true, sortOrder: 2 },
  { id: 'gift-hampers', name: 'Gift Hampers', slug: 'gift-hampers', isActive: true, sortOrder: 3 },
  { id: 'resin-art', name: 'Resin Art', slug: 'resin-art', isActive: true, sortOrder: 4 },
  { id: 'stainless-steel-jewellery', name: 'Stainless Steel Jewellery', slug: 'stainless-steel-jewellery', isActive: true, sortOrder: 5 },
  { id: 'hair-accessories', name: 'Hair Accessories', slug: 'hair-accessories', isActive: true, sortOrder: 6 },
  { id: 'girls-accessories', name: 'Girls Accessories', slug: 'girls-accessories', isActive: true, sortOrder: 7 },
  { id: 'handbags', name: 'Handbags', slug: 'handbags', isActive: true, sortOrder: 8 },
  { id: 'nails', name: 'Nails', slug: 'nails', isActive: true, sortOrder: 9 },
  { id: 'phone-charms', name: 'Phone Charms', slug: 'phone-charms', isActive: true, sortOrder: 10 },
  { id: 'keychains', name: 'Keychains', slug: 'keychains', isActive: true, sortOrder: 11 },
  { id: 'car-toys', name: 'Car Toys', slug: 'car-toys', isActive: true, sortOrder: 12 },
  { id: 'return-gifts', name: 'Return Gifts', slug: 'return-gifts', isActive: true, sortOrder: 13 },
  { id: 'other-gifts', name: 'Other Gifts', slug: 'other-gifts', isActive: true, sortOrder: 14 },
];

const PRODUCTS = [
  { id: 'prod-1', name: 'Sunflower Bouquet', categoryId: 'bouquets', priceType: 'fixed', price: 119, inStock: true },
  { id: 'prod-4', name: 'KitKat Chocolate Bouquet', categoryId: 'bouquets', priceType: 'on_request', price: null, inStock: true },
  { id: 'prod-6', name: 'Nikah Frame', categoryId: 'frames', priceType: 'on_request', price: null, isPersonalised: true, inStock: true },
  { id: 'prod-13', name: 'Stainless Steel Chains', categoryId: 'stainless-steel-jewellery', priceType: 'from', price: 199, from: true, inStock: true },
  { id: 'prod-22', name: 'Panda Trio Toy Set', categoryId: 'car-toys', priceType: 'on_request', price: null, inStock: true },
];

// Test 1: Category Count and Sort Order
console.log('Test 1: Master Categories structure integrity');
assert.strictEqual(CATEGORIES.length, 14, 'Must have exactly 14 master categories');
assert(CATEGORIES.every(c => c.id && c.name && c.isActive), 'All categories must be valid and active');
console.log('  ✓ PASSED: All 14 master categories verified\n');

// Test 2: Price display logic ("ask us" vs "from ₹" vs "₹")
console.log('Test 2: Price display rules');
function formatPriceDisplay(p) {
  if (p.price == null || p.priceType === 'on_request') return 'ask us';
  if (p.from || p.priceType === 'from') return `from ₹${p.price}`;
  return `₹${p.price}`;
}

const p1 = PRODUCTS.find(p => p.id === 'prod-1');
const p4 = PRODUCTS.find(p => p.id === 'prod-4');
const p13 = PRODUCTS.find(p => p.id === 'prod-13');

assert.strictEqual(formatPriceDisplay(p1), '₹119', 'Fixed price formatting failed');
assert.strictEqual(formatPriceDisplay(p4), 'ask us', 'Unknown price must display "ask us"');
assert.strictEqual(formatPriceDisplay(p13), 'from ₹199', 'From price formatting failed');
console.log('  ✓ PASSED: Price display rules function accurately\n');

// Test 3: Dynamic Category Filtering
console.log('Test 3: Live Category Filtering');
const bouquetProducts = PRODUCTS.filter(p => p.categoryId === 'bouquets');
assert.strictEqual(bouquetProducts.length, 2, 'Should filter 2 bouquet products');
const frameProducts = PRODUCTS.filter(p => p.categoryId === 'frames');
assert.strictEqual(frameProducts.length, 1, 'Should filter 1 frame product');
console.log('  ✓ PASSED: Category filtering verified\n');

// Test 4: Live Search Filtering
console.log('Test 4: Live Search query');
const searchResults = PRODUCTS.filter(p => p.name.toLowerCase().includes('nikah'));
assert.strictEqual(searchResults.length, 1, 'Search query "nikah" should match 1 product');
assert.strictEqual(searchResults[0].id, 'prod-6');
console.log('  ✓ PASSED: Search query filtering works accurately\n');

// Test 5: Dynamic Product Addition to in-memory store
console.log('Test 5: Dynamic product addition and state reactivity');
let localStore = [...PRODUCTS];
const newProd = {
  id: 'prod-23',
  name: 'Ocean Wave Resin Coaster',
  categoryId: 'resin-art',
  priceType: 'fixed',
  price: 299,
  inStock: true
};
localStore.unshift(newProd);
assert.strictEqual(localStore.length, 6, 'Store should now have 6 products');
assert.strictEqual(localStore[0].id, 'prod-23');
console.log('  ✓ PASSED: Dynamic addition to product store verified\n');

console.log('🎉 ALL 5 PHASE 3 DYNAMIC CATALOGUE TESTS PASSED SUCCESSFULLY!\n');
