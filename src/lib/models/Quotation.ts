import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  material: { type: String, default: '' },
  height: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
  // Generic multi-department fields (all optional — old furniture docs unaffected).
  unit: { type: String, default: '' },
  description: { type: String, default: '' },
  brand: { type: String, default: '' },
  specification: { type: String, default: '' },
  size: { type: String, default: '' },
  finish: { type: String, default: '' },
  paintType: { type: String, default: '' },
  billingType: { type: String, default: '' },
  area: { type: Number, default: 0 },
  // Multi-trade fields (all optional — legacy single-trade docs unaffected).
  trade: { type: String, default: '' },
  room: { type: String, default: '' },
  discountPct: { type: Number, default: 0, min: 0, max: 100 },
  taxPct: { type: Number, default: null },
});

const quotationCategorySchema = new mongoose.Schema({
  key: { type: String, required: true },
  trade: { type: String, required: true },
  label: { type: String, required: true },
  room: { type: String, default: '' },
  discount: { type: Number, default: 0, min: 0 },
  taxPct: { type: Number, default: null },
  sortOrder: { type: Number, default: 0 },
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
  // Multi-department: one generic Quotation for every department.
  // Old furniture quotations have no department field — reads treat missing as 'furniture'.
  department: { type: String, default: 'furniture', index: true },
  departmentName: { type: String, default: '' },
  // Approval lifecycle: sent (default, given to customer) -> approved / rejected.
  // Legacy docs have no status — reads treat missing as 'sent'.
  // 'expired' is derived in UI (validTill passed while still sent), never stored.
  status: { type: String, enum: ['draft', 'sent', 'approved', 'rejected'], default: 'sent', index: true },
  decidedAt: { type: Date, default: null },
  decidedBy: { type: String, default: '' },
  rejectReason: { type: String, default: '' },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    branch: { type: String },
  },
  project: {
    type: { type: String, required: true },
    quoteNo: { type: String, required: true },
    date: { type: String, required: true },
    validTill: { type: String, required: true },
  },
  items: [lineItemSchema],
  // Multi-trade mode: 'single' (default, legacy) or 'multi' (one quotation,
  // many trade sections). Absent/legacy docs read as 'single'.
  mode: { type: String, enum: ['single', 'multi'], default: 'single', index: true },
  categories: { type: [quotationCategorySchema], default: [] },
  totals: {
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true },
    total: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    categoryTotals: {
      type: [{
        key: { type: String },
        label: { type: String },
        room: { type: String },
        subtotal: { type: Number },
        discount: { type: Number },
        tax: { type: Number },
        total: { type: Number },
      }],
      default: [],
    },
  },
  workType: { type: String },
  terms: { type: String },
  inclusions: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Source lead (set when the quotation is made from a site visit).
  // Drives automatic lead-pipeline sync: create → 'quotation', approve → 'won'.
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null, index: true },
  // Snapshot of the issuing company's branding at creation time, so PDFs stay
  // correct even if the tenant later updates its settings.
  company: {
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  createdAt: { type: Date, default: Date.now },
});

quotationSchema.index({ tenantId: 1, createdAt: -1 });
quotationSchema.index({ tenantId: 1, department: 1, createdAt: -1 });
quotationSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
quotationSchema.index({ tenantId: 1, createdBy: 1, createdAt: -1 });
quotationSchema.index({ tenantId: 1, 'customer.phone': 1 });

const Quotation = mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);

export default Quotation;
