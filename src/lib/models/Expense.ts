import mongoose, { Schema, Document } from 'mongoose';

export type ExpenseCategory = 'material' | 'labour' | 'transport' | 'contractor' | 'misc';

export interface IExpense extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  projectId: mongoose.Types.ObjectId | string;
  category: ExpenseCategory;
  materialName: string;
  quantity: number;
  unit: string;
  amount: number;
  expenseDate: Date;
  vendorId?: mongoose.Types.ObjectId | string | null;
  employeeId?: mongoose.Types.ObjectId | string | null;
  notes: string;
  bill: string;
  createdBy?: mongoose.Types.ObjectId | string | null;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    category: {
      type: String,
      enum: ['material', 'labour', 'transport', 'contractor', 'misc'],
      default: 'material',
      index: true,
    },
    materialName: { type: String, default: '', trim: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: '', trim: true },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, default: Date.now },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', default: null },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    notes: { type: String, default: '' },
    bill: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

ExpenseSchema.index({ tenantId: 1, projectId: 1, expenseDate: -1 });

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
