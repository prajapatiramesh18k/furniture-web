import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressUpdate extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  projectId: mongoose.Types.ObjectId | string;
  floor: string;
  room: string;
  category: string;
  photos: string[];
  notes: string;
  updateDate: Date;
  createdBy?: mongoose.Types.ObjectId | string | null;
}

const ProgressUpdateSchema = new Schema<IProgressUpdate>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    floor: { type: String, default: '', trim: true },
    room: { type: String, default: '', trim: true },
    category: { type: String, default: 'General', trim: true },
    photos: { type: [String], default: [] },
    notes: { type: String, default: '', trim: true },
    updateDate: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

ProgressUpdateSchema.index({ tenantId: 1, projectId: 1, updateDate: -1 });

export default mongoose.models.ProgressUpdate ||
  mongoose.model<IProgressUpdate>('ProgressUpdate', ProgressUpdateSchema);
