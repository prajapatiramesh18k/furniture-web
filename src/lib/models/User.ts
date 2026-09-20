import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    // NOTE: email is unique per tenant (compound index below), not globally,
    // so the same address can exist in different companies.
  },
  password: {
    type: String,
    // Not required if logging in via Google
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'staff', 'customer', 'super_admin'],
    default: 'customer',
  },
  permissions: {
    type: [String],
    default: [],
  },
  phone: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
    index: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
    index: true,
  },
  resetToken: {
    type: String,
  },
  resetTokenExpiry: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Email is unique within a tenant, not globally (multi-tenancy).
// Legacy single-tenant rows have tenantId set by the backfill migration.
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ tenantId: 1, createdAt: -1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
