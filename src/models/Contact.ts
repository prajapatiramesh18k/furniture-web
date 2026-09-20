import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, default: '' },
  projectType: { type: String, required: true },
  message: { type: String, required: true },
  // Lightweight lead pipeline: New → Contacted → Site Visit → Proposal →
  // Quotation → Won / Lost. 'converted' is legacy (treated as Won in UI).
  status: {
    type: String,
    enum: ['new', 'contacted', 'site_visit', 'proposal', 'quotation', 'won', 'lost', 'converted'],
    default: 'new',
    index: true,
  },
  source: { type: String, default: '', trim: true },
  budget: { type: String, default: '', trim: true },
  followUpAt: { type: Date, default: null },
  notes: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  createdAt: { type: Date, default: Date.now },
});

ContactSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
ContactSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
