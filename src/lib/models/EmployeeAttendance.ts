import mongoose from 'mongoose';

const employeeAttendanceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
  },
  siteName: {
    type: String,
    default: '',
  },
  punchIn: {
    type: Date,
  },
  punchOut: {
    type: Date,
  },
  punchInLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    distanceMeters: { type: Number },
  },
  punchOutLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    distanceMeters: { type: Number },
  },
  status: {
    type: String,
    enum: ['punched_in', 'completed', 'manual', 'absent'],
    default: 'manual',
  },
  workHours: {
    type: Number,
    default: 0,
    min: 0,
  },
  earnedDays: {
    type: Number,
    default: 0,
    min: 0,
  },
  overtimeHours: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  punchInDeviceId: {
    type: String,
    default: null,
  },
  punchOutDeviceId: {
    type: String,
    default: null,
  },
}, { timestamps: true });

// Prevent duplicate attendance for the same employee on the same date
employeeAttendanceSchema.index({ tenantId: 1, employeeId: 1, date: 1 }, { unique: true });
employeeAttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
employeeAttendanceSchema.index({ tenantId: 1, date: -1 });
employeeAttendanceSchema.index({ date: -1 });
employeeAttendanceSchema.index({ status: 1, date: -1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.EmployeeAttendance) {
  delete (mongoose.models as any).EmployeeAttendance;
}

const EmployeeAttendance = mongoose.models.EmployeeAttendance || mongoose.model('EmployeeAttendance', employeeAttendanceSchema);

export default EmployeeAttendance;
