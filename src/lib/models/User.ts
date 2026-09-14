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
    unique: true,
    lowercase: true,
    trim: true,
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
    enum: ['admin', 'manager', 'staff', 'customer'],
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

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
