import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  tenantId?: mongoose.Types.ObjectId | string | null;
  projectId: mongoose.Types.ObjectId | string;
  title: string;
  category: string;
  assignedTo?: mongoose.Types.ObjectId | string | null;
  dueDate?: Date | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  notes: string;
  createdBy?: mongoose.Types.ObjectId | string | null;
}

const TaskSchema = new Schema<ITask>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'General', trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    dueDate: { type: Date, default: null },
    status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

TaskSchema.index({ tenantId: 1, projectId: 1, status: 1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
