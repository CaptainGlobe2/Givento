const assert = require('assert');

// Test Suite for Build Your Own Bouquet Logic

console.log('🧪 Starting Build Your Own Bouquet Logic Tests...\n');

// 1. Mock Data Setup
const SHEETS = [
  { id: 's1', name: 'Black & gold', price: 60, stock: 12, active: true },
  { id: 's2', name: 'Polka-dot white', price: 60, stock: 9, active: true },
  { id: 's4', name: 'Kraft brown', price: 40, stock: 3, active: true },
  { id: 's5', name: 'Lilac shimmer', price: 70, stock: 0, active: true }, // Out of stock!
  { id: 's6', name: 'Hidden Sheet', price: 50, stock: 10, active: false }, // Inactive!
];

const ITEMS = [
  { id: 'b1', name: 'KitKat', price: 25, stock: 30, group: 'choc' },
  { id: 'b2', name: 'Dairy Milk', price: 30, stock: 24, group: 'choc' },
  { id: 'b10', name: 'Ferrero Rocher', price: 45, stock: 0, group: 'choc' }, // Out of stock!
  { id: 'b3', name: 'Polaroid photo print', price: 25, stock: 50, group: 'photo' },
  { id: 'b4', name: 'Satin rose', price: 35, stock: 20, group: 'flower' },
  { id: 'b5', name: 'Stainless steel bracelet', price: 179, stock: 10, group: 'jewel' },
];

const MAX_PIECES = 12;

// Test 1: Sheet out-of-stock and inactive filter
console.log('Test 1: Sheet out-of-stock & inactive are hidden from customer view');
const visibleSheets = SHEETS.filter((s) => s.stock > 0 && s.active !== false);
assert.strictEqual(visibleSheets.length, 3, 'Only 3 sheets should be visible');
assert(!visibleSheets.some((s) => s.id === 's5'), 'Out of stock sheet s5 must be hidden');
assert(!visibleSheets.some((s) => s.id === 's6'), 'Inactive sheet s6 must be hidden');
console.log('  ✓ PASSED: Only in-stock, active sheets visible\n');

// Test 2: Item out-of-stock filter
console.log('Test 2: Item out-of-stock is hidden from builder');
const visibleItems = ITEMS.filter((it) => it.stock > 0);
assert.strictEqual(visibleItems.length, 5, 'Only 5 items should be visible');
assert(!visibleItems.some((it) => it.id === 'b10'), 'Out of stock item b10 must be hidden');
console.log('  ✓ PASSED: Out of stock item b10 successfully hidden\n');

// Test 3: Price Calculation
console.log('Test 3: Live price recomputation');
function computePrice(sheetId, selections) {
  const sheet = SHEETS.find((s) => s.id === sheetId);
  if (!sheet) throw new Error('Sheet not found');
  let total = sheet.price;
  for (const sel of selections) {
    const item = ITEMS.find((it) => it.id === sel.id);
    if (!item) throw new Error('Item not found: ' + sel.id);
    total += item.price * sel.quantity;
  }
  return total;
}

// 1 Black & gold sheet (60) + 3 KitKat (3x25 = 75) + 1 Polaroid (25) + 1 Satin rose (35) = 195
const selections1 = [
  { id: 'b1', quantity: 3 },
  { id: 'b3', quantity: 1 },
  { id: 'b4', quantity: 1 },
];
const calculatedPrice = computePrice('s1', selections1);
assert.strictEqual(calculatedPrice, 195, 'Expected 60 + 75 + 25 + 35 = 195');
console.log('  ✓ PASSED: Calculated exact total of ₹195\n');

// Test 4: Max Pieces constraint
console.log('Test 4: Maximum pieces capping');
function validateMaxPieces(selections, max) {
  const count = selections.reduce((sum, s) => sum + s.quantity, 0);
  return count <= max;
}
assert.strictEqual(validateMaxPieces(selections1, MAX_PIECES), true, '5 pieces is under 12');
const excessiveSelections = [{ id: 'b1', quantity: 13 }];
assert.strictEqual(validateMaxPieces(excessiveSelections, MAX_PIECES), false, '13 pieces exceeds 12');
console.log('  ✓ PASSED: Max pieces validation enforces ceiling\n');

// Test 5: Cart Key and Deduplication
console.log('Test 5: Unique bouquet key & cart grouping');
function makeBouquetKey(sheetId, selections) {
  const sorted = [...selections].sort((a, b) => a.id.localeCompare(b.id));
  return `${sheetId}|${sorted.map((s) => `${s.id}:${s.quantity}`).join(',')}`;
}
const keyA = makeBouquetKey('s1', selections1);
const keyB = makeBouquetKey('s1', [
  { id: 'b4', quantity: 1 },
  { id: 'b1', quantity: 3 },
  { id: 'b3', quantity: 1 },
]);
assert.strictEqual(keyA, keyB, 'Identical bouquets with different selection order must match');
console.log('  ✓ PASSED: Identical bouquets group together in basket\n');

// Test 6: Stock Decrement Logic
console.log('Test 6: Stock reduction on confirmed order');
function decrementStock(sheetsState, itemsState, sheetId, orderedItems) {
  const targetSheet = sheetsState.find((s) => s.id === sheetId);
  if (targetSheet) {
    targetSheet.stock = Math.max(0, targetSheet.stock - 1);
  }
  for (const o of orderedItems) {
    const targetItem = itemsState.find((it) => it.id === o.id);
    if (targetItem) {
      targetItem.stock = Math.max(0, targetItem.stock - o.quantity);
    }
  }
}

const mutableSheets = JSON.parse(JSON.stringify(SHEETS));
const mutableItems = JSON.parse(JSON.stringify(ITEMS));

decrementStock(mutableSheets, mutableItems, 's1', selections1);

assert.strictEqual(mutableSheets.find((s) => s.id === 's1').stock, 11, 'Sheet s1 stock should decrease 12 -> 11');
assert.strictEqual(mutableItems.find((it) => it.id === 'b1').stock, 27, 'Item b1 stock should decrease 30 -> 27');
assert.strictEqual(mutableItems.find((it) => it.id === 'b3').stock, 49, 'Item b3 stock should decrease 50 -> 49');
assert.strictEqual(mutableItems.find((it) => it.id === 'b4').stock, 19, 'Item b4 stock should decrease 20 -> 19');
console.log('  ✓ PASSED: Stock correctly decrements for wrapping sheet and all chosen items\n');

// Test 7: WhatsApp message formatting
console.log('Test 7: WhatsApp order formatting');
function formatBouquetWhatsApp(sheetName, itemsList, qty, total) {
  return `• *Custom Bouquet* (x${qty}) - ₹${total * qty}\n  Sheet: ${sheetName}\n  Items: ${itemsList.map((x) => `${x.quantity}x ${x.name}`).join(', ')}`;
}

const waMessage = formatBouquetWhatsApp('Black & gold', [
  { name: 'KitKat', quantity: 3 },
  { name: 'Polaroid photo print', quantity: 1 },
  { name: 'Satin rose', quantity: 1 },
], 1, 195);

assert(waMessage.includes('Custom Bouquet'), 'Must mention Custom Bouquet');
assert(waMessage.includes('Black & gold'), 'Must include sheet name');
assert(waMessage.includes('3x KitKat'), 'Must include item quantities');
assert(waMessage.includes('₹195'), 'Must include line price');
console.log('  ✓ PASSED: WhatsApp message formatted accurately\n');

console.log('🎉 ALL 7 BOUQUET LOGIC TESTS PASSED WITHOUT ERRORS!\n');
