import mongoose, { Schema, Document } from 'mongoose';

export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'cancelled';

export interface IInvoiceItem {
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  projectId: mongoose.Types.ObjectId | string;
  quotationId?: mongoose.Types.ObjectId | string | null;
  invoiceNo: string;
  items: IInvoiceItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paidTotal: number;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate?: Date | null;
  notes: string;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gstNumber: string;
    logo: string;
    website: string;
  };
  createdBy?: mongoose.Types.ObjectId | string | null;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false },
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation', default: null },
    invoiceNo: { type: String, required: true, trim: true },
    items: { type: [InvoiceItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    paidTotal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'sent', 'partial', 'paid', 'cancelled'],
      default: 'draft',
      index: true,
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null },
    notes: { type: String, default: '' },
    company: {
      name: { type: String, default: '' },
      address: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      gstNumber: { type: String, default: '' },
      logo: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

InvoiceSchema.index({ tenantId: 1, invoiceNo: 1 }, { unique: true });
InvoiceSchema.index({ tenantId: 1, projectId: 1, createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
