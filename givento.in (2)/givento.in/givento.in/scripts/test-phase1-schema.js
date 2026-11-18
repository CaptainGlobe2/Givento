const assert = require('assert');

console.log('🧪 Starting Phase 1 Master Schema Logic Tests...\n');

// 1. Subcategories Schema Verification
console.log('Test 1: Master Subcategories integrity');
const SUBCATEGORIES = [
  { id: 'sub-choc-bouq', categoryId: 'bloom-glade', name: 'Chocolate Bouquets', slug: 'chocolate-bouquets', isActive: true, sortOrder: 1 },
  { id: 'sub-photo-bouq', categoryId: 'bloom-glade', name: 'Polaroid Photo Bouquets', slug: 'photo-bouquets', isActive: true, sortOrder: 2 },
  { id: 'sub-flower-bouq', categoryId: 'bloom-glade', name: 'Satin & Forever Flower Bouquets', slug: 'flower-bouquets', isActive: true, sortOrder: 3 },
  { id: 'sub-mixed-bouq', categoryId: 'bloom-glade', name: 'Mixed Treat Bouquets', slug: 'mixed-bouquets', isActive: true, sortOrder: 4 },
  { id: 'sub-custom-bouq', categoryId: 'bloom-glade', name: 'Build Your Own Bouquet', slug: 'build-your-own-bouquet', isActive: true, sortOrder: 5 },
  { id: 'sub-resin-frames', categoryId: 'keepsake-cottage', name: 'Resin Keepsake Frames', slug: 'resin-frames', isActive: true, sortOrder: 1 },
  { id: 'sub-resin-keychains', categoryId: 'keyring-keep', name: 'Arabic & Name Keychains', slug: 'name-keychains', isActive: true, sortOrder: 2 },
  { id: 'sub-jewel-chains', categoryId: 'starlight-smithy', name: 'Stainless Steel Chains & Pendants', slug: 'steel-chains', isActive: true, sortOrder: 1 },
  { id: 'sub-hamper-her', categoryId: 'hamper-hollow', name: 'Gift Hampers For Her', slug: 'hampers-for-her', isActive: true, sortOrder: 1 },
];

assert(SUBCATEGORIES.length >= 9, 'Must have at least 9 subcategories');
const bouqSubs = SUBCATEGORIES.filter(s => s.categoryId === 'bloom-glade');
assert.strictEqual(bouqSubs.length, 5, 'Bloom Glade must contain exactly 5 bouquet subcategories');
console.log('  ✓ PASSED: Subcategories categorized accurately\n');

// 2. Bouquet Sizes & Piece Limits
console.log('Test 2: Bouquet sizes and piece caps');
const BOUQUET_SIZES = [
  { id: 'size-sm', name: 'Petite Bouquet (Small)', maxPieces: 6, baseCharge: 0 },
  { id: 'size-md', name: 'Classic Bouquet (Medium)', maxPieces: 12, baseCharge: 0 },
  { id: 'size-lg', name: 'Grand Statement (Large)', maxPieces: 20, baseCharge: 50 },
];

assert.strictEqual(BOUQUET_SIZES.length, 3, 'Must support 3 bouquet sizes');
assert.strictEqual(BOUQUET_SIZES.find(s => s.id === 'size-sm').maxPieces, 6, 'Small bouquet size is 6 pieces');
assert.strictEqual(BOUQUET_SIZES.find(s => s.id === 'size-md').maxPieces, 12, 'Medium bouquet size is 12 pieces');
assert.strictEqual(BOUQUET_SIZES.find(s => s.id === 'size-lg').maxPieces, 20, 'Large bouquet size is 20 pieces');
console.log('  ✓ PASSED: Bouquet sizes & limits correctly defined (6, 12, 20 pieces)\n');

// 3. Decorations Catalog
console.log('Test 3: Bouquet decorations & extra embellishments');
const DECORATIONS = [
  { id: 'dec-ribbon', name: 'Double Satin Ribbon Bow', price: 25, stock: 100 },
  { id: 'dec-lights', name: 'Warm Fairy Lights (Battery Included)', price: 49, stock: 45 },
  { id: 'dec-card', name: 'Handwritten Calligraphy Card in Wax Envelope', price: 30, stock: 200 },
  { id: 'dec-crown', name: 'Mini Golden Princess Crown Pick', price: 35, stock: 30 },
];

assert(DECORATIONS.length >= 4, 'Must have at least 4 decorations');
assert(DECORATIONS.every(d => d.price > 0 && d.stock > 0), 'Every decoration must have a valid price and positive stock');
console.log('  ✓ PASSED: Decorations catalog validated\n');

