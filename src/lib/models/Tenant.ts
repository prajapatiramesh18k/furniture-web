import mongoose, { Schema, Document } from 'mongoose';

export type TenantStatus = 'active' | 'suspended';
export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'none';

export interface ITenant extends Document {
  name: string;
  slug: string;
  status: TenantStatus;
  // Branding / company settings (used on quotations, PDFs, header)
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  quotationPrefix: string;
  // Company-wise employee ID prefix, e.g. "AHF" -> AHF-001, "PIS" -> PIS-001
  employeePrefix?: string;
  website?: string;
  // Subscription-ready (no payment gateway)
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
    logo: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    quotationPrefix: { type: String, default: 'Q', trim: true },
    employeePrefix: { type: String, default: '', trim: true, uppercase: true },
    website: { type: String, default: '' },
    plan: {
      type: String,
      enum: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'],
      default: 'FREE',
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['trial', 'active', 'past_due', 'cancelled', 'none'],
      default: 'none',
    },
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date },
  },
  { timestamps: true },
);

TenantSchema.index({ status: 1, createdAt: -1 });

export function tenantSlugFor(name: string): string {
  return slugify(name);
}

export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
