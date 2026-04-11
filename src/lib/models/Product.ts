import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  description: string;
  image: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  rating: { type: Number, default: 4.0 },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

ProductSchema.index({ slug: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
