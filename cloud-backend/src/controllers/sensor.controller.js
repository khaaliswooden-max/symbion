// src/controllers/sensor.controller.js
// Sensor data controller - placeholder implementations

import { validationResult } from 'express-validator';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export async function submitReadings(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }
    
    const { deviceId, readings } = req.body;
    
    logger.info(`Received ${readings.length} readings from device ${deviceId}`);
    
    // TODO: Save to database
    // await SensorReading.insertMany(readings.map(r => ({
    //   userId: req.user.id,
    //   deviceId,
    //   ...r
    // })));
    
    res.status(201).json({
      message: 'Readings saved successfully',
      count: readings.length,
      deviceId,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReadings(req, res, next) {
  try {
    const { deviceId, startDate, endDate, limit = 100 } = req.query;
    
    // TODO: Fetch from database with filters
    
    res.json({
      readings: [],
      count: 0,
      deviceId,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReadingById(req, res, next) {
  try {
    const { id } = req.params;
    
    // TODO: Fetch from database
    
    throw new NotFoundError('Reading not found');
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
    
    // TODO: Fetch latest from database
    
    res.json({
      reading: null,
      deviceId,
    });
  } catch (error) {
    next(error);
  }
}

