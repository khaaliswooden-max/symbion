import { validationResult } from 'express-validator';
import Device from '../models/Device.js';
import { BadRequestError, NotFoundError, ConflictError } from '../middleware/errorHandler.js';

export async function getDevices(req, res, next) {
  try {
    const devices = await Device.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json({
      devices,
      count: devices.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function registerDevice(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId, name, serialNumber } = req.body;

    const existing = await Device.findOne({ deviceId });
    if (existing) {
      throw new ConflictError('Device already registered');
    }

    const device = await Device.create({
      deviceId,
      name,
      serialNumber,
      userId: req.user.id,
    });

    res.status(201).json({
      message: 'Device registered successfully',
      device,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeviceById(req, res, next) {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!device) {
      throw new NotFoundError('Device not found');
    }

    res.json({ device });
  } catch (error) {
    next(error);
  }
}

export async function updateDevice(req, res, next) {
  try {
    const allowedFields = ['name', 'serialNumber', 'metadata'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!device) {
      throw new NotFoundError('Device not found');
    }

    res.json({
      message: 'Device updated successfully',
      device,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDevice(req, res, next) {
  try {
    const device = await Device.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!device) {
      throw new NotFoundError('Device not found');
    }

    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function updateDeviceStatus(req, res, next) {
  try {
    const { batteryLevel, firmwareVersion, lastSync, status } = req.body;
    const updates = {};

    if (batteryLevel !== undefined) updates.batteryLevel = batteryLevel;
    if (firmwareVersion) updates.firmwareVersion = firmwareVersion;
    if (lastSync) updates.lastSync = lastSync;
    if (status) updates.status = status;

    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!device) {
      throw new NotFoundError('Device not found');
    }

    res.json({
      message: 'Device status updated successfully',
      device,
    });
  } catch (error) {
    next(error);
  }
}
