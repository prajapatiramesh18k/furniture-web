import mongoose, { Schema, Document } from 'mongoose';

export type ProjectStatus =
  | 'planning'
  | 'design'
  | 'procurement'
  | 'execution'
  | 'finishing'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export interface IProject extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  name: string;
  customerId?: mongoose.Types.ObjectId | string | null;
  customer: { name: string; phone: string; email: string };
  siteId?: mongoose.Types.ObjectId | string | null;
  leadId?: mongoose.Types.ObjectId | string | null;
  quotationId?: mongoose.Types.ObjectId | string | null;
  quotationNo: string;
  projectType: string;
  status: ProjectStatus;
  startDate?: Date | null;
  expectedEnd?: Date | null;
  budgetValue: number;
  packages?: { key: string; label: string; trade: string; room?: string; budgetValue: number; status?: string }[];
  managerId?: mongoose.Types.ObjectId | string | null;
  supervisorId?: mongoose.Types.ObjectId | string | null;
  notes: string;
  createdBy?: mongoose.Types.ObjectId | string | null;
}

const ProjectSchema = new Schema<IProject>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
    name: { type: String, required: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true },
    },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', default: null, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', default: null, index: true },
    quotationNo: { type: String, default: '', trim: true },
    projectType: { type: String, default: 'General', trim: true },
    status: {
      type: String,
      enum: ['planning', 'design', 'procurement', 'execution', 'finishing', 'completed', 'on_hold', 'cancelled'],
      default: 'planning',
      index: true,
    },
    startDate: { type: Date, default: null },
    expectedEnd: { type: Date, default: null },
    budgetValue: { type: Number, default: 0, min: 0 },
    // Work packages carried over from a multi-trade quotation's categories.
    // Single-trade projects have an empty list — reads treat missing as [].
    packages: {
      type: [{
        key: { type: String },
        label: { type: String },
        trade: { type: String },
        room: { type: String },
        budgetValue: { type: Number, default: 0 },
        status: { type: String, default: 'pending' },
      }],
      default: [],
    },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    supervisorId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

ProjectSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
ProjectSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
