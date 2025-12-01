/**
 * @file analytics.test.js
 * @brief Unit tests for analytics service
 */

const analyticsService = require('../services/analytics.service');
const SensorData = require('../models/SensorData');
const mongoose = require('mongoose');

describe('Analytics Service', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/symbion_test');
  });

  afterAll(async () => {
    await SensorData.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await SensorData.deleteMany({});
  });

  describe('getSummary', () => {
    beforeEach(async () => {
      // Create test data
      const userId = new mongoose.Types.ObjectId();
      const deviceId = new mongoose.Types.ObjectId();
      const now = new Date();

      const readings = [];
      for (let i = 0; i < 10; i++) {
        readings.push({
          userId,
          deviceId,
          timestamp: new Date(now - i * 3600000), // 1 hour apart
          serotonin_nm: 1000 + i * 10,
          dopamine_nm: 500 + i * 5,
          gaba_nm: 2000 + i * 20,
          ph_level: 6.5 + i * 0.1,
          temperature_c: 37.0 + i * 0.1,
          calprotectin_ug_g: 50 + i * 2
        });
      }

      await SensorData.insertMany(readings);
    });

    it('should calculate summary statistics', async () => {
      const userId = (await SensorData.findOne()).userId;
      const summary = await analyticsService.getSummary(userId, '24h');

      expect(summary).toHaveProperty('serotonin');
      expect(summary.serotonin).toHaveProperty('mean');
      expect(summary.serotonin).toHaveProperty('min');
      expect(summary.serotonin).toHaveProperty('max');
      expect(summary.serotonin).toHaveProperty('stdDev');
      
      expect(summary.serotonin.mean).toBeGreaterThan(1000);
      expect(summary.serotonin.min).toBeGreaterThanOrEqual(1000);
      expect(summary.serotonin.max).toBeGreaterThanOrEqual(summary.serotonin.mean);
    });

    it('should handle empty data', async () => {
      const emptyUserId = new mongoose.Types.ObjectId();
      const summary = await analyticsService.getSummary(emptyUserId, '24h');

      expect(summary).toHaveProperty('serotonin');
      expect(summary.serotonin.mean).toBe(0);
    });
  });

  describe('getTrends', () => {
    beforeEach(async () => {
      const userId = new mongoose.Types.ObjectId();
      const deviceId = new mongoose.Types.ObjectId();
      const now = new Date();

      const readings = [];
      for (let i = 0; i < 20; i++) {
        readings.push({
          userId,
          deviceId,
          timestamp: new Date(now - i * 1800000), // 30 min apart
          serotonin_nm: 1000 + i * 5, // Upward trend
          dopamine_nm: 600 - i * 2,    // Downward trend
          gaba_nm: 2000,              // Stable
          ph_level: 6.5,
          temperature_c: 37.0,
          calprotectin_ug_g: 50
        });
      }

      await SensorData.insertMany(readings);
    });

    it('should detect upward trend', async () => {
      const userId = (await SensorData.findOne()).userId;
      const trends = await analyticsService.getTrends(userId, '24h');

      expect(trends).toHaveProperty('serotonin');
      expect(trends.serotonin.direction).toBe('increasing');
      expect(trends.serotonin.slope).toBeGreaterThan(0);
    });

    it('should detect downward trend', async () => {
      const userId = (await SensorData.findOne()).userId;
      const trends = await analyticsService.getTrends(userId, '24h');

      expect(trends).toHaveProperty('dopamine');
      expect(trends.dopamine.direction).toBe('decreasing');
      expect(trends.dopamine.slope).toBeLessThan(0);
    });

    it('should detect stable trend', async () => {
      const userId = (await SensorData.findOne()).userId;
      const trends = await analyticsService.getTrends(userId, '24h');

      expect(trends).toHaveProperty('gaba');
      expect(trends.gaba.direction).toBe('stable');
    });
  });

  describe('getCorrelations', () => {
    beforeEach(async () => {
      const userId = new mongoose.Types.ObjectId();
      const deviceId = new mongoose.Types.ObjectId();
      const now = new Date();

      const readings = [];
      for (let i = 0; i < 30; i++) {
        // Create correlated data: serotonin and dopamine move together
        const base = i * 10;
        readings.push({
          userId,
          deviceId,
          timestamp: new Date(now - i * 1800000),
          serotonin_nm: 1000 + base,
          dopamine_nm: 500 + base * 0.5, // Positively correlated
          gaba_nm: 2000 - base * 0.3,    // Negatively correlated with serotonin
          ph_level: 6.5,
          temperature_c: 37.0,
          calprotectin_ug_g: 50
        });
      }

      await SensorData.insertMany(readings);
    });

    it('should detect positive correlation', async () => {
      const userId = (await SensorData.findOne()).userId;
      const correlations = await analyticsService.getCorrelations(userId, '24h');

      const seroDopa = correlations.find(
        c => c.pair === 'serotonin-dopamine'
      );

      expect(seroDopa).toBeDefined();
      expect(seroDopa.coefficient).toBeGreaterThan(0.7);
      expect(seroDopa.strength).toBe('strong');
    });

    it('should detect negative correlation', async () => {
      const userId = (await SensorData.findOne()).userId;
      const correlations = await analyticsService.getCorrelations(userId, '24h');

      const seroGaba = correlations.find(
        c => c.pair === 'serotonin-gaba'
      );

      expect(seroGaba).toBeDefined();
      expect(seroGaba.coefficient).toBeLessThan(-0.5);
    });
  });

  describe('getAnomalies', () => {
    beforeEach(async () => {
      const userId = new mongoose.Types.ObjectId();
      const deviceId = new mongoose.Types.ObjectId();
      const now = new Date();

      const readings = [];
      
      // Normal readings
      for (let i = 0; i < 25; i++) {
        readings.push({
          userId,
          deviceId,
          timestamp: new Date(now - i * 1800000),
          serotonin_nm: 1000 + (Math.random() * 20 - 10), // Small variance
          dopamine_nm: 500,
          gaba_nm: 2000,
          ph_level: 6.5,
          temperature_c: 37.0,
          calprotectin_ug_g: 50
        });
      }

      // Add anomalies
      readings.push({
        userId,
        deviceId,
        timestamp: new Date(now - 26 * 1800000),
        serotonin_nm: 5000, // Anomaly: too high
        dopamine_nm: 500,
        gaba_nm: 2000,
        ph_level: 6.5,
        temperature_c: 37.0,
        calprotectin_ug_g: 50
      });

      readings.push({
        userId,
        deviceId,
        timestamp: new Date(now - 27 * 1800000),
        serotonin_nm: 100, // Anomaly: too low
        dopamine_nm: 500,
        gaba_nm: 2000,
        ph_level: 6.5,
        temperature_c: 37.0,
        calprotectin_ug_g: 50
      });

      await SensorData.insertMany(readings);
    });

    it('should detect high anomalies', async () => {
      const userId = (await SensorData.findOne()).userId;
      const anomalies = await analyticsService.getAnomalies(userId, '24h');

      const highAnomalies = anomalies.filter(
        a => a.analyte === 'serotonin' && a.severity === 'high'
      );

      expect(highAnomalies.length).toBeGreaterThan(0);
      expect(highAnomalies[0].value).toBeGreaterThan(3000);
    });

    it('should detect low anomalies', async () => {
      const userId = (await SensorData.findOne()).userId;
      const anomalies = await analyticsService.getAnomalies(userId, '24h');

      const lowAnomalies = anomalies.filter(
        a => a.analyte === 'serotonin' && a.severity === 'low'
      );

      expect(lowAnomalies.length).toBeGreaterThan(0);
      expect(lowAnomalies[0].value).toBeLessThan(500);
    });
  });

  describe('Time Period Parsing', () => {
    it('should handle various time period formats', async () => {
      const userId = new mongoose.Types.ObjectId();

      // These should not throw errors
      await expect(analyticsService.getSummary(userId, '24h')).resolves.toBeDefined();
      await expect(analyticsService.getSummary(userId, '7d')).resolves.toBeDefined();
      await expect(analyticsService.getSummary(userId, '30d')).resolves.toBeDefined();
    });
  });

  describe('Export Data', () => {
    beforeEach(async () => {
      const userId = new mongoose.Types.ObjectId();
      const deviceId = new mongoose.Types.ObjectId();

      await SensorData.create({
        userId,
        deviceId,
        timestamp: new Date(),
        serotonin_nm: 1000,
        dopamine_nm: 500,
        gaba_nm: 2000,
        ph_level: 6.5,
        temperature_c: 37.0,
        calprotectin_ug_g: 50
      });
    });

    it('should export data in CSV format', async () => {
      const userId = (await SensorData.findOne()).userId;
      const csv = await analyticsService.exportData(userId, '24h', 'csv');

      expect(csv).toContain('timestamp');
      expect(csv).toContain('serotonin_nm');
      expect(csv).toContain('dopamine_nm');
    });

    it('should export data in JSON format', async () => {
      const userId = (await SensorData.findOne()).userId;
      const json = await analyticsService.exportData(userId, '24h', 'json');

      const data = JSON.parse(json);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty('serotonin_nm');
    });
  });
});

