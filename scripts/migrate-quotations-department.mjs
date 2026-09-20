/**
 * Backfill department + status on legacy quotations (created before
 * multi-department + approval support).
 *
 * - Department is inferred from project.type: exact match against each
 *   department config's projectTypes first, then keyword fallback.
 *   Anything unrecognized stays 'furniture' (the original single-dept app).
 * - Status defaults to 'sent' (legacy quotes were already given to customers).
 *
 * Usage:
 *   node scripts/migrate-quotations-department.mjs [--apply] [--db=dbfurniture-dev]
 * Without --apply it only reports what WOULD change.
 */
import mongoose from 'mongoose';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const dbArg = args.find((a) => a.startsWith('--db='));
const db = dbArg ? dbArg.split('=')[1] : 'dbfurniture-dev';
const uri = process.env.MONGODB_URI || `mongodb+srv://ramesh:ramesh123@cluster0.ataz1nj.mongodb.net/${db}`;

const quotationSchema = new mongoose.Schema({}, { strict: false, collection: 'quotations' });

// projectTypes mirrors of the dept configs (kept local so the script runs standalone).
const PROJECT_TYPES = {
  electrical: ['1 BHK Wiring', '2 BHK Wiring', '3 BHK Wiring', 'Office Electrical', 'Shop / Retail', 'Industrial', 'Repair & Maintenance'],
  plumbing: ['Bathroom Plumbing', 'Kitchen Plumbing', 'Full House Plumbing', 'Office Plumbing', 'Repair & Maintenance'],
  interior: ['1 BHK Interior', '2 BHK Interior', '3 BHK Interior', 'Office Interior', 'False Ceiling'],
  construction: ['Residential Building', 'Commercial Building', 'Renovation', 'RCC Work', 'Masonry Work'],
  painting: ['1 BHK Painting', '2 BHK Painting', '3 BHK Painting', 'Office Painting', 'Exterior Painting', 'Touch-up / Repair'],
  software: ['Website', 'E-commerce Website', 'Web Application', 'Mobile App', 'Maintenance'],
  general: ['Service Work', 'AMC', 'Custom Service'],
};

const DEPT_NAMES = {
  furniture: 'Furniture', electrical: 'Electrical', plumbing: 'Plumbing', interior: 'Interior',
  construction: 'Construction', painting: 'Painting', software: 'IT / Software',
  general: 'General Services', custom: 'Custom',
};

const KEYWORDS = [
  [/wiring|electric/i, 'electrical'],
  [/plumb/i, 'plumbing'],
  [/paint/i, 'painting'],
  [/website|software|web app|mobile app|\bIT\b|e-commerce/i, 'software'],
  [/construct|civil|rcc|mason/i, 'construction'],
  [/interior|pop work|false ceiling/i, 'interior'],
];

function inferDepartment(projectType) {
  const t = String(projectType || '').trim();
  if (!t) return 'furniture';
  for (const [dept, types] of Object.entries(PROJECT_TYPES)) {
    if (types.includes(t)) return dept;
  }
  for (const [re, dept] of KEYWORDS) {
    if (re.test(t)) return dept;
  }
  return 'furniture';
}

async function main() {
  await mongoose.connect(uri);
  const Quotation = mongoose.models._MigrateQuotation || mongoose.model('_MigrateQuotation', quotationSchema);
  const docs = await Quotation.find({
    $or: [
      { department: { $exists: false } }, { department: null }, { department: '' },
      { status: { $exists: false } },
    ],
  }).select({ 'project.type': 1, 'project.quoteNo': 1, department: 1, status: 1 }).lean();

  console.log(`DB: ${db} — ${docs.length} quotation(s) need backfill`);
  const ops = [];
  for (const d of docs) {
    const dept = d.department || inferDepartment(d.project?.type);
    const patch = {};
    if (!d.department) {
      patch.department = dept;
      patch.departmentName = DEPT_NAMES[dept] || dept;
    }
    if (!d.status) patch.status = 'sent';
    console.log(`  ${d.project?.quoteNo || d._id} [${d.project?.type}] -> ${patch.department || '(keep dept)'} / ${patch.status || '(keep status)'}`);
    if (apply) ops.push({ updateOne: { filter: { _id: d._id }, update: { $set: patch } } });
  }
  if (apply && ops.length > 0) {
    const res = await Quotation.bulkWrite(ops);
    console.log(`Backfilled ${res.modifiedCount} quotation(s).`);
  } else if (!apply) {
    console.log('Dry run — re-run with --apply to write changes.');
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
