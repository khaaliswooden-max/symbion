import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'clinician'],
    default: 'user',
  },
  dateOfBirth: Date,
  healthProfile: {
    conditions: [String],
    medications: [String],
    allergies: [String],
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false },
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    alertThresholds: {
      serotonin: { min: { type: Number, default: 50 }, max: { type: Number, default: 200 } },
      dopamine: { min: { type: Number, default: 100 }, max: { type: Number, default: 500 } },
      gaba: { min: { type: Number, default: 200 }, max: { type: Number, default: 1000 } },
      ph: { min: { type: Number, default: 6.5 }, max: { type: Number, default: 7.5 } },
    },
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date,
  }],
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toProfile = function () {
  return {
    id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    dateOfBirth: this.dateOfBirth,
    healthProfile: this.healthProfile,
    preferences: this.preferences,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
