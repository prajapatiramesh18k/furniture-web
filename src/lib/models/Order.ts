import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ICustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
}

export interface IOrder extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  customerInfo: ICustomerInfo;
  items: IOrderItem[];
  total: number;
  paymentMethod: string;
  status: string;
  date: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  items: [{
    id: Number,
    name: String,
    image: String,
    price: Number,
    quantity: Number,
  }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'New Order' },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

OrderSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
