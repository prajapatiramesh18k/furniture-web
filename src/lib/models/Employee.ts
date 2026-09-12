import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
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
}, { timestamps: true, strict: false });

// In Next.js dev mode, delete cached model to ensure schema updates take effect
if (mongoose.models && (mongoose.models as any).Employee) {
  delete (mongoose.models as any).Employee;
}

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

export default Employee;
