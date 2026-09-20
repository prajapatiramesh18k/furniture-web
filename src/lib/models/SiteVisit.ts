import mongoose, { Schema, Document } from 'mongoose';

export type SiteVisitStatus = 'scheduled' | 'completed' | 'rescheduled' | 'cancelled';
export type QuoteStatus = 'pending' | 'completed';

export interface ISiteVisit extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  siteId?: mongoose.Types.ObjectId | string | null;
  leadId?: mongoose.Types.ObjectId | string | null;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  visitDate: Date;
  assignedTo?: mongoose.Types.ObjectId | string | null;
  status: SiteVisitStatus;
  quoteStatus: QuoteStatus;
  requirements: string;
  notes: string;
  photos: string[];
  createdBy?: mongoose.Types.ObjectId | string | null;
}

const SiteVisitSchema = new Schema<ISiteVisit>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', default: null, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    visitDate: { type: Date, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'rescheduled', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    quoteStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
      index: true,
    },
    requirements: { type: String, default: '' },
    notes: { type: String, default: '' },
    photos: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

SiteVisitSchema.index({ tenantId: 1, status: 1, visitDate: 1 });
SiteVisitSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.models.SiteVisit || mongoose.model<ISiteVisit>('SiteVisit', SiteVisitSchema);
