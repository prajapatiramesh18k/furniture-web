import mongoose from 'mongoose';

const employeePaymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentType: {
    type: String,
    enum: ['Advance', 'Partial Payment', 'Settlement', 'Other'],
    default: 'Advance',
  },
  notes: {
    type: String,
    default: '',
  },
  createdBy: {
    type: String,
    default: 'Admin',
  },
}, { timestamps: true });

employeePaymentSchema.index({ tenantId: 1, employeeId: 1, date: -1 });
employeePaymentSchema.index({ tenantId: 1, date: -1 });
employeePaymentSchema.index({ employeeId: 1, date: -1 });
employeePaymentSchema.index({ date: -1 });

const EmployeePayment = mongoose.models.EmployeePayment || mongoose.model('EmployeePayment', employeePaymentSchema);

export default EmployeePayment;
