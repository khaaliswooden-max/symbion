// mobile-app/src/screens/DevicePairingScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  setScanning,
  addDiscoveredDevice,
  clearDiscoveredDevices,
  setConnectedDevice,
  setConnectionStatus,
  disconnectDevice,
} from '../redux/slices/deviceSlice';
import BLEService from '../services/BLEService';

const DevicePairingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isScanning, availableDevices, connectedDevice, connectionStatus } =
    useSelector((state) => state.device);
  const [connectingId, setConnectingId] = useState(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop scanning when leaving screen
      BLEService.stopScan();
      dispatch(setScanning(false));
    };
  }, [dispatch]);

  const startScan = async () => {
    dispatch(clearDiscoveredDevices());
    dispatch(setScanning(true));

    try {
      await BLEService.startScan((device) => {
        if (device.name && device.name.includes('Symbion')) {
          dispatch(addDiscoveredDevice({
            id: device.id,
            name: device.name,
            rssi: device.rssi,
          }));
        }
      });

      // Stop after 10 seconds
      setTimeout(() => {
        BLEService.stopScan();
        dispatch(setScanning(false));
      }, 10000);
    } catch (error) {
      Alert.alert('Scan Error', error.message);
      dispatch(setScanning(false));
    }
  };

  const connectToDevice = async (device) => {
    setConnectingId(device.id);
    dispatch(setConnectionStatus('connecting'));

    try {
      const connected = await BLEService.connect(device.id);
      if (connected) {
        dispatch(setConnectedDevice(device));
        Alert.alert('Connected', `Successfully connected to ${device.name}`);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Connection Failed', error.message);
      dispatch(setConnectionStatus('disconnected'));
    } finally {
      setConnectingId(null);
    }
  };

  const disconnect = async () => {
    try {
      await BLEService.disconnect();
      dispatch(disconnectDevice());
      Alert.alert('Disconnected', 'Device has been disconnected');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderDevice = ({ item }) => {
    const isConnecting = connectingId === item.id;
    const isCurrentDevice = connectedDevice?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.deviceCard, isCurrentDevice && styles.deviceCardConnected]}
        onPress={() => connectToDevice(item)}
        disabled={isConnecting || isCurrentDevice}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceId}>{item.id}</Text>
          <View style={styles.signalContainer}>
            <SignalStrength rssi={item.rssi} />
            <Text style={styles.rssiText}>{item.rssi} dBm</Text>
          </View>
        </View>
        {isConnecting ? (
          <ActivityIndicator color="#8B5CF6" />
        ) : isCurrentDevice ? (
          <Text style={styles.connectedLabel}>Connected</Text>
        ) : (
          <Text style={styles.connectLabel}>Connect</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Connected Device */}
      {connectedDevice && (
        <View style={styles.connectedSection}>
          <Text style={styles.sectionTitle}>Connected Device</Text>
          <View style={styles.connectedCard}>
            <View>
              <Text style={styles.connectedName}>{connectedDevice.name}</Text>
              <Text style={styles.connectedStatus}>
                Status: {connectionStatus}
              </Text>
            </View>
            <TouchableOpacity style={styles.disconnectBtn} onPress={disconnect}>
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Scan Section */}
      <View style={styles.scanSection}>
        <Text style={styles.sectionTitle}>Available Devices</Text>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}
          onPress={startScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.scanButtonText}>Scanning...</Text>
            </>
          ) : (
            <Text style={styles.scanButtonText}>Scan for Devices</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Device List */}
      <FlatList
        data={availableDevices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isScanning
                ? 'Searching for Symbion devices...'
                : 'No devices found. Tap "Scan" to search.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const SignalStrength = ({ rssi }) => {
  const bars = rssi > -60 ? 4 : rssi > -70 ? 3 : rssi > -80 ? 2 : 1;
  return (
    <View style={styles.signalBars}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.signalBar,
            { height: 4 + i * 3 },
            i <= bars ? styles.signalBarActive : styles.signalBarInactive,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  connectedSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  connectedCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  connectedName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  connectedStatus: {
    color: '#10B981',
    fontSize: 13,
    marginTop: 4,
  },
  disconnectBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scanSection: {
    padding: 16,
  },
  scanButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scanButtonActive: {
    backgroundColor: '#6D28D9',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  deviceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceCardConnected: {
    borderWidth: 1,
    borderColor: '#10B981',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceId: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginRight: 8,
  },
  signalBar: {
    width: 4,
    borderRadius: 1,
  },
  signalBarActive: {
    backgroundColor: '#10B981',
  },
  signalBarInactive: {
    backgroundColor: '#475569',
  },
  rssiText: {
    color: '#64748B',
    fontSize: 12,
  },
  connectLabel: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  connectedLabel: {
    color: '#10B981',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default DevicePairingScreen;

