import mongoose from 'mongoose';

const employeeAttendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  workHours: {
    type: Number,
    required: true,
    min: 0,
  },
  earnedDays: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
    default: '',
  }
}, { timestamps: true });

// Prevent duplicate attendance for the same employee on the same date
employeeAttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const EmployeeAttendance = mongoose.models.EmployeeAttendance || mongoose.model('EmployeeAttendance', employeeAttendanceSchema);

export default EmployeeAttendance;
