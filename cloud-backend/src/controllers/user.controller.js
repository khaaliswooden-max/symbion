import User from '../models/User.js';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js';

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json({ user: user.toProfile() });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const allowedFields = ['firstName', 'lastName', 'dateOfBirth', 'healthProfile'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      message: 'Profile updated successfully',
      user: user.toProfile(),
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Merge preferences
    user.preferences = { ...user.preferences?.toObject?.() || user.preferences, ...req.body };
    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const filter = { isActive: true };
    if (role) filter.role = role;

    const [users, count] = await Promise.all([
      User.find(filter)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      users: users.map(u => u.toProfile()),
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}
