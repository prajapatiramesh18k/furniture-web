import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  material: { type: String, default: '' },
  height: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true, default: 0 },
});

const quotationSchema = new mongoose.Schema({
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
  totals: {
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  workType: { type: String },
  terms: { type: String },
  inclusions: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Quotation = mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);

export default Quotation;
