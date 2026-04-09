import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  name: string;
  location: string;
  rating: number;
  text: string;
  photo?: string;
  date: string;
  approved: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, required: true },
  text: { type: String, required: true },
  photo: { type: String },
  date: { type: String, required: true },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
