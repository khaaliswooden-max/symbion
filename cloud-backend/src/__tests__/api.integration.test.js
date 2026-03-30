import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Device from '../models/Device.js';
import SensorReading from '../models/SensorReading.js';

const JWT_SECRET = process.env.JWT_SECRET || 'symbion-dev-secret';

// Helper to create a test user and return auth token
async function createTestUser(overrides = {}) {
  const user = await User.create({
    email: `test-${Date.now()}@symbion.health`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  });

  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user, token };
}

async function createTestDevice(userId, overrides = {}) {
  return Device.create({
    deviceId: `DEV-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId,
    name: 'Test Device',
    ...overrides,
  });
}

async function createTestReadings(userId, deviceId, count = 10) {
  const readings = [];
  const baseTime = Date.now() - count * 3600000;

  for (let i = 0; i < count; i++) {
    readings.push({
      userId,
      deviceId,
      serotonin_nm: 100 + Math.random() * 100,
      dopamine_nm: 250 + Math.random() * 150,
      gaba_nm: 600 + Math.random() * 300,
      ph_level: 6.8 + Math.random() * 0.4,
      temperature_c: 36.5 + Math.random() * 1.0,
      calprotectin_ug_g: 20 + Math.random() * 25,
      timestamp_ms: baseTime + i * 3600000,
    });
  }

  return SensorReading.insertMany(readings);
}

describe('Database Models Integration', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/symbion_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Device.deleteMany({});
    await SensorReading.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Device.deleteMany({});
    await SensorReading.deleteMany({});
  });

  describe('Device Model', () => {
    it('should create and retrieve a device', async () => {
      const { user } = await createTestUser();
      const device = await createTestDevice(user._id);

      expect(device.deviceId).toBeDefined();
      expect(device.userId.toString()).toBe(user._id.toString());
      expect(device.status).toBe('paired');
    });

    it('should enforce unique deviceId', async () => {
      const { user } = await createTestUser();
      const deviceId = 'DUPLICATE-DEVICE-001';

      await createTestDevice(user._id, { deviceId });

      await expect(
        createTestDevice(user._id, { deviceId })
      ).rejects.toThrow();
    });

    it('should list devices for a specific user', async () => {
      const { user: user1 } = await createTestUser({ email: 'user1@test.com' });
      const { user: user2 } = await createTestUser({ email: 'user2@test.com' });

      await createTestDevice(user1._id, { deviceId: 'DEV-A' });
      await createTestDevice(user1._id, { deviceId: 'DEV-B' });
      await createTestDevice(user2._id, { deviceId: 'DEV-C' });

      const user1Devices = await Device.find({ userId: user1._id });
      const user2Devices = await Device.find({ userId: user2._id });

      expect(user1Devices.length).toBe(2);
      expect(user2Devices.length).toBe(1);
    });

    it('should update device status and battery', async () => {
      const { user } = await createTestUser();
      const device = await createTestDevice(user._id);

      await Device.findByIdAndUpdate(device._id, {
        status: 'active',
        batteryLevel: 85,
        firmwareVersion: '1.1.0',
      });

      const updated = await Device.findById(device._id);
      expect(updated.status).toBe('active');
      expect(updated.batteryLevel).toBe(85);
      expect(updated.firmwareVersion).toBe('1.1.0');
    });
  });

  describe('SensorReading Model', () => {
    it('should insert batch readings', async () => {
      const { user } = await createTestUser();
      const device = await createTestDevice(user._id);

      const saved = await createTestReadings(user._id, device.deviceId, 50);
      expect(saved.length).toBe(50);
    });

    it('should query readings by device and time range', async () => {
      const { user } = await createTestUser();
      const device = await createTestDevice(user._id);

      await createTestReadings(user._id, device.deviceId, 100);

      // Query last 24 hours
      const cutoff = Date.now() - 86400000;
      const recent = await SensorReading.find({
        deviceId: device.deviceId,
        timestamp_ms: { $gte: cutoff },
      }).sort({ timestamp_ms: -1 });

      expect(recent.length).toBeLessThanOrEqual(100);
      expect(recent.length).toBeGreaterThan(0);

      // Verify sort order
      for (let i = 1; i < recent.length; i++) {
        expect(recent[i - 1].timestamp_ms).toBeGreaterThanOrEqual(recent[i].timestamp_ms);
      }
    });

    it('should get latest reading for device', async () => {
      const { user } = await createTestUser();
      const device = await createTestDevice(user._id);

      await createTestReadings(user._id, device.deviceId, 20);

      const latest = await SensorReading.findOne({
        deviceId: device.deviceId,
      }).sort({ timestamp_ms: -1 });

      expect(latest).not.toBeNull();
      expect(latest.serotonin_nm).toBeGreaterThan(0);
    });

    it('should validate required fields', async () => {
      await expect(SensorReading.create({
        userId: new mongoose.Types.ObjectId(),
        deviceId: 'test-device',
        // Missing required fields
      })).rejects.toThrow();
    });

    it('should isolate readings between users', async () => {
      const { user: user1 } = await createTestUser({ email: 'iso1@test.com' });
      const { user: user2 } = await createTestUser({ email: 'iso2@test.com' });
      const device1 = await createTestDevice(user1._id, { deviceId: 'ISO-DEV-1' });
      const device2 = await createTestDevice(user2._id, { deviceId: 'ISO-DEV-2' });

      await createTestReadings(user1._id, device1.deviceId, 10);
      await createTestReadings(user2._id, device2.deviceId, 5);

      const user1Readings = await SensorReading.find({ userId: user1._id });
      const user2Readings = await SensorReading.find({ userId: user2._id });

      expect(user1Readings.length).toBe(10);
      expect(user2Readings.length).toBe(5);
    });
  });

  describe('Cross-Model Queries', () => {
    it('should support full data pipeline: user -> device -> readings', async () => {
      const { user } = await createTestUser();
      const device = await createTestDevice(user._id);
      await createTestReadings(user._id, device.deviceId, 30);

      // Simulate what the analytics controller does
      const readings = await SensorReading.find({
        userId: user._id,
        deviceId: device.deviceId,
      })
        .sort({ timestamp_ms: 1 })
        .lean();

      expect(readings.length).toBe(30);

      // Verify data quality
      readings.forEach(r => {
        expect(r.serotonin_nm).toBeGreaterThan(0);
        expect(r.dopamine_nm).toBeGreaterThan(0);
        expect(r.gaba_nm).toBeGreaterThan(0);
        expect(r.ph_level).toBeGreaterThan(5);
        expect(r.ph_level).toBeLessThan(9);
        expect(r.temperature_c).toBeGreaterThan(30);
        expect(r.temperature_c).toBeLessThan(42);
      });
    });

    it('should handle device deletion without orphaning readings', async () => {
      const { user } = await createTestUser();
      const device = await createTestDevice(user._id);
      await createTestReadings(user._id, device.deviceId, 10);

      // Readings exist
      let count = await SensorReading.countDocuments({ deviceId: device.deviceId });
      expect(count).toBe(10);

      // Delete device
      await Device.findByIdAndDelete(device._id);

      // Readings still exist (no cascade delete - historical data preserved)
      count = await SensorReading.countDocuments({ deviceId: device.deviceId });
      expect(count).toBe(10);
    });
  });
});
