import { validationResult } from 'express-validator';
import SensorReading from '../models/SensorReading.js';
import * as analyticsService from '../services/analytics.service.js';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const PERIOD_MS = {
  day: 86400000,
  week: 604800000,
  month: 2592000000,
  year: 31536000000,
};

async function fetchReadings(userId, deviceId, periodMs, limit = 5000) {
  const filter = { userId };
  if (deviceId) filter.deviceId = deviceId;
  if (periodMs) {
    filter.timestamp_ms = { $gte: Date.now() - periodMs };
  }

  return SensorReading.find(filter)
    .sort({ timestamp_ms: 1 })
    .limit(limit)
    .lean();
}

/**
 * Get analytics summary
 * GET /api/v1/analytics/summary
 */
export async function getSummary(req, res, next) {
  try {
    const { deviceId, period = 'week' } = req.query;

    const readings = await fetchReadings(req.user.id, deviceId, PERIOD_MS[period]);

    if (readings.length === 0) {
      return res.json({
        period,
        deviceId,
        readingCount: 0,
        analytics: [],
        generatedAt: new Date().toISOString(),
      });
    }

    const analytes = ['serotonin_nm', 'dopamine_nm', 'gaba_nm', 'ph_level'];

    const analytics = analytes.map(analyte => {
      const data = readings.map(r => r[analyte]);
      const stats = analyticsService.calculateStats(data);
      const trend = analyticsService.detectTrend(data);
      const anomalies = analyticsService.detectAnomalies(data);

      return {
        analyte,
        stats,
        trend,
        anomalyCount: anomalies.length,
      };
    });

    res.json({
      period,
      deviceId,
      readingCount: readings.length,
      analytics,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get analyte trends
 * GET /api/v1/analytics/trends
 */
export async function getTrends(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError('Validation failed', errors.array());
    }

    const { deviceId, analyte, interval = 'day' } = req.query;

    const periodMs = interval === 'hour' ? PERIOD_MS.day
                   : interval === 'week' ? PERIOD_MS.month
                   : PERIOD_MS.week;

    const readings = await fetchReadings(req.user.id, deviceId, periodMs);

    if (readings.length === 0) {
      return res.json({
        analyte: analyte || 'serotonin_nm',
        interval,
        dataPoints: 0,
        trend: null,
        movingAverage: [],
        forecast: [],
        changePoints: [],
      });
    }

    const analyteKey = analyte ? `${analyte}_nm` : 'serotonin_nm';
    const data = readings.map(r => r[analyteKey] || r[analyte] || 0);

    const analysis = {
      analyte: analyteKey,
      interval,
      dataPoints: data.length,
      trend: analyticsService.detectTrend(data),
      movingAverage: analyticsService.movingAverage(data, 12),
      forecast: analyticsService.forecastValues(data, 24),
      changePoints: analyticsService.detectChangePoints(data),
    };

    res.json(analysis);
  } catch (error) {
    next(error);
  }
}

/**
 * Get analyte correlations
 * GET /api/v1/analytics/correlations
 */
export async function getCorrelations(req, res, next) {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      throw new BadRequestError('deviceId is required');
    }

    const readings = await fetchReadings(req.user.id, deviceId, PERIOD_MS.month);

    if (readings.length < 5) {
      return res.json({
        deviceId,
        matrix: {},
        strongestCorrelations: [],
        readingCount: readings.length,
        message: 'Not enough data for correlation analysis (minimum 5 readings)',
      });
    }

    const correlationMatrix = analyticsService.correlationMatrix(readings);

    const analytes = ['serotonin_nm', 'dopamine_nm', 'gaba_nm', 'ph_level'];
    const correlations = [];

    analytes.forEach((a1, i) => {
      analytes.slice(i + 1).forEach(a2 => {
        const corr = correlationMatrix[a1][a2];
        if (corr && Math.abs(corr.coefficient) > 0.3) {
          correlations.push({
            analyte1: a1,
            analyte2: a2,
            ...corr,
          });
        }
      });
    });

    correlations.sort((a, b) =>
      Math.abs(b.coefficient) - Math.abs(a.coefficient)
    );

    res.json({
      deviceId,
      matrix: correlationMatrix,
      strongestCorrelations: correlations.slice(0, 5),
      readingCount: readings.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Detect anomalies
 * GET /api/v1/analytics/anomalies
 */
export async function detectAnomalies(req, res, next) {
  try {
    const { deviceId, sensitivity = 2.5 } = req.query;

    if (!deviceId) {
      throw new BadRequestError('deviceId is required');
    }

    const readings = await fetchReadings(req.user.id, deviceId, PERIOD_MS.month);

    if (readings.length < 10) {
      return res.json({
        deviceId,
        sensitivity: parseFloat(sensitivity),
        anomalies: {},
        riskAssessment: { overall: 'insufficient_data' },
        insights: [{ type: 'info', message: 'Need at least 10 readings for anomaly detection' }],
      });
    }

    const anomalyReport = {};
    const analytes = ['serotonin_nm', 'dopamine_nm', 'gaba_nm', 'ph_level'];

    analytes.forEach(analyte => {
      const data = readings.map(r => r[analyte]);
      const anomalies = analyticsService.detectAnomalies(data, parseFloat(sensitivity));
      const anomaliesMAD = analyticsService.detectAnomaliesMAD(data);

      anomalyReport[analyte] = {
        zScore: anomalies,
        mad: anomaliesMAD,
        count: anomalies.length,
        percentage: ((anomalies.length / data.length) * 100).toFixed(1),
      };
    });

    const referenceRanges = {
      serotonin: { min: 50, max: 200 },
      dopamine: { min: 100, max: 500 },
      gaba: { min: 200, max: 1000 },
      ph_level: { min: 6.5, max: 7.5 },
      calprotectin: { min: 0, max: 50 },
    };

    const riskAssessment = analyticsService.assessHealthRisk(readings, referenceRanges);

    res.json({
      deviceId,
      sensitivity: parseFloat(sensitivity),
      anomalies: anomalyReport,
      riskAssessment,
      insights: analyticsService.generateInsights(readings),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Export data as CSV
 * GET /api/v1/analytics/export
 */
export async function exportData(req, res, next) {
  try {
    const { deviceId, startDate, endDate } = req.query;

    if (!deviceId) {
      throw new BadRequestError('deviceId is required');
    }

    const filter = { userId: req.user.id, deviceId };
    if (startDate || endDate) {
      filter.timestamp_ms = {};
      if (startDate) filter.timestamp_ms.$gte = new Date(startDate).getTime();
      if (endDate) filter.timestamp_ms.$lte = new Date(endDate).getTime();
    }

    const readings = await SensorReading.find(filter)
      .sort({ timestamp_ms: 1 })
      .limit(50000)
      .lean();

    const csv = generateCSV(readings);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="symbion-data-${deviceId}-${Date.now()}.csv"`
    );
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

function generateCSV(readings) {
  const headers = [
    'Timestamp',
    'Serotonin (nM)',
    'Dopamine (nM)',
    'GABA (nM)',
    'pH Level',
    'Temperature (C)',
    'Calprotectin (ug/g)',
    'Quality',
  ];

  let csv = headers.join(',') + '\n';

  readings.forEach(reading => {
    const row = [
      new Date(reading.timestamp_ms).toISOString(),
      reading.serotonin_nm.toFixed(2),
      reading.dopamine_nm.toFixed(2),
      reading.gaba_nm.toFixed(2),
      reading.ph_level.toFixed(2),
      reading.temperature_c.toFixed(2),
      reading.calprotectin_ug_g.toFixed(2),
      reading.quality || 'good',
    ];
    csv += row.join(',') + '\n';
  });

  return csv;
}
