// mobile-app/src/screens/SettingsScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  setDarkMode,
  setNotifications,
  updateAlertThresholds,
} from '../redux/slices/userSlice';
import { clearHistory, clearAlerts } from '../redux/slices/sensorSlice';
import { disconnectDevice } from '../redux/slices/deviceSlice';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { preferences } = useSelector((state) => state.user);
  const { connectedDevice, firmwareVersion } = useSelector((state) => state.device);
  const { readingHistory, alerts } = useSelector((state) => state.sensor);

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all sensor history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            dispatch(clearHistory());
            dispatch(clearAlerts());
          },
        },
      ]
    );
  };

  const handleDisconnect = () => {
    Alert.alert('Disconnect', 'Disconnect from device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: () => dispatch(disconnectDevice()),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Device Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Connected Device</Text>
              <Text style={styles.value}>
                {connectedDevice?.name || 'Not connected'}
              </Text>
            </View>
            {firmwareVersion && (
              <View style={styles.row}>
                <Text style={styles.label}>Firmware</Text>
                <Text style={styles.value}>{firmwareVersion}</Text>
              </View>
            )}
            {connectedDevice && (
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleDisconnect}
              >
                <Text style={styles.dangerButtonText}>Disconnect Device</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.label}>Push Notifications</Text>
                <Text style={styles.sublabel}>Receive alerts for anomalies</Text>
              </View>
              <Switch
                value={preferences.notifications}
                onValueChange={(value) => dispatch(setNotifications(value))}
                trackColor={{ false: '#475569', true: '#8B5CF6' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.label}>Dark Mode</Text>
                <Text style={styles.sublabel}>Use dark theme</Text>
              </View>
              <Switch
                value={preferences.darkMode}
                onValueChange={(value) => dispatch(setDarkMode(value))}
                trackColor={{ false: '#475569', true: '#8B5CF6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Alert Thresholds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Thresholds</Text>
          <View style={styles.card}>
            <ThresholdRow
              label="Serotonin"
              low={preferences.alertThresholds.serotoninLow}
              high={preferences.alertThresholds.serotoninHigh}
              unit="nM"
            />
            <View style={styles.divider} />
            <ThresholdRow
              label="Dopamine"
              low={preferences.alertThresholds.dopamineLow}
              high={preferences.alertThresholds.dopamineHigh}
              unit="nM"
            />
            <View style={styles.divider} />
            <ThresholdRow
              label="GABA"
              low={preferences.alertThresholds.gabaLow}
              high={preferences.alertThresholds.gabaHigh}
              unit="nM"
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Stored Readings</Text>
              <Text style={styles.value}>{readingHistory.length}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Active Alerts</Text>
              <Text style={styles.value}>{alerts.length}</Text>
            </View>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearData}
            >
              <Text style={styles.dangerButtonText}>Clear All Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>App Version</Text>
              <Text style={styles.value}>1.0.0</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Build</Text>
              <Text style={styles.value}>2024.12.1</Text>
            </View>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Open Source Licenses</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ThresholdRow = ({ label, low, high, unit }) => (
  <View style={styles.thresholdRow}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.thresholdValues}>
      <Text style={styles.thresholdValue}>
        Low: {low} {unit}
      </Text>
      <Text style={styles.thresholdDivider}>|</Text>
      <Text style={styles.thresholdValue}>
        High: {high} {unit}
      </Text>
    </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 15,
  },
  sublabel: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  value: {
    color: '#94A3B8',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 8,
  },
  thresholdRow: {
    paddingVertical: 8,
  },
  thresholdValues: {
    flexDirection: 'row',
    marginTop: 4,
  },
  thresholdValue: {
    color: '#64748B',
    fontSize: 13,
  },
  thresholdDivider: {
    color: '#475569',
    marginHorizontal: 12,
  },
  dangerButton: {
    backgroundColor: '#7F1D1D',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FCA5A5',
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkText: {
    color: '#8B5CF6',
    fontSize: 15,
  },
});

export default SettingsScreen;

