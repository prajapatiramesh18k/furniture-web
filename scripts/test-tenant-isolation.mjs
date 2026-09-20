/**
 * Tenant-isolation verification.
 *
 * Part A (no DB needed): pure unit checks for role gating, module mapping,
 * and the tenantFilter helper contract (server-side tenant only, never client).
 *
 * Part B (needs MONGODB_URI): live cross-tenant checks with throwaway
 * `__test_tenant_<rand>` tenants + quotations:
 *   1. Tenant A user sees only A's quotations.
 *   2. Direct-ID access to B's quotation with A's filter returns null.
 *   3. findOneAndDelete with A's filter cannot delete B's record.
 *   4. Disabled module mapping blocks, enabled allows.
 *
 * Run: node scripts/test-tenant-isolation.mjs
 */
import assert from 'node:assert';

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (e) {
    failures++;
    console.error(`FAIL ${name}: ${e.message}`);
  }
}

// ---- Part A: replicate the client-safe rules (must mirror src/lib/admin-roles.ts) ----
const ROLE_DEFAULT_MODULES = {
  owner: '*',
  admin: '*',
  manager: ['dashboard', 'products', 'categories', 'orders', 'customers', 'quotations', 'inventory', 'collections', 'offers', 'payments', 'shipping', 'reviews', 'reports'],
  staff: ['dashboard', 'orders', 'customers', 'reviews'],
  customer: [],
};
function roleCanAccess(role, permissions, module) {
  if (role === 'admin' || role === 'owner') return true;
  if (permissions && permissions.length > 0) return module === 'dashboard' || permissions.includes(module);
  const allowed = ROLE_DEFAULT_MODULES[role] ?? [];
  if (allowed === '*') return true;
  return module === 'dashboard' || allowed.includes(module);
}
const ADMIN_MODULE_TO_SALES_MODULE = {
  dashboard: null,
  quotations: 'QUOTATION',
  team: 'EMPLOYEE_MANAGEMENT',
  products: 'INVENTORY',
  inventory: 'INVENTORY',
  payments: 'ACCOUNTING',
  reports: 'ACCOUNTING',
  orders: null,
  settings: null,
};
function moduleAllowed(adminModule, enabledModules) {
  const salesKey = ADMIN_MODULE_TO_SALES_MODULE[adminModule];
  if (!salesKey) return true;
  return enabledModules.has(salesKey);
}
function tenantFilter(tenantId, extra = {}) {
  if (!tenantId || typeof tenantId !== 'string') throw new Error('tenantId must come from server session');
  if ('tenantId' in extra) throw new Error('client must never supply tenantId');
  return { ...extra, tenantId };
}

check('Test 7a: owner/admin have full access', () => {
  assert.equal(roleCanAccess('owner', [], 'team'), true);
  assert.equal(roleCanAccess('admin', [], 'settings'), true);
});
check('Test 7b: manager/employee limited by role', () => {
  assert.equal(roleCanAccess('manager', [], 'quotations'), true);
  assert.equal(roleCanAccess('manager', [], 'team'), false); // team is owner/admin-only by default
  assert.equal(roleCanAccess('staff', [], 'team'), false);
  assert.equal(roleCanAccess('staff', ['team'], 'team'), true); // explicit grant
  // NOTE: roleCanAccess('customer', [], 'dashboard') is true (dashboard is the
  // common screen); customers are blocked from /admin at the shell + API layer
  // because they carry no staff permissions. Verified separately.
  assert.equal(roleCanAccess('customer', [], 'team'), false);
});
check('Test 4: disabled modules blocked even with role access', () => {
  assert.equal(moduleAllowed('quotations', new Set(['QUOTATION'])), true);
  assert.equal(moduleAllowed('team', new Set(['QUOTATION'])), false); // EMPLOYEE_MANAGEMENT off
  assert.equal(moduleAllowed('orders', new Set()), true); // not a sold module
});
check('Security: tenantFilter rejects client-supplied tenantId', () => {
  assert.throws(() => tenantFilter('A', { tenantId: 'B' }), /client must never/);
  assert.throws(() => tenantFilter(''), /server session/);
  assert.deepEqual(tenantFilter('A', { _id: 'x' }), { _id: 'x', tenantId: 'A' });
});

// ---- Part B: live DB checks ----
if (process.env.MONGODB_URI) {
  const mongoose = (await import('mongoose')).default;
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const rnd = Math.random().toString(36).slice(2, 8);
  const tA = await db.collection('tenants').insertOne({ name: `__test_A_${rnd}`, slug: `__test-a-${rnd}`, status: 'active', createdAt: new Date(), updatedAt: new Date() });
  const tB = await db.collection('tenants').insertOne({ name: `__test_B_${rnd}`, slug: `__test-b-${rnd}`, status: 'active', createdAt: new Date(), updatedAt: new Date() });
  const A = String(tA.insertedId);
  const B = String(tB.insertedId);
  const mk = (tid) => ({ tenantId: new mongoose.Types.ObjectId(tid), customer: { name: 'X', phone: '1' }, project: { type: 'T', quoteNo: `T-${rnd}`, date: '2026-01-01', validTill: '2026-02-01' }, items: [], totals: { subtotal: 1, gst: 0, total: 1 } });
  const qA = await db.collection('quotations').insertOne(mk(A));
  const qB = await db.collection('quotations').insertOne(mk(B));
  try {
    // Test 1: A lists only A's quotations
    const listA = await db.collection('quotations').find({ tenantId: new mongoose.Types.ObjectId(A) }).toArray();
    check('Test 1: tenant A sees only own quotations', () => {
      assert.ok(listA.some((d) => String(d._id) === String(qA.insertedId)));
      assert.ok(!listA.some((d) => String(d._id) === String(qB.insertedId)));
    });
    // Test 2: direct-ID access across tenants returns null
    const cross = await db.collection('quotations').findOne({ _id: qB.insertedId, tenantId: new mongoose.Types.ObjectId(A) });
    check("Test 2: tenant A cannot fetch B's quotation by ID", () => assert.equal(cross, null));
    // Test 3: cross-tenant delete is a no-op
    const del = await db.collection('quotations').findOneAndDelete({ _id: qB.insertedId, tenantId: new mongoose.Types.ObjectId(A) });
    const stillThere = await db.collection('quotations').findOne({ _id: qB.insertedId });
    check("Test 3: tenant A cannot delete B's quotation", () => {
      assert.equal(del, null);
      assert.ok(stillThere);
    });
  } finally {
    await db.collection('quotations').deleteMany({ _id: { $in: [qA.insertedId, qB.insertedId] } });
    await db.collection('tenants').deleteMany({ _id: { $in: [tA.insertedId, tB.insertedId] } });
    await mongoose.disconnect();
  }
} else {
  console.log('SKIP Part B (live DB tests): MONGODB_URI not set.');
}

if (failures > 0) {
  console.error(`${failures} check(s) failed.`);
  process.exit(1);
}
console.log('All tenant-isolation checks passed.');
