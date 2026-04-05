// mobile-app/src/screens/HomeScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';

const HomeScreen = ({ navigation }) => {
  const { connectionStatus, batteryLevel } = useSelector((state) => state.device);
  const { currentReading, alerts } = useSelector((state) => state.sensor);
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  const isConnected = connectionStatus === 'connected';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Connection Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Symbion Connected' : 'Device Disconnected'}
            </Text>
          </View>
          {isConnected && batteryLevel !== null && (
            <Text style={styles.batteryText}>Battery: {batteryLevel}%</Text>
          )}
        </View>

        {/* Quick Stats */}
        {currentReading && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Current Readings</Text>
            <View style={styles.statsGrid}>
              <StatCard
                label="Serotonin"
                value={currentReading.serotonin_nm?.toFixed(1)}
                unit="nM"
                color="#8B5CF6"
              />
              <StatCard
                label="Dopamine"
                value={currentReading.dopamine_nm?.toFixed(1)}
                unit="nM"
                color="#EC4899"
              />
              <StatCard
                label="GABA"
                value={currentReading.gaba_nm?.toFixed(1)}
                unit="nM"
                color="#10B981"
              />
              <StatCard
                label="Gut pH"
                value={currentReading.ph_level?.toFixed(2)}
                unit=""
                color="#F59E0B"
              />
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.menuContainer}>
          <MenuButton
            title="Device Pairing"
            subtitle={isConnected ? 'Connected' : 'Tap to connect'}
            onPress={() => navigation.navigate('DevicePairing')}
            icon="📱"
          />
          <MenuButton
            title="Live Monitoring"
            subtitle="Real-time gut-brain data"
            onPress={() => navigation.navigate('LiveMonitoring')}
            icon="📊"
            disabled={!isConnected}
          />
          <MenuButton
            title="Historical Analysis"
            subtitle="Trends and patterns"
            onPress={() => navigation.navigate('HistoricalAnalysis')}
            icon="📈"
          />
          <MenuButton
            title="Settings"
            subtitle="Preferences and alerts"
            onPress={() => navigation.navigate('Settings')}
            icon="⚙️"
            badge={unreadAlerts > 0 ? unreadAlerts : null}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ label, value, unit, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>
      {value || '--'} <Text style={styles.statUnit}>{unit}</Text>
    </Text>
  </View>
);

const MenuButton = ({ title, subtitle, onPress, icon, disabled, badge }) => (
  <TouchableOpacity
    style={[styles.menuButton, disabled && styles.menuButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.menuIcon}>{icon}</Text>
    <View style={styles.menuTextContainer}>
      <Text style={[styles.menuTitle, disabled && styles.textDisabled]}>{title}</Text>
      <Text style={[styles.menuSubtitle, disabled && styles.textDisabled]}>{subtitle}</Text>
    </View>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#10B981',
  },
  disconnected: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },
  batteryText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
  },
  statsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 3,
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
  menuContainer: {
    gap: 12,
  },
  menuButton: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuButtonDisabled: {
    opacity: 0.5,
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  textDisabled: {
    color: '#475569',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeScreen;

