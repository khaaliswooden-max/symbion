// src/routes/sensor.routes.js
// Sensor data routes

import express from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import * as sensorController from '../controllers/sensor.controller.js';

const router = express.Router();

// All sensor routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /sensors/readings:
 *   post:
 *     summary: Submit sensor readings
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - readings
 *             properties:
 *               deviceId:
 *                 type: string
 *               readings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     serotonin_nm:
 *                       type: number
 *                     dopamine_nm:
 *                       type: number
 *                     gaba_nm:
 *                       type: number
 *                     ph_level:
 *                       type: number
 *                     temperature_c:
 *                       type: number
 *                     calprotectin_ug_g:
 *                       type: number
 *                     timestamp_ms:
 *                       type: number
 *     responses:
 *       201:
 *         description: Readings saved successfully
 */
router.post(
  '/readings',
  [
    body('deviceId').notEmpty(),
    body('readings').isArray({ min: 1 }),
  ],
  sensorController.submitReadings
);

/**
 * @swagger
 * /sensors/readings:
 *   get:
 *     summary: Get sensor readings
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: List of readings
 */
router.get(
  '/readings',
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }),
  ],
  sensorController.getReadings
);

/**
 * @swagger
 * /sensors/readings/{id}:
 *   get:
 *     summary: Get specific reading
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reading details
 *       404:
 *         description: Reading not found
 */
router.get('/readings/:id', sensorController.getReadingById);

/**
 * @swagger
 * /sensors/latest:
 *   get:
 *     summary: Get latest reading for device
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest reading
 */
router.get('/latest', sensorController.getLatestReading);

export default router;

