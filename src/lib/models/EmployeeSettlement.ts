import mongoose from 'mongoose';

const employeeSettlementSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  month: {
    type: Number, // 1-12
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  totalWorkHours: {
    type: Number,
    required: true,
    default: 0,
  },
  totalEarnedDays: {
    type: Number,
    required: true,
    default: 0,
  },
  dailyRate: {
    type: Number,
    required: true,
  },
  grossAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPaid: {
    type: Number,
    required: true,
    default: 0,
  },
  balanceAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  settlementAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  settlementDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Settled'],
    default: 'Settled',
  },
  createdBy: {
    type: String,
    default: 'Admin',
  },
}, { timestamps: true });

// Prevent multiple settlements for the same month/year per employee
employeeSettlementSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
employeeSettlementSchema.index({ settlementDate: -1 });

const EmployeeSettlement = mongoose.models.EmployeeSettlement || mongoose.model('EmployeeSettlement', employeeSettlementSchema);

export default EmployeeSettlement;
