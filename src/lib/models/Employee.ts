import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
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

employeeSchema.index({ status: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ createdAt: -1 });

// In Next.js dev mode, delete cached model to ensure schema updates take effect
if (mongoose.models && (mongoose.models as any).Employee) {
  delete (mongoose.models as any).Employee;
}

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

export default Employee;
