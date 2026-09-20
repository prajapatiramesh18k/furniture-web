import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
  name: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true,
  },
  clientName: {
    type: String,
    default: '',
    trim: true,
  },
  // Property links — a customer property becomes an execution site.
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
  propertyType: { type: String, default: '', trim: true },
  area: { type: String, default: '', trim: true },
  rooms: { type: String, default: '', trim: true },
  photos: { type: [String], default: [] },
  address: {
    type: String,
    required: [true, 'Site address is required'],
    trim: true,
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  radiusMeters: {
    type: Number,
    default: 200,
    min: 20,
    max: 5000,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  assignedEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  }],
  notes: {
    type: String,
    default: '',
  }
}, { timestamps: true });

siteSchema.index({ tenantId: 1, isActive: 1 });
siteSchema.index({ tenantId: 1, createdAt: -1 });
siteSchema.index({ isActive: 1 });
siteSchema.index({ createdAt: -1 });

const Site = mongoose.models.Site || mongoose.model('Site', siteSchema);

export default Site;
