// src/services/analytics.service.js
// Machine Learning Analytics Service for Symbion platform

import { logger } from '../utils/logger.js';

/**
 * Calculate basic statistics for a dataset
 */
export function calculateStats(data) {
  if (!data || data.length === 0) return null;
  
  const sorted = [...data].sort((a, b) => a - b);
  const n = data.length;
  const sum = data.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;
  
  // Calculate variance and standard deviation
  const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / n;
  const stdDev = Math.sqrt(variance);
  
  // Calculate median
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
  
  // Calculate quartiles
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  
  return {
    count: n,
    mean,
    median,
    stdDev,
    variance,
    min: sorted[0],
    max: sorted[n - 1],
    q1,
    q3,
    iqr,
  };
}

/**
 * Detect anomalies using Z-score method
 * @param {Array} data - Time series data
 * @param {number} threshold - Z-score threshold (default: 2.5)
 */
export function detectAnomalies(data, threshold = 2.5) {
  const stats = calculateStats(data);
  if (!stats) return [];
  
  const anomalies = [];
  data.forEach((value, index) => {
    const zScore = Math.abs((value - stats.mean) / stats.stdDev);
    if (zScore > threshold) {
      anomalies.push({
        index,
        value,
        zScore: parseFloat(zScore.toFixed(2)),
        type: value > stats.mean ? 'high' : 'low',
        severity: zScore > threshold * 1.5 ? 'critical' : 'warning',
      });
    }
  });
  
  logger.info(`Detected ${anomalies.length} anomalies in ${data.length} data points`);
  return anomalies;
}

/**
 * Detect anomalies using Modified Z-score (MAD - Median Absolute Deviation)
 * More robust to outliers than standard Z-score
 */
export function detectAnomaliesMAD(data, threshold = 3.5) {
  if (!data || data.length === 0) return [];
  
  const sorted = [...data].sort((a, b) => a - b);
  const n = data.length;
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
  
  // Calculate MAD
  const absoluteDeviations = data.map(val => Math.abs(val - median));
  const sortedDeviations = absoluteDeviations.sort((a, b) => a - b);
  const mad = sortedDeviations[Math.floor(n / 2)];
  
  const anomalies = [];
  data.forEach((value, index) => {
    const modifiedZScore = 0.6745 * (value - median) / (mad || 1);
    if (Math.abs(modifiedZScore) > threshold) {
      anomalies.push({
        index,
        value,
        modifiedZScore: parseFloat(modifiedZScore.toFixed(2)),
        type: value > median ? 'high' : 'low',
        severity: Math.abs(modifiedZScore) > threshold * 1.3 ? 'critical' : 'warning',
      });
    }
  });
  
  return anomalies;
}

/**
 * Calculate moving average
 */
export function movingAverage(data, windowSize = 5) {
  if (data.length < windowSize) return data;
  
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, start + windowSize);
    const window = data.slice(start, end);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(parseFloat(avg.toFixed(2)));
  }
  
  return result;
}

/**
 * Calculate exponential moving average
 */
export function exponentialMovingAverage(data, alpha = 0.3) {
  if (data.length === 0) return [];
  
  const result = [data[0]];
  for (let i = 1; i < data.length; i++) {
    const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
    result.push(parseFloat(ema.toFixed(2)));
  }
  
  return result;
}

/**
 * Detect trend using linear regression
 */
export function detectTrend(data) {
  if (data.length < 2) return null;
  
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }
  
  // Calculate slope (m) and intercept (b) for y = mx + b
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const yPred = slope * i + intercept;
    ssRes += Math.pow(data[i] - yPred, 2);
    ssTot += Math.pow(data[i] - yMean, 2);
  }
  const rSquared = 1 - (ssRes / ssTot);
  
  // Classify trend
  let trendType = 'stable';
  if (Math.abs(slope) > 0.1) {
    if (rSquared > 0.5) {
      trendType = slope > 0 ? 'increasing' : 'decreasing';
    } else {
      trendType = 'variable';
    }
  }
  
  return {
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(2)),
    rSquared: parseFloat(rSquared.toFixed(3)),
    trendType,
    confidence: rSquared > 0.7 ? 'high' : rSquared > 0.4 ? 'medium' : 'low',
  };
}

/**
 * Calculate Pearson correlation coefficient
 */
export function calculateCorrelation(dataX, dataY) {
  if (dataX.length !== dataY.length || dataX.length === 0) return null;
  
  const n = dataX.length;
  const meanX = dataX.reduce((sum, val) => sum + val, 0) / n;
  const meanY = dataY.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = dataX[i] - meanX;
    const diffY = dataY[i] - meanY;
    numerator += diffX * diffY;
    sumSqX += diffX * diffX;
    sumSqY += diffY * diffY;
  }
  
  const denominator = Math.sqrt(sumSqX * sumSqY);
  if (denominator === 0) return 0;
  
  const correlation = numerator / denominator;
  
  return {
    coefficient: parseFloat(correlation.toFixed(3)),
    strength: Math.abs(correlation) > 0.7 ? 'strong' 
            : Math.abs(correlation) > 0.4 ? 'moderate' 
            : 'weak',
    direction: correlation > 0 ? 'positive' : 'negative',
  };
}

