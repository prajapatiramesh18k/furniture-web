import mongoose from 'mongoose';

const employeePaymentSchema = new mongoose.Schema({
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

const EmployeePayment = mongoose.models.EmployeePayment || mongoose.model('EmployeePayment', employeePaymentSchema);

export default EmployeePayment;
