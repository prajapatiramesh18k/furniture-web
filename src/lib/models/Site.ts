import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true,
  },
  clientName: {
    type: String,
    default: '',
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Site address is required'],
    trim: true,
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
  },
  radiusMeters: {
    type: Number,
    default: 200,
    min: 20,
    max: 5000,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  assignedEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  }],
  notes: {
    type: String,
    default: '',
  }
}, { timestamps: true });

siteSchema.index({ isActive: 1 });
siteSchema.index({ createdAt: -1 });

const Site = mongoose.models.Site || mongoose.model('Site', siteSchema);

export default Site;
