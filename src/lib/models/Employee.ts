import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
  employeeId: {
    type: String,
    sparse: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
    default: '',
  },
  role: {
    type: String,
    trim: true,
    default: '',
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0,
  },
  standardHours: {
    type: Number,
    required: true,
    default: 8,
    min: 1,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  notes: {
    type: String,
    default: '',
  },
  deviceId: {
    type: String,
    default: null,
  },
  deviceName: {
    type: String,
    default: '',
  },
  deviceRegisteredAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true, strict: false });

employeeSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true, sparse: true });
employeeSchema.index({ tenantId: 1, status: 1 });
employeeSchema.index({ tenantId: 1, createdAt: -1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ createdAt: -1 });

// In Next.js dev mode, delete cached model to ensure schema updates take effect
if (mongoose.models && (mongoose.models as any).Employee) {
  delete (mongoose.models as any).Employee;
}

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

export default Employee;
