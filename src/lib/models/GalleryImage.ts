import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryImage extends Document {
  category: string;
  url: string;
  isUploaded: boolean;
  uploadedAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>({
  category: { type: String, required: true },
  url: { type: String, required: true },
  isUploaded: { type: Boolean, default: true },
  uploadedAt: { type: Date, default: Date.now },
});

GalleryImageSchema.index({ category: 1, uploadedAt: -1 });

export default mongoose.models.GalleryImage || mongoose.model<IGalleryImage>('GalleryImage', GalleryImageSchema);
