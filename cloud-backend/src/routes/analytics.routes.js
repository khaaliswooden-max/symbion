// src/routes/analytics.routes.js
// Analytics and insights routes

import express from 'express';
import { query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import * as analyticsController from '../controllers/analytics.controller.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get analytics summary
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *     responses:
 *       200:
 *         description: Analytics summary
 */
router.get(
  '/summary',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'year']),
  ],
  analyticsController.getSummary
);

/**
 * @swagger
 * /analytics/trends:
 *   get:
 *     summary: Get analyte trends
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: analyte
 *         schema:
 *           type: string
 *           enum: [serotonin, dopamine, gaba, ph]
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [hour, day, week]
 *           default: day
 *     responses:
 *       200:
 *         description: Trend data
 */
router.get('/trends', analyticsController.getTrends);

/**
 * @swagger
 * /analytics/correlations:
 *   get:
 *     summary: Get analyte correlations
 *     tags: [Analytics]
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
 *         description: Correlation matrix
 */
router.get('/correlations', analyticsController.getCorrelations);

/**
 * @swagger
 * /analytics/anomalies:
 *   get:
 *     summary: Detect anomalies in readings
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sensitivity
 *         schema:
 *           type: number
 *           default: 2.5
 *     responses:
 *       200:
 *         description: Detected anomalies
 */
router.get('/anomalies', analyticsController.detectAnomalies);

/**
 * @swagger
 * /analytics/export:
 *   get:
 *     summary: Export data as CSV
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         required: true
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
 *     responses:
 *       200:
 *         description: CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/export', analyticsController.exportData);

export default router;

