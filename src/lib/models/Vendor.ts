import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
  materials: string;
  notes: string;
}

const VendorSchema = new Schema<IVendor>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
    company: { type: String, required: true, trim: true },
    contactName: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    gstNumber: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    materials: { type: String, default: '', trim: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

VendorSchema.index({ tenantId: 1, company: 1 });
VendorSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);
