import * as analyticsService from '../services/analytics.service.js';

describe('Analytics Service - Unit Tests', () => {
  describe('calculateStats', () => {
    it('should calculate basic statistics correctly', () => {
      const data = [10, 20, 30, 40, 50];
      const stats = analyticsService.calculateStats(data);

      expect(stats.count).toBe(5);
      expect(stats.mean).toBe(30);
      expect(stats.median).toBe(30);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(50);
      expect(stats.stdDev).toBeGreaterThan(0);
    });

    it('should return null for empty data', () => {
      expect(analyticsService.calculateStats([])).toBeNull();
      expect(analyticsService.calculateStats(null)).toBeNull();
    });

    it('should handle single value', () => {
      const stats = analyticsService.calculateStats([42]);
      expect(stats.count).toBe(1);
      expect(stats.mean).toBe(42);
      expect(stats.median).toBe(42);
      expect(stats.stdDev).toBe(0);
    });
  });

  describe('detectAnomalies', () => {
    it('should detect outliers using z-score', () => {
      // 20 normal values plus 2 outliers
      const data = Array(20).fill(100).concat([500, -200]);
      const anomalies = analyticsService.detectAnomalies(data, 2.0);

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies.some(a => a.type === 'high')).toBe(true);
      expect(anomalies.some(a => a.type === 'low')).toBe(true);
    });

    it('should return empty for uniform data', () => {
      const data = Array(50).fill(100);
      const anomalies = analyticsService.detectAnomalies(data);
      expect(anomalies.length).toBe(0);
    });
  });

  describe('detectAnomaliesMAD', () => {
    it('should detect outliers using MAD method', () => {
      const data = Array(20).fill(100).concat([1000]);
      const anomalies = analyticsService.detectAnomaliesMAD(data);
      expect(anomalies.length).toBeGreaterThan(0);
    });
  });

  describe('detectTrend', () => {
    it('should detect increasing trend', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const trend = analyticsService.detectTrend(data);

      expect(trend.trendType).toBe('increasing');
      expect(trend.slope).toBeGreaterThan(0);
      expect(trend.rSquared).toBeGreaterThan(0.9);
    });

    it('should detect decreasing trend', () => {
      const data = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
      const trend = analyticsService.detectTrend(data);

      expect(trend.trendType).toBe('decreasing');
      expect(trend.slope).toBeLessThan(0);
    });

    it('should detect stable trend', () => {
      const data = Array(20).fill(100);
      const trend = analyticsService.detectTrend(data);

      expect(trend.trendType).toBe('stable');
    });

    it('should return null for insufficient data', () => {
      expect(analyticsService.detectTrend([1])).toBeNull();
    });
  });

  describe('calculateCorrelation', () => {
    it('should detect perfect positive correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      const corr = analyticsService.calculateCorrelation(x, y);

      expect(corr.coefficient).toBeCloseTo(1.0, 2);
      expect(corr.strength).toBe('strong');
      expect(corr.direction).toBe('positive');
    });

    it('should detect perfect negative correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [10, 8, 6, 4, 2];
      const corr = analyticsService.calculateCorrelation(x, y);

      expect(corr.coefficient).toBeCloseTo(-1.0, 2);
      expect(corr.direction).toBe('negative');
    });
  });

  describe('correlationMatrix', () => {
    it('should build correlation matrix for readings', () => {
      const readings = Array.from({ length: 20 }, (_, i) => ({
        serotonin_nm: 100 + i * 10,
        dopamine_nm: 200 + i * 5,
        gaba_nm: 500 - i * 3,
        ph_level: 7.0 + i * 0.01,
      }));

      const matrix = analyticsService.correlationMatrix(readings);

      expect(matrix.serotonin_nm.serotonin_nm.coefficient).toBe(1.0);
      expect(matrix.serotonin_nm.dopamine_nm.coefficient).toBeGreaterThan(0.9);
      expect(matrix.serotonin_nm.gaba_nm.coefficient).toBeLessThan(-0.9);
    });
  });

  describe('movingAverage', () => {
    it('should smooth data', () => {
      const data = [1, 10, 1, 10, 1, 10, 1, 10];
      const smoothed = analyticsService.movingAverage(data, 3);

      expect(smoothed.length).toBe(data.length);
      // Smoothed values should have less variance
      const originalVar = analyticsService.calculateStats(data).variance;
      const smoothedVar = analyticsService.calculateStats(smoothed).variance;
      expect(smoothedVar).toBeLessThan(originalVar);
    });
  });

  describe('forecastValues', () => {
    it('should forecast future values', () => {
      const data = [1, 2, 3, 4, 5];
      const forecast = analyticsService.forecastValues(data, 3);

      expect(forecast.length).toBe(3);
      expect(forecast[0].value).toBeGreaterThan(5);
      expect(forecast[1].value).toBeGreaterThan(forecast[0].value);
    });
  });

  describe('detectSeasonality', () => {
    it('should detect seasonal patterns', () => {
      // Create sinusoidal data with period 24
      const data = Array.from({ length: 100 }, (_, i) =>
        100 + 30 * Math.sin(2 * Math.PI * i / 24)
      );
      const result = analyticsService.detectSeasonality(data, 24);

      expect(result).not.toBeNull();
      expect(result.period).toBe(24);
    });

    it('should return null for insufficient data', () => {
      const result = analyticsService.detectSeasonality([1, 2, 3], 24);
      expect(result).toBeNull();
    });
  });

  describe('detectChangePoints', () => {
    it('should detect change points', () => {
      const data = [
        ...Array(20).fill(100),
        ...Array(20).fill(200),
      ];
      const changePoints = analyticsService.detectChangePoints(data, 3);

      expect(changePoints.length).toBeGreaterThan(0);
    });
  });

  describe('assessHealthRisk', () => {
    it('should assess low risk for normal values', () => {
      const readings = [{
        serotonin_nm: 100,
        dopamine_nm: 200,
        gaba_nm: 500,
        ph_level: 7.0,
        calprotectin_ug_g: 25,
      }];
      const ranges = {
        serotonin: { min: 50, max: 200 },
        dopamine: { min: 100, max: 500 },
        gaba: { min: 200, max: 1000 },
        ph_level: { min: 6.5, max: 7.5 },
        calprotectin: { min: 0, max: 50 },
      };

      const risk = analyticsService.assessHealthRisk(readings, ranges);
      expect(risk.overall).toBe('minimal');
    });

    it('should assess high risk for abnormal values', () => {
      const readings = [{
        serotonin_nm: 10,
        dopamine_nm: 20,
        gaba_nm: 50,
        ph_level: 5.0,
      }];
      const ranges = {
        serotonin: { min: 50, max: 200 },
        dopamine: { min: 100, max: 500 },
        gaba: { min: 200, max: 1000 },
      };

      const risk = analyticsService.assessHealthRisk(readings, ranges);
      expect(risk.overall).toBe('high');
    });
  });

  describe('generateInsights', () => {
    it('should generate insights for trending data', () => {
      const readings = Array.from({ length: 20 }, (_, i) => ({
        serotonin_nm: 100 + i * 10,
        dopamine_nm: 300,
        gaba_nm: 600,
      }));

      const insights = analyticsService.generateInsights(readings);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights.some(i => i.type === 'trend')).toBe(true);
    });

    it('should request more data when insufficient', () => {
      const insights = analyticsService.generateInsights([{ serotonin_nm: 100 }]);
      expect(insights[0].type).toBe('info');
    });
  });

  describe('clusterReadings', () => {
    it('should cluster readings into groups', () => {
      const readings = [
        ...Array(10).fill({ serotonin_nm: 100, dopamine_nm: 200, gaba_nm: 500, ph_level: 7.0 }),
        ...Array(10).fill({ serotonin_nm: 800, dopamine_nm: 900, gaba_nm: 300, ph_level: 6.0 }),
      ];

      const result = analyticsService.clusterReadings(readings, 2);
      expect(result).not.toBeNull();
      expect(result.centroids.length).toBe(2);
      expect(result.clusterSizes.length).toBe(2);
    });

    it('should return null for insufficient data', () => {
      const result = analyticsService.clusterReadings([{ serotonin_nm: 100, dopamine_nm: 200, gaba_nm: 500, ph_level: 7.0 }], 3);
      expect(result).toBeNull();
    });
  });
});
