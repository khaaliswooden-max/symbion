// mobile-app/src/screens/LiveMonitoringScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  setMonitoring,
  updateCurrentReading,
  addToHistory,
} from '../redux/slices/sensorSlice';
import BLEService from '../services/BLEService';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;
const CHART_HEIGHT = 120;

const LiveMonitoringScreen = () => {
  const dispatch = useDispatch();
  const { isMonitoring, currentReading, readingHistory, referenceRanges } =
    useSelector((state) => state.sensor);
  const { connectionStatus } = useSelector((state) => state.device);

  const [selectedAnalyte, setSelectedAnalyte] = useState('serotonin');

  useEffect(() => {
    if (connectionStatus === 'connected') {
      // Set up data listener
      BLEService.onDataReceived((data) => {
        dispatch(updateCurrentReading(data));
        dispatch(addToHistory(data));
      });
    }

    return () => {
      // Cleanup
      if (isMonitoring) {
        BLEService.stopMonitoring();
        dispatch(setMonitoring(false));
      }
    };
  }, [connectionStatus, dispatch, isMonitoring]);

  const toggleMonitoring = async () => {
    if (isMonitoring) {
      await BLEService.stopMonitoring();
      dispatch(setMonitoring(false));
    } else {
      await BLEService.startMonitoring();
      dispatch(setMonitoring(true));
    }
  };

  const getAnalyteValue = useCallback((reading, analyte) => {
    if (!reading) return null;
    switch (analyte) {
      case 'serotonin': return reading.serotonin_nm;
      case 'dopamine': return reading.dopamine_nm;
      case 'gaba': return reading.gaba_nm;
      case 'ph': return reading.ph_level;
      default: return null;
    }
  }, []);

  const getStatusColor = (value, analyte) => {
    if (!value || !referenceRanges[analyte]) return '#64748B';
    const { min, max } = referenceRanges[analyte];
    if (value < min) return '#F59E0B'; // Low
    if (value > max) return '#EF4444'; // High
    return '#10B981'; // Normal
  };

  const renderMiniChart = (analyte) => {
    const data = readingHistory.slice(-50).map((r) => getAnalyteValue(r, analyte));
    if (data.length < 2) return null;

    const max = Math.max(...data.filter(Boolean));
    const min = Math.min(...data.filter(Boolean));
    const range = max - min || 1;

    const points = data
      .map((val, i) => {
        if (val === null) return null;
        const x = (i / (data.length - 1)) * CHART_WIDTH;
        const y = CHART_HEIGHT - ((val - min) / range) * CHART_HEIGHT;
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartSvg}>
          {/* Simple line visualization using views */}
          {data.slice(0, -1).map((val, i) => {
            if (val === null || data[i + 1] === null) return null;
            const x1 = (i / (data.length - 1)) * CHART_WIDTH;
            const y1 = CHART_HEIGHT - ((val - min) / range) * (CHART_HEIGHT - 20);
            const x2 = ((i + 1) / (data.length - 1)) * CHART_WIDTH;
            const y2 = CHART_HEIGHT - ((data[i + 1] - min) / range) * (CHART_HEIGHT - 20);
            
            return (
              <View
                key={i}
                style={[
                  styles.chartLine,
                  {
                    left: x1,
                    top: y1,
                    width: Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
                    transform: [
                      { rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>{max.toFixed(1)}</Text>
          <Text style={styles.chartLabel}>{min.toFixed(1)}</Text>
        </View>
      </View>
    );
  };

  const analytes = [
    { key: 'serotonin', label: 'Serotonin', unit: 'nM', color: '#8B5CF6' },
    { key: 'dopamine', label: 'Dopamine', unit: 'nM', color: '#EC4899' },
    { key: 'gaba', label: 'GABA', unit: 'nM', color: '#10B981' },
    { key: 'ph', label: 'Gut pH', unit: '', color: '#F59E0B' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Control Section */}
        <View style={styles.controlSection}>
          <TouchableOpacity
            style={[styles.controlButton, isMonitoring && styles.controlButtonActive]}
            onPress={toggleMonitoring}
            disabled={connectionStatus !== 'connected'}
          >
            <Text style={styles.controlButtonText}>
              {isMonitoring ? '⏹ Stop Monitoring' : '▶ Start Monitoring'}
            </Text>
          </TouchableOpacity>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, isMonitoring && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {isMonitoring ? 'Live' : 'Paused'}
            </Text>
          </View>
        </View>

        {/* Analyte Cards */}
        {analytes.map((analyte) => {
          const value = getAnalyteValue(currentReading, analyte.key);
          const statusColor = getStatusColor(value, analyte.key);
          const isSelected = selectedAnalyte === analyte.key;

          return (
            <TouchableOpacity
              key={analyte.key}
              style={[
                styles.analyteCard,
                isSelected && styles.analyteCardSelected,
                { borderLeftColor: analyte.color },
              ]}
              onPress={() => setSelectedAnalyte(analyte.key)}
            >
              <View style={styles.analyteHeader}>
                <Text style={styles.analyteLabel}>{analyte.label}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusBadgeText}>
                    {value < referenceRanges[analyte.key]?.min
                      ? 'LOW'
                      : value > referenceRanges[analyte.key]?.max
                      ? 'HIGH'
                      : 'NORMAL'}
                  </Text>
                </View>
              </View>
              <View style={styles.analyteValueRow}>
                <Text style={styles.analyteValue}>
                  {value?.toFixed(analyte.key === 'ph' ? 2 : 1) || '--'}
                </Text>
                <Text style={styles.analyteUnit}>{analyte.unit}</Text>
              </View>
              {isSelected && renderMiniChart(analyte.key)}
            </TouchableOpacity>
          );
        })}

        {/* Additional Metrics */}
        {currentReading && (
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Temperature</Text>
              <Text style={styles.metricValue}>
                {currentReading.temperature_c?.toFixed(1)}°C
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Calprotectin</Text>
              <Text style={styles.metricValue}>
                {currentReading.calprotectin_ug_g?.toFixed(1)} µg/g
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
  },
  controlSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  controlButtonActive: {
    backgroundColor: '#EF4444',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#64748B',
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  analyteCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  analyteCardSelected: {
    borderWidth: 1,
    borderColor: '#475569',
  },
  analyteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyteLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  analyteValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  analyteValue: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: '700',
  },
  analyteUnit: {
    color: '#64748B',
    fontSize: 16,
    marginLeft: 8,
  },
  chartContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  chartSvg: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    position: 'relative',
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#8B5CF6',
    transformOrigin: 'left center',
  },
  chartLabels: {
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  chartLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default LiveMonitoringScreen;

