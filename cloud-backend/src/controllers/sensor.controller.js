import { validationResult } from 'express-validator';
import SensorReading from '../models/SensorReading.js';
import Device from '../models/Device.js';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export async function submitReadings(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId, readings } = req.body;

    // Verify device belongs to user
    const device = await Device.findOne({ deviceId, userId: req.user.id });
    if (!device) {
      throw new NotFoundError('Device not found or not authorized');
    }

    const documents = readings.map(r => ({
      userId: req.user.id,
      deviceId,
      serotonin_nm: r.serotonin_nm,
      dopamine_nm: r.dopamine_nm,
      gaba_nm: r.gaba_nm,
      ph_level: r.ph_level,
      temperature_c: r.temperature_c,
      calprotectin_ug_g: r.calprotectin_ug_g,
      timestamp_ms: r.timestamp_ms || Date.now(),
      quality: r.quality || 'good',
    }));

    const saved = await SensorReading.insertMany(documents, { ordered: false });

    // Update device last sync
    device.lastSync = new Date();
    device.status = 'active';
    await device.save();

    logger.info(`Saved ${saved.length} readings from device ${deviceId}`);

    res.status(201).json({
      message: 'Readings saved successfully',
      count: saved.length,
      deviceId,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReadings(req, res, next) {
  try {
    const { deviceId, startDate, endDate, limit = 100, offset = 0 } = req.query;

    const filter = { userId: req.user.id };
    if (deviceId) filter.deviceId = deviceId;
    if (startDate || endDate) {
      filter.timestamp_ms = {};
      if (startDate) filter.timestamp_ms.$gte = new Date(startDate).getTime();
      if (endDate) filter.timestamp_ms.$lte = new Date(endDate).getTime();
    }

    const [readings, count] = await Promise.all([
      SensorReading.find(filter)
        .sort({ timestamp_ms: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .lean(),
      SensorReading.countDocuments(filter),
    ]);

    res.json({
      readings,
      count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
}

export async function getReadingById(req, res, next) {
  try {
    const reading = await SensorReading.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!reading) {
      throw new NotFoundError('Reading not found');
    }

    res.json({ reading });
  } catch (error) {
    next(error);
  }
}

export async function getLatestReading(req, res, next) {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      throw new BadRequestError('deviceId is required');
    }

    const reading = await SensorReading.findOne({
      userId: req.user.id,
      deviceId,
    })
      .sort({ timestamp_ms: -1 })
      .lean();

    res.json({
      reading,
      deviceId,
    });
  } catch (error) {
    next(error);
  }
}
