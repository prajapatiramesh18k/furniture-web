import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  description: string;
  image: string;
  images?: string[];
  sku?: string;
  stock?: number;
  status?: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  rating: { type: Number, default: 4.0 },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, required: true },
  images: { type: [String], default: undefined },
  sku: { type: String, default: '' },
  stock: { type: Number, default: 10 },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

ProductSchema.index({ tenantId: 1, slug: 1 });
ProductSchema.index({ tenantId: 1, category: 1 });
ProductSchema.index({ tenantId: 1, createdAt: -1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
