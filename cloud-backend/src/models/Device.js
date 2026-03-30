import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  serialNumber: String,
  firmwareVersion: { type: String, default: '1.0.0' },
  status: {
    type: String,
    enum: ['active', 'inactive', 'paired', 'error', 'calibrating'],
    default: 'paired',
  },
  batteryLevel: { type: Number, min: 0, max: 100 },
  lastSync: Date,
  calibration: {
    lastCalibrated: Date,
    offsets: {
      serotonin: { type: Number, default: 0 },
      dopamine: { type: Number, default: 0 },
      gaba: { type: Number, default: 0 },
      ph: { type: Number, default: 0 },
    },
    gains: {
      serotonin: { type: Number, default: 1 },
      dopamine: { type: Number, default: 1 },
      gaba: { type: Number, default: 1 },
      ph: { type: Number, default: 1 },
    },
  },
  metadata: {
    type: Map,
    of: String,
  },
}, {
  timestamps: true,
});

deviceSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Device', deviceSchema);
