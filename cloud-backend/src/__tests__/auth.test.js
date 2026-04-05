import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'symbion-dev-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'symbion-dev-refresh-secret';

describe('User Model', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/symbion_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should hash password on save', async () => {
    const user = await User.create({
      email: 'test@symbion.health',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    });

    // Password should be hashed, not plaintext
    const dbUser = await User.findById(user._id).select('+password');
    expect(dbUser.password).not.toBe('SecurePassword123!');
    expect(dbUser.password.startsWith('$2')).toBe(true);
  });

  it('should compare passwords correctly', async () => {
    const user = await User.create({
      email: 'pwd@symbion.health',
      password: 'CorrectPassword123',
      firstName: 'Pwd',
      lastName: 'Test',
    });

    const dbUser = await User.findById(user._id).select('+password');
    expect(await dbUser.comparePassword('CorrectPassword123')).toBe(true);
    expect(await dbUser.comparePassword('WrongPassword')).toBe(false);
  });

  it('should not include password in default queries', async () => {
    await User.create({
      email: 'hidden@symbion.health',
      password: 'HiddenPassword123',
      firstName: 'Hidden',
      lastName: 'Pwd',
    });

    const user = await User.findOne({ email: 'hidden@symbion.health' });
    expect(user.password).toBeUndefined();
  });

  it('should enforce unique email', async () => {
    await User.create({
      email: 'unique@symbion.health',
      password: 'Password123',
      firstName: 'First',
      lastName: 'User',
    });

    await expect(User.create({
      email: 'unique@symbion.health',
      password: 'Password456',
      firstName: 'Second',
      lastName: 'User',
    })).rejects.toThrow();
  });

  it('should generate correct profile output', async () => {
    const user = await User.create({
      email: 'profile@symbion.health',
      password: 'Password123',
      firstName: 'Profile',
      lastName: 'Test',
    });

    const profile = user.toProfile();
    expect(profile.email).toBe('profile@symbion.health');
    expect(profile.firstName).toBe('Profile');
    expect(profile.lastName).toBe('Test');
    expect(profile.role).toBe('user');
    expect(profile).not.toHaveProperty('password');
    expect(profile).toHaveProperty('id');
  });

  it('should set default role to user', async () => {
    const user = await User.create({
      email: 'role@symbion.health',
      password: 'Password123',
      firstName: 'Role',
      lastName: 'Test',
    });

    expect(user.role).toBe('user');
  });

  it('should store and retrieve preferences', async () => {
    const user = await User.create({
      email: 'prefs@symbion.health',
      password: 'Password123',
      firstName: 'Prefs',
      lastName: 'Test',
    });

    user.preferences = {
      notifications: false,
      units: 'imperial',
    };
    await user.save();

    const updated = await User.findById(user._id);
    expect(updated.preferences.notifications).toBe(false);
    expect(updated.preferences.units).toBe('imperial');
  });
});

describe('JWT Token Generation', () => {
  it('should create valid access tokens', () => {
    const payload = { userId: 'test123', email: 'test@test.com', role: 'user' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.userId).toBe('test123');
    expect(decoded.email).toBe('test@test.com');
  });

  it('should reject expired tokens', () => {
    const token = jwt.sign({ userId: 'test' }, JWT_SECRET, { expiresIn: '-1s' });
    expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
  });

  it('should reject tokens with wrong secret', () => {
    const token = jwt.sign({ userId: 'test' }, 'wrong-secret', { expiresIn: '1h' });
    expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
  });
});
