import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectPayment extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  projectId: mongoose.Types.ObjectId | string;
  invoiceId?: mongoose.Types.ObjectId | string | null;
  amount: number;
  method: string;
  paymentDate: Date;
  notes: string;
  receivedBy?: mongoose.Types.ObjectId | string | null;
}

const ProjectPaymentSchema = new Schema<IProjectPayment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', default: null, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, default: 'Cash', trim: true },
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

ProjectPaymentSchema.index({ tenantId: 1, projectId: 1, paymentDate: -1 });

export default mongoose.models.ProjectPayment ||
  mongoose.model<IProjectPayment>('ProjectPayment', ProjectPaymentSchema);
