import mongoose, { Schema, Document } from 'mongoose';

/**
 * Room/area measurements taken on site. Linked to a Site (property) and
 * reusable when building quotations — one measurement, many uses.
 */
export interface IMeasurement extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  siteId: mongoose.Types.ObjectId | string;
  room: string;
  category: string;
  length: number;
  width: number;
  height: number;
  area: number;
  unit: string;
  notes: string;
  createdBy?: mongoose.Types.ObjectId | string | null;
}

const MeasurementSchema = new Schema<IMeasurement>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    room: { type: String, required: true, trim: true },
    category: { type: String, default: 'General', trim: true },
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    area: { type: Number, default: 0 },
    unit: { type: String, default: 'ft', trim: true },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

MeasurementSchema.index({ tenantId: 1, siteId: 1, createdAt: -1 });

export default mongoose.models.Measurement || mongoose.model<IMeasurement>('Measurement', MeasurementSchema);