/**
 * Build correlation matrix for multiple analytes
 */
export function correlationMatrix(readings) {
  const analytes = ['serotonin_nm', 'dopamine_nm', 'gaba_nm', 'ph_level'];
  const matrix = {};
  
  analytes.forEach(analyte1 => {
    matrix[analyte1] = {};
    analytes.forEach(analyte2 => {
      if (analyte1 === analyte2) {
        matrix[analyte1][analyte2] = { coefficient: 1.0, strength: 'perfect', direction: 'positive' };
      } else {
        const data1 = readings.map(r => r[analyte1]);
        const data2 = readings.map(r => r[analyte2]);
        matrix[analyte1][analyte2] = calculateCorrelation(data1, data2);
      }
    });
  });
  
  return matrix;
}

/**
 * Simple forecasting using linear regression
 */
export function forecastValues(data, stepsAhead = 5) {
  const trend = detectTrend(data);
  if (!trend) return [];
  
  const n = data.length;
  const forecasts = [];
  
  for (let i = 1; i <= stepsAhead; i++) {
    const forecastValue = trend.slope * (n + i - 1) + trend.intercept;
    forecasts.push({
      step: i,
      value: parseFloat(Math.max(0, forecastValue).toFixed(2)), // Ensure non-negative
      confidence: trend.confidence,
    });
  }
  
  return forecasts;
}

/**
 * Seasonal decomposition (simple additive model)
 */
export function detectSeasonality(data, period = 24) {
  if (data.length < period * 2) return null;
  
  // Calculate seasonal indices
  const seasonalIndices = new Array(period).fill(0);
  const counts = new Array(period).fill(0);
  
  data.forEach((value, index) => {
    const seasonalIndex = index % period;
    seasonalIndices[seasonalIndex] += value;
    counts[seasonalIndex]++;
  });
  
  // Average seasonal indices
  const avgSeasonalIndices = seasonalIndices.map((sum, i) => 
    counts[i] > 0 ? sum / counts[i] : 0
  );
  
  // Calculate overall mean
  const overallMean = data.reduce((sum, val) => sum + val, 0) / data.length;
  
  // Normalize seasonal indices
  const normalizedIndices = avgSeasonalIndices.map(val => 
    parseFloat((val / overallMean).toFixed(3))
  );
  
  // Detect if seasonality exists (check variance)
  const seasonalVariance = calculateStats(normalizedIndices)?.stdDev || 0;
  
  return {
    period,
    indices: normalizedIndices,
    hasSeasonality: seasonalVariance > 0.1,
    strength: seasonalVariance > 0.3 ? 'strong' 
            : seasonalVariance > 0.1 ? 'moderate' 
            : 'weak',
  };
}

/**
 * Change point detection using CUSUM (Cumulative Sum)
 */
export function detectChangePoints(data, threshold = 5) {
  if (data.length < 10) return [];
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const stdDev = Math.sqrt(
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  );
  
  let cumSum = 0;
  const changePoints = [];
  
  data.forEach((value, index) => {
    cumSum += (value - mean) / stdDev;
    
    if (Math.abs(cumSum) > threshold) {
      changePoints.push({
        index,
        timestamp: index,
        cumSum: parseFloat(cumSum.toFixed(2)),
        type: cumSum > 0 ? 'increase' : 'decrease',
      });
      cumSum = 0; // Reset after detection
    }
  });
  
  logger.info(`Detected ${changePoints.length} change points`);
  return changePoints;
}

/**
 * Pattern recognition - find similar sequences
 */
export function findSimilarPatterns(data, patternLength = 10, threshold = 0.8) {
  if (data.length < patternLength * 2) return [];
  
  const patterns = [];
  
  for (let i = 0; i <= data.length - patternLength; i++) {
    const pattern = data.slice(i, i + patternLength);
    const patternStats = calculateStats(pattern);
    
    // Search for similar patterns
    for (let j = i + patternLength; j <= data.length - patternLength; j++) {
      const candidate = data.slice(j, j + patternLength);
      
      // Calculate similarity using normalized correlation
      const correlation = calculateCorrelation(pattern, candidate);
      
      if (correlation && Math.abs(correlation.coefficient) >= threshold) {
        patterns.push({
          originalIndex: i,
          matchIndex: j,
          correlation: correlation.coefficient,
          length: patternLength,
        });
      }
    }
  }
  
  return patterns;
}

/**
 * Health risk assessment based on biomarkers
 */
