// src/controllers/analytics.controller.js
// Analytics controller - handles analytics endpoints

import { validationResult } from 'express-validator';
import * as analyticsService from '../services/analytics.service.js';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Get analytics summary
 * GET /api/v1/analytics/summary
 */
export async function getSummary(req, res, next) {
  try {
    const { deviceId, period = 'week' } = req.query;
    
    // TODO: Fetch readings from database
    // For now, return mock data structure
    const mockReadings = generateMockReadings(100);
    
    const analytics = analytes.map(analyte => {
      const data = mockReadings.map(r => r[analyte]);
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
      readingCount: mockReadings.length,
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
    
    // TODO: Fetch readings from database
    const mockReadings = generateMockReadings(168); // 1 week hourly
    
    const data = mockReadings.map(r => r[analyte || 'serotonin_nm']);
    
    const analysis = {
      analyte: analyte || 'serotonin_nm',
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
    
    // TODO: Fetch readings from database
    const mockReadings = generateMockReadings(100);
    
    const correlationMatrix = analyticsService.correlationMatrix(mockReadings);
    
    // Calculate strongest correlations
    const correlations = [];
    const analytes = ['serotonin_nm', 'dopamine_nm', 'gaba_nm', 'ph_level'];
    
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
    
    // Sort by strength
    correlations.sort((a, b) => 
      Math.abs(b.coefficient) - Math.abs(a.coefficient)
    );
    
    res.json({
      deviceId,
      matrix: correlationMatrix,
      strongestCorrelations: correlations.slice(0, 5),
      readingCount: mockReadings.length,
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
    
    // TODO: Fetch readings from database
    const mockReadings = generateMockReadings(200);
    
    const anomalyReport = {};
    const analytes = ['serotonin_nm', 'dopamine_nm', 'gaba_nm', 'ph_level'];
    
    analytes.forEach(analyte => {
      const data = mockReadings.map(r => r[analyte]);
      const anomalies = analyticsService.detectAnomalies(data, parseFloat(sensitivity));
      const anomaliesMAD = analyticsService.detectAnomaliesMAD(data);
      
      anomalyReport[analyte] = {
        zScore: anomalies,
        mad: anomaliesMAD,
        count: anomalies.length,
        percentage: ((anomalies.length / data.length) * 100).toFixed(1),
      };
    });
    
    // Get overall health risk
    const referenceRanges = {
      serotonin: { min: 50, max: 200 },
      dopamine: { min: 100, max: 500 },
      gaba: { min: 200, max: 1000 },
      ph_level: { min: 6.5, max: 7.5 },
      calprotectin: { min: 0, max: 50 },
    };
    
    const riskAssessment = analyticsService.assessHealthRisk(
      mockReadings,
      referenceRanges
    );
    
    res.json({
      deviceId,
      sensitivity: parseFloat(sensitivity),
      anomalies: anomalyReport,
      riskAssessment,
      insights: analyticsService.generateInsights(mockReadings),
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
    
    // TODO: Fetch readings from database with date filter
    const mockReadings = generateMockReadings(100);
    
    // Generate CSV
    const csv = generateCSV(mockReadings);
    
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

// Helper functions

const analytes = ['serotonin_nm', 'dopamine_nm', 'gaba_nm', 'ph_level'];

function generateMockReadings(count) {
  const readings = [];
  const baseTime = Date.now() - (count * 3600000); // Start from count hours ago
  
  for (let i = 0; i < count; i++) {
    readings.push({
      serotonin_nm: 100 + Math.random() * 100 + Math.sin(i / 10) * 20,
      dopamine_nm: 250 + Math.random() * 150 + Math.cos(i / 8) * 30,
      gaba_nm: 600 + Math.random() * 300 + Math.sin(i / 12) * 50,
      ph_level: 7.0 + Math.random() * 0.4,
      temperature_c: 36.5 + Math.random() * 1.0,
      calprotectin_ug_g: 20 + Math.random() * 25,
      timestamp_ms: baseTime + (i * 3600000),
    });
  }
  
  return readings;
}

function generateCSV(readings) {
  const headers = [
    'Timestamp',
    'Serotonin (nM)',
    'Dopamine (nM)',
    'GABA (nM)',
    'pH Level',
    'Temperature (°C)',
    'Calprotectin (µg/g)',
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
    ];
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

