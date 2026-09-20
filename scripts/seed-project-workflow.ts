import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';

for (const f of ['.env.local', '.env']) {
  try {
    const raw = readFileSync(f, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    }
  } catch {}
}

const EMP = {
  manager: '6aad80fda638fab8b58214b4',
  designer: '6aad80fda638fab8b58214b8',
  electrician: '6aad80fda638fab8b58214b6',
  worker: '6aad80fda638fab8b58214b7',
  plumber: '6aad80fda638fab8b58214b9',
  carpenter: '6aad80fda638fab8b58214ba',
  painter: '6aad80fda638fab8b58214bb',
};

async function main() {
  if (!process.env.MONGODB_URI) { console.error('MONGODB_URI not set.'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.\n');

  const { default: Tenant } = await import('@/lib/models/Tenant');
  const { default: Project } = await import('@/lib/models/Project');
  const { default: Site } = await import('@/lib/models/Site');
  const { default: Task } = await import('@/lib/models/Task');
  const { default: Expense } = await import('@/lib/models/Expense');
  const { default: ProgressUpdate } = await import('@/lib/models/ProgressUpdate');
  const { default: Invoice } = await import('@/lib/models/Invoice');
  const { default: ProjectPayment } = await import('@/lib/models/ProjectPayment');

  const tenant = await Tenant.findOne({ name: 'Pritesh interior Solution' }).lean();
  if (!tenant) { console.error('Tenant not found.'); await mongoose.disconnect(); process.exit(1); }
  const tid = String(tenant._id);
  console.log('Tenant: ' + tenant.name + '\n');

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // ===== STAGE 1: PROJECT =====
  console.log('=== STAGE 1: Create Project ===');
  const project = new Project({
    tenantId: tid,
    name: 'Sharma Residence',
    customer: { name: 'Mr. Rajesh Sharma', phone: '9876543210', email: 'rajesh@example.com' },
    quotationNo: 'QTN-2025-001',
    projectType: 'Interior (Single-Trade)',
    status: 'planning',
    startDate: new Date(year, month, 1),
    expectedEnd: new Date(year, month + 3, 1),
    budgetValue: 250000,
    packages: [],
    managerId: EMP.manager,
    supervisorId: EMP.electrician,
    notes: 'Complete interior renovation for 3 BHK residential unit.',
  });
  await project.save();
  console.log('Created Project: ' + project.name + ' | ID: ' + project._id + ' | Status: ' + project.status + ' | Budget: 250000\n');

  // ===== STAGE 2: SITE =====
  console.log('=== STAGE 2: Create Site ===');
  const site = new Site({
    tenantId: tid,
    name: 'Sharma Residence - Site',
    clientName: 'Mr. Rajesh Sharma',
    propertyType: 'Residential',
    area: '1800 sq ft',
    rooms: '3 BHK',
    address: '123, Elm Street, Bangalore, Karnataka - 560001',
    location: { latitude: 12.9716, longitude: 77.5946 },
  });
  await site.save();
  project.siteId = site._id;
  await project.save();
  console.log('Created Site: ' + site.name + '\n');

  // ===== STAGE 3: TASKS =====
  console.log('=== STAGE 3: Create Tasks ===');
  const seedTasks = [
    { title: 'Site Measurement', category: 'Measurement', assignedTo: EMP.worker, dueDate: new Date(year, month, 5), priority: 'high' },
    { title: 'Design Approval', category: 'Design', assignedTo: EMP.designer, dueDate: new Date(year, month, 10), priority: 'high' },
    { title: 'Material Selection and Procurement', category: 'Materials', assignedTo: EMP.plumber, dueDate: new Date(year, month, 15), priority: 'medium' },
    { title: 'Execution and Installation', category: 'Execution', assignedTo: EMP.carpenter, dueDate: new Date(year, month + 1, 1), priority: 'high' },
    { title: 'Finishing and Final Inspection', category: 'Finishing', assignedTo: EMP.painter, dueDate: new Date(year, month + 2, 1), priority: 'medium' },
  ];
  for (const t of seedTasks) {
    const task = new Task({
      tenantId: tid,
      projectId: project._id,
      title: t.title,
      category: t.category,
      assignedTo: t.assignedTo,
      dueDate: t.dueDate,
      status: 'todo',
      priority: t.priority,
      notes: 'Task for Sharma Residence workflow stage: ' + t.category,
    });
    await task.save();
    console.log('  Task: ' + t.title + ' -> ' + t.assignedTo + ' | Due: ' + (t.dueDate ? t.dueDate.toLocaleDateString('en-IN') : 'N/A'));
  }
  console.log();

  // ===== STAGE 4: PROGRESS UPDATES =====
  console.log('=== STAGE 4: Progress Updates ===');
  const progressUpdates = [
    { floor: 'Ground', room: 'Living Room', category: 'Measurement', notes: 'Site measurement completed. Dimensions recorded: 1800 sq ft total area.', updateDate: new Date(year, month, 3) },
    { floor: 'Ground', room: 'Living Room', category: 'Design', notes: 'Design approved by client. CAD drawings finalized.', updateDate: new Date(year, month, 8) },
    { floor: 'Ground', room: 'All Rooms', category: 'Execution', notes: 'Execution underway. Carpentry and electrical work in progress.', updateDate: new Date(year, month + 1, 5) },
  ];
  for (const p of progressUpdates) {
    const pu = new ProgressUpdate({
      tenantId: tid,
      projectId: project._id,
      floor: p.floor,
      room: p.room,
      category: p.category,
      photos: ['/photos/' + project._id + '/' + p.category.toLowerCase() + '-' + Date.now() + '.jpg'],
      notes: p.notes,
      updateDate: p.updateDate,
    });
    await pu.save();
    console.log('  Progress: [' + p.category + '] ' + p.floor + ' / ' + p.room + ' - ' + p.notes.substring(0, 40) + '...');
  }
  console.log();

  // ===== STAGE 5: EXPENSES =====
  console.log('=== STAGE 5: Expenses ===');
  const expenses = [
    { category: 'material', materialName: 'Marble Tiles', quantity: 500, unit: 'sq ft', amount: 45000, expenseDate: new Date(year, month, 6), employeeId: EMP.plumber, notes: 'Premium marble tiles for ground floor', bill: 'BILL-001' },
    { category: 'material', materialName: 'Wooden Planks', quantity: 200, unit: 'pieces', amount: 30000, expenseDate: new Date(year, month + 1, 2), employeeId: EMP.carpenter, notes: 'Teak wood planks for furniture', bill: 'BILL-002' },
    { category: 'labour', materialName: 'Labour Charges', quantity: 1, unit: 'project', amount: 50000, expenseDate: new Date(year, month + 1, 10), employeeId: EMP.worker, notes: 'Carpentry and installation labour', bill: 'BILL-003' },
    { category: 'transport', materialName: 'Material Transport', quantity: 1, unit: 'trip', amount: 12000, expenseDate: new Date(year, month, 7), employeeId: null, notes: 'Transport of tiles and wood from warehouse', bill: 'BILL-004' },
    { category: 'contractor', materialName: 'Electrical Contractor', quantity: 1, unit: 'project', amount: 35000, expenseDate: new Date(year, month + 1, 12), employeeId: EMP.electrician, notes: 'Wiring and electrical fixture installation', bill: 'BILL-005' },
    { category: 'misc', materialName: 'Paint and Accessories', quantity: 1, unit: 'set', amount: 15000, expenseDate: new Date(year, month + 2, 1), employeeId: EMP.painter, notes: 'Interior paint, brushes, rollers', bill: 'BILL-006' },
  ];
  let totalExpenses = 0;
  for (const e of expenses) {
    const exp = new Expense({
      tenantId: tid,
      projectId: project._id,
      category: e.category,
      materialName: e.materialName,
      quantity: e.quantity,
      unit: e.unit,
      amount: e.amount,
      expenseDate: e.expenseDate,
      employeeId: e.employeeId,
      notes: e.notes,
      bill: e.bill,
    });
    await exp.save();
    totalExpenses += e.amount;
    console.log('  Expense: ' + e.materialName + ' (' + e.amount + ') [' + e.category + '] - ' + e.notes);
  }
  console.log('  Total Expenses: ' + totalExpenses + '\n');

  // ===== STAGE 6: INVOICE =====
  console.log('=== STAGE 6: Invoice ===');
  const invoice = new Invoice({
    tenantId: tid,
    projectId: project._id,
    invoiceNo: 'INV-2025-001',
    items: [
      { name: 'Interior Design and Consultation', quantity: 1, rate: 50000, amount: 50000 },
      { name: 'Material Supply Tiles Wood Paint', quantity: 1, rate: 120000, amount: 120000 },
      { name: 'Labour and Installation', quantity: 1, rate: 80000, amount: 80000 },
    ],
    subtotal: 250000,
    discount: 0,
    gst: 45000,
    total: 295000,
    paidTotal: 0,
    status: 'sent',
    issueDate: new Date(year, month, 15),
    dueDate: new Date(year, month + 1, 15),
    notes: 'Invoice for Sharma Residence interior project.',
    company: { name: 'Ananya House of Furniture.', address: '123 Furniture Road, Bangalore', phone: '9876543210' },
  });
  await invoice.save();
  console.log('Created Invoice: ' + invoice.invoiceNo + ' | Total: ' + invoice.total + ' | Status: ' + invoice.status + '\n');

  // ===== STAGE 7: PAYMENT =====
  console.log('=== STAGE 7: Project Payment ===');
  const payment = new ProjectPayment({
    tenantId: tid,
    projectId: project._id,
    invoiceId: invoice._id,
    amount: 100000,
    method: 'UPI',
    paymentDate: new Date(year, month, 20),
    notes: 'Advance payment received via UPI - 40 percent of total',
  });
  await payment.save();
  invoice.paidTotal = 100000;
  invoice.status = 'partial';
  await invoice.save();
  console.log('Payment: ' + payment.amount + ' via ' + payment.method + ' | Invoice status -> ' + invoice.status + '\n');

  // ===== STAGE 8: ADVANCE STATUS =====
  console.log('=== STAGE 8: Advance Project Through Workflow ===');
  const statusFlow = ['planning', 'design', 'procurement', 'execution', 'finishing', 'completed'];
  for (const s of statusFlow) {
    project.status = s as any;
    await project.save();
    console.log('  Project status -> ' + s.toUpperCase());
  }

  // ===== SUMMARY =====
  console.log('\n=============================================================');
  console.log('WORKFLOW COMPLETE: Sharma Residence');
  console.log('=============================================================');
  const taskCount = await Task.countDocuments({ projectId: project._id });
  const progressCount = await ProgressUpdate.countDocuments({ projectId: project._id });
  const expCount = await Expense.countDocuments({ projectId: project._id });
  console.log('Project: ' + project.name);
  console.log('  Status: ' + project.status);
  console.log('  Budget: 250000 | Site: ' + (project.siteId ? 'Set' : 'N/A'));
  console.log('  Tasks: ' + taskCount + ' | Progress: ' + progressCount + ' | Expenses: ' + expCount);
  console.log('  Total Expenses: ' + totalExpenses);
  console.log('  Invoice Total: ' + invoice.total + ' | Paid: ' + invoice.paidTotal);
  await mongoose.disconnect();
  console.log('\nAll done!');
}

main().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