export function assessHealthRisk(readings, referenceRanges) {
  const risks = {
    serotonin: 'normal',
    dopamine: 'normal',
    gaba: 'normal',
    ph: 'normal',
    calprotectin: 'normal',
    overall: 'low',
  };
  
  let riskScore = 0;
  
  // Check each analyte
  const latestReading = readings[readings.length - 1];
  
  Object.keys(referenceRanges).forEach(analyte => {
    const value = latestReading[`${analyte}_nm`] || latestReading[analyte];
    const range = referenceRanges[analyte];
    
    if (!value || !range) return;
    
    if (value < range.min * 0.7) {
      risks[analyte] = 'critical_low';
      riskScore += 3;
    } else if (value < range.min) {
      risks[analyte] = 'low';
      riskScore += 2;
    } else if (value > range.max * 1.3) {
      risks[analyte] = 'critical_high';
      riskScore += 3;
    } else if (value > range.max) {
      risks[analyte] = 'high';
      riskScore += 2;
    } else if (value >= range.min * 0.9 && value <= range.max * 1.1) {
      risks[analyte] = 'optimal';
    }
  });
  
  // Overall risk assessment
  if (riskScore >= 6) {
    risks.overall = 'high';
    risks.recommendation = 'Consult healthcare provider immediately';
  } else if (riskScore >= 3) {
    risks.overall = 'moderate';
    risks.recommendation = 'Monitor closely and consider medical advice';
  } else if (riskScore > 0) {
    risks.overall = 'low';
    risks.recommendation = 'Continue monitoring';
  } else {
    risks.overall = 'minimal';
    risks.recommendation = 'Maintain current health practices';
  }
  
  risks.riskScore = riskScore;
  
  return risks;
}

/**
 * Generate personalized insights
 */
export function generateInsights(readings, historicalData = []) {
  const insights = [];
  
  if (readings.length < 10) {
    return [{
      type: 'info',
      message: 'Collect more data for personalized insights',
      confidence: 'low',
    }];
  }
  
  // Analyze trends
  ['serotonin_nm', 'dopamine_nm', 'gaba_nm'].forEach(analyte => {
    const data = readings.map(r => r[analyte]);
    const trend = detectTrend(data);
    
    if (trend && trend.confidence !== 'low') {
      if (trend.trendType === 'increasing') {
        insights.push({
          type: 'trend',
          analyte,
          message: `${analyte.replace('_nm', '')} levels are increasing`,
          confidence: trend.confidence,
          value: trend.slope,
        });
      } else if (trend.trendType === 'decreasing') {
        insights.push({
          type: 'trend',
          analyte,
          message: `${analyte.replace('_nm', '')} levels are decreasing`,
          confidence: trend.confidence,
          value: trend.slope,
        });
      }
    }
    
    // Detect anomalies
    const anomalies = detectAnomalies(data);
    if (anomalies.length > data.length * 0.1) {
      insights.push({
        type: 'anomaly',
        analyte,
        message: `Unusual variability detected in ${analyte.replace('_nm', '')}`,
        count: anomalies.length,
        confidence: 'medium',
      });
    }
  });
  
  return insights;
}

/**
 * Time series clustering (simple k-means for patterns)
 */
export function clusterReadings(readings, k = 3) {
  if (readings.length < k * 2) return null;
  
  // Extract features (mean values for each analyte)
  const features = readings.map(r => [
    r.serotonin_nm,
    r.dopamine_nm,
    r.gaba_nm,
    r.ph_level,
  ]);
  
  // Simple k-means implementation
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const randomIndex = Math.floor(Math.random() * features.length);
    centroids.push([...features[randomIndex]]);
  }
  
  let assignments = new Array(features.length).fill(0);
  let iterations = 0;
  const maxIterations = 10;
  
  while (iterations < maxIterations) {
    // Assign points to nearest centroid
    features.forEach((point, i) => {
      let minDist = Infinity;
      let closestCentroid = 0;
      
      centroids.forEach((centroid, j) => {
        const dist = euclideanDistance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = j;
        }
      });
      
      assignments[i] = closestCentroid;
    });
    
    // Update centroids
    const newCentroids = Array(k).fill(null).map(() => [0, 0, 0, 0]);
    const counts = new Array(k).fill(0);
    
    features.forEach((point, i) => {
      const cluster = assignments[i];
      point.forEach((val, j) => {
        newCentroids[cluster][j] += val;
      });
      counts[cluster]++;
    });
    
    newCentroids.forEach((centroid, i) => {
      if (counts[i] > 0) {
        centroid.forEach((val, j) => {
          newCentroids[i][j] = val / counts[i];
        });
      }
    });
    
    centroids = newCentroids;
    iterations++;
  }
  
  // Calculate cluster statistics
  const clusters = Array(k).fill(null).map(() => []);
  assignments.forEach((cluster, i) => {
    clusters[cluster].push(i);
  });
  
  return {
    centroids,
    assignments,
    clusterSizes: clusters.map(c => c.length),
    clusters,
  };
}

/**
 * Euclidean distance helper
 */
function euclideanDistance(point1, point2) {
  return Math.sqrt(
    point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
  );
}

export default {
  calculateStats,
  detectAnomalies,
  detectAnomaliesMAD,
  movingAverage,
  exponentialMovingAverage,
  detectTrend,
  calculateCorrelation,
  correlationMatrix,
  forecastValues,
  detectSeasonality,
  detectChangePoints,
  findSimilarPatterns,
  assessHealthRisk,
  generateInsights,
  clusterReadings,
};