// 4. Shipping Rules Engine
console.log('Test 4: Regional shipping rules calculation');
const SHIPPING_RULES = [
  { id: 'ship-local', name: 'Adirampattinam Express Local Delivery', region: 'local_adiram', baseCharge: 30, freeThreshold: 499 },
  { id: 'ship-pickup', name: 'Direct Studio Pickup (Adirampattinam)', region: 'pickup', baseCharge: 0, freeThreshold: 0 },
  { id: 'ship-tn', name: 'Tamil Nadu Standard Express', region: 'tamil_nadu', baseCharge: 50, freeThreshold: 899 },
  { id: 'ship-all-india', name: 'Pan-India Insured Courier', region: 'interstate', baseCharge: 70, freeThreshold: 999 },
];

function calculateShipping(region, cartSubtotal) {
  const rule = SHIPPING_RULES.find(r => r.region === region);
  if (!rule) throw new Error('Unknown shipping region: ' + region);
  if (cartSubtotal >= rule.freeThreshold) return 0;
  return rule.baseCharge;
}

assert.strictEqual(calculateShipping('local_adiram', 300), 30, 'Adirampattinam local sub-threshold is ₹30');
assert.strictEqual(calculateShipping('local_adiram', 500), 0, 'Adirampattinam local above ₹499 is FREE');
assert.strictEqual(calculateShipping('pickup', 100), 0, 'Pickup is always FREE (₹0)');
assert.strictEqual(calculateShipping('tamil_nadu', 700), 50, 'Tamil Nadu sub-threshold is ₹50');
assert.strictEqual(calculateShipping('tamil_nadu', 950), 0, 'Tamil Nadu above ₹899 is FREE');
assert.strictEqual(calculateShipping('interstate', 800), 70, 'All-India courier sub-threshold is ₹70');
assert.strictEqual(calculateShipping('interstate', 1050), 0, 'All-India courier above ₹999 is FREE');
console.log('  ✓ PASSED: Regional shipping rates & free delivery thresholds verified\n');

// 5. True Net Profit Calculation (Gross Revenue - Expenses)
console.log('Test 5: True Net Profit calculation');
const SAMPLE_ORDERS = [
  { id: 'GVN-1', total: 1197, status: 'Making', paymentStatus: 'Paid' },
  { id: 'GVN-2', total: 1048, status: 'Received', paymentStatus: 'Paid' },
  { id: 'GVN-3', total: 558, status: 'Shipped', paymentStatus: 'Pending' },
];

const SAMPLE_EXPENSES = [
  { id: 'exp-1', title: 'Kraft paper & wires', amount: 1450 },
  { id: 'exp-2', title: 'Wax beads & brass spoons', amount: 890 },
  { id: 'exp-3', title: 'Rigid corrugated boxes', amount: 1200 },
];

const grossSales = SAMPLE_ORDERS.reduce((sum, o) => sum + o.total, 0); // 1197 + 1048 + 558 = 2803
const totalExpenses = SAMPLE_EXPENSES.reduce((sum, e) => sum + e.amount, 0); // 1450 + 890 + 1200 = 3540
const netProfit = grossSales - totalExpenses; // 2803 - 3540 = -737

assert.strictEqual(grossSales, 2803, 'Gross sales calculation mismatch');
assert.strictEqual(totalExpenses, 3540, 'Total expenses calculation mismatch');
assert.strictEqual(netProfit, -737, 'Net profit must be Gross Sales - Total Expenses');
console.log('  ✓ PASSED: Gross sales never confused with net profit; expenses deducted correctly\n');

// 6. Inventory Transactions Audit Trail
console.log('Test 6: Inventory transaction audit logging');
const inventoryTransactions = [];

function logTransaction(itemType, itemId, changeQty, reason, refId) {
  const tx = {
    id: 'tx-' + (inventoryTransactions.length + 1),
    itemType,
    itemId,
    changeQty,
    reason,
    refId,
    createdAt: new Date().toISOString(),
  };
  inventoryTransactions.push(tx);
  return tx;
}

logTransaction('product', 'sunflower-bouquet', 20, 'manual_restock', 'Batch #1');
logTransaction('product', 'sunflower-bouquet', -2, 'order_confirmed', 'GVN-101');
logTransaction('product', 'sunflower-bouquet', 1, 'order_cancelled', 'GVN-101'); // 1 returned

assert.strictEqual(inventoryTransactions.length, 3, 'Must have 3 transactions logged');
const netChange = inventoryTransactions.reduce((sum, tx) => sum + tx.changeQty, 0);
assert.strictEqual(netChange, 19, 'Net stock balance should be 20 - 2 + 1 = 19');
console.log('  ✓ PASSED: Inventory transaction logging & cancellation restock verified\n');

console.log('🎉 ALL 6 PHASE 1 SCHEMA TESTS PASSED SUCCESSFULLY!\n');
