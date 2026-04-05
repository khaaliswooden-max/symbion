import mongoose from 'mongoose';

const sensorReadingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  deviceId: {
    type: String,
    required: true,
    index: true,
  },
  serotonin_nm: { type: Number, required: true },
  dopamine_nm: { type: Number, required: true },
  gaba_nm: { type: Number, required: true },
  ph_level: { type: Number, required: true },
  temperature_c: { type: Number, required: true },
  calprotectin_ug_g: { type: Number, required: true },
  timestamp_ms: { type: Number, required: true },
  quality: {
    type: String,
    enum: ['good', 'fair', 'poor'],
    default: 'good',
  },
}, {
  timestamps: true,
});

// Compound indexes for common query patterns
sensorReadingSchema.index({ userId: 1, deviceId: 1, timestamp_ms: -1 });
sensorReadingSchema.index({ deviceId: 1, timestamp_ms: -1 });
sensorReadingSchema.index({ timestamp_ms: -1 });

// TTL index - auto-delete readings older than 2 years
sensorReadingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

export default mongoose.model('SensorReading', sensorReadingSchema);
