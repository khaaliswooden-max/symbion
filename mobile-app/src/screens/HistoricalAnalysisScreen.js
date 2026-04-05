// mobile-app/src/screens/HistoricalAnalysisScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const TIME_RANGES = [
  { key: '1h', label: '1H', hours: 1 },
  { key: '6h', label: '6H', hours: 6 },
  { key: '24h', label: '24H', hours: 24 },
  { key: '7d', label: '7D', hours: 168 },
  { key: '30d', label: '30D', hours: 720 },
];

const HistoricalAnalysisScreen = () => {
  const { readingHistory, referenceRanges } = useSelector((state) => state.sensor);
  const [selectedRange, setSelectedRange] = useState('24h');
  const [selectedAnalyte, setSelectedAnalyte] = useState('serotonin');

  const filterDataByRange = (range) => {
    const hours = TIME_RANGES.find((r) => r.key === range)?.hours || 24;
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return readingHistory.filter((r) => r.timestamp_ms > cutoff);
  };

  const calculateStats = (data, analyte) => {
    const values = data
      .map((r) => {
        switch (analyte) {
          case 'serotonin': return r.serotonin_nm;
          case 'dopamine': return r.dopamine_nm;
          case 'gaba': return r.gaba_nm;
          case 'ph': return r.ph_level;
          default: return null;
        }
      })
      .filter((v) => v !== null);

    if (values.length === 0) {
      return { avg: null, min: null, max: null, stdDev: null, trend: null };
    }

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Calculate trend (linear regression slope)
    let trend = null;
    if (values.length > 1) {
      const n = values.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
      const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
      trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }

    return { avg, min, max, stdDev, trend };
  };

  const filteredData = filterDataByRange(selectedRange);
  const stats = calculateStats(filteredData, selectedAnalyte);

  const analytes = [
    { key: 'serotonin', label: 'Serotonin', color: '#8B5CF6', unit: 'nM' },
    { key: 'dopamine', label: 'Dopamine', color: '#EC4899', unit: 'nM' },
    { key: 'gaba', label: 'GABA', color: '#10B981', unit: 'nM' },
    { key: 'ph', label: 'pH', color: '#F59E0B', unit: '' },
  ];

  const selectedAnalyteInfo = analytes.find((a) => a.key === selectedAnalyte);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Time Range Selector */}
        <View style={styles.rangeSelector}>
          {TIME_RANGES.map((range) => (
            <TouchableOpacity
              key={range.key}
              style={[
                styles.rangeButton,
                selectedRange === range.key && styles.rangeButtonActive,
              ]}
              onPress={() => setSelectedRange(range.key)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  selectedRange === range.key && styles.rangeButtonTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Analyte Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.analyteSelector}
        >
          {analytes.map((analyte) => (
            <TouchableOpacity
              key={analyte.key}
              style={[
                styles.analyteTab,
                selectedAnalyte === analyte.key && {
                  backgroundColor: analyte.color,
                },
              ]}
              onPress={() => setSelectedAnalyte(analyte.key)}
            >
              <Text
                style={[
                  styles.analyteTabText,
                  selectedAnalyte === analyte.key && styles.analyteTabTextActive,
                ]}
              >
                {analyte.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              label="Average"
              value={stats.avg?.toFixed(1)}
              unit={selectedAnalyteInfo?.unit}
              color={selectedAnalyteInfo?.color}
            />
            <StatCard
              label="Std Dev"
              value={stats.stdDev?.toFixed(2)}
              unit={selectedAnalyteInfo?.unit}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Minimum"
              value={stats.min?.toFixed(1)}
              unit={selectedAnalyteInfo?.unit}
            />
            <StatCard
              label="Maximum"
              value={stats.max?.toFixed(1)}
              unit={selectedAnalyteInfo?.unit}
            />
          </View>
        </View>

        {/* Trend Indicator */}
        <View style={styles.trendCard}>
          <Text style={styles.trendLabel}>Trend</Text>
          <View style={styles.trendContent}>
            <Text
              style={[
                styles.trendArrow,
                {
                  color:
                    stats.trend > 0.1
                      ? '#10B981'
                      : stats.trend < -0.1
                      ? '#EF4444'
                      : '#64748B',
                },
              ]}
            >
              {stats.trend > 0.1 ? '↑' : stats.trend < -0.1 ? '↓' : '→'}
            </Text>
            <Text style={styles.trendText}>
              {stats.trend === null
                ? 'Insufficient data'
                : stats.trend > 0.1
                ? 'Increasing'
                : stats.trend < -0.1
                ? 'Decreasing'
                : 'Stable'}
            </Text>
          </View>
        </View>

        {/* Reference Range */}
        {referenceRanges[selectedAnalyte] && (
          <View style={styles.referenceCard}>
            <Text style={styles.referenceTitle}>Reference Range</Text>
            <View style={styles.referenceBar}>
              <View style={styles.referenceTrack}>
                <View
                  style={[
                    styles.referenceNormal,
                    { backgroundColor: selectedAnalyteInfo?.color },
                  ]}
                />
              </View>
              <View style={styles.referenceLabels}>
                <Text style={styles.referenceValue}>
                  {referenceRanges[selectedAnalyte].min}
                </Text>
                <Text style={styles.referenceLabel}>Normal Range</Text>
                <Text style={styles.referenceValue}>
                  {referenceRanges[selectedAnalyte].max}
                </Text>
              </View>
            </View>
            {stats.avg !== null && (
              <Text style={styles.currentPosition}>
                Current average:{' '}
                <Text style={{ fontWeight: '700' }}>
                  {stats.avg.toFixed(1)} {selectedAnalyteInfo?.unit}
                </Text>
                {' - '}
                {stats.avg < referenceRanges[selectedAnalyte].min
                  ? 'Below normal'
                  : stats.avg > referenceRanges[selectedAnalyte].max
                  ? 'Above normal'
                  : 'Within normal range'}
              </Text>
            )}
          </View>
        )}

        {/* Data Points Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            📊 {filteredData.length} data points in selected range
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ label, value, unit, color }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, color && { color }]}>
      {value || '--'}
      {unit && <Text style={styles.statUnit}> {unit}</Text>}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  rangeButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  rangeButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  rangeButtonTextActive: {
    color: '#FFFFFF',
  },
  analyteSelector: {
    marginBottom: 20,
  },
  analyteTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    marginRight: 8,
  },
  analyteTabText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  analyteTabTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 14,
    color: '#64748B',
  },
  trendCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  trendLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 8,
  },
  trendContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendArrow: {
    fontSize: 32,
    marginRight: 12,
  },
  trendText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },
  referenceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  referenceTitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
  },
  referenceBar: {
    marginBottom: 12,
  },
  referenceTrack: {
    height: 8,
    backgroundColor: '#475569',
    borderRadius: 4,
    overflow: 'hidden',
  },
  referenceNormal: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    height: '100%',
    opacity: 0.6,
  },
  referenceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  referenceValue: {
    color: '#64748B',
    fontSize: 12,
  },
  referenceLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  currentPosition: {
    color: '#94A3B8',
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    color: '#64748B',
    fontSize: 14,
  },
});

export default HistoricalAnalysisScreen;

