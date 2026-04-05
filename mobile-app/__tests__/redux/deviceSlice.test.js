/**
 * @file deviceSlice.test.js
 * @brief Unit tests for device Redux slice
 */

import deviceReducer, {
  setScanning,
  addDiscoveredDevice,
  clearDiscoveredDevices,
  setConnectedDevice,
  setDisconnected,
  updateConnectionStatus,
  setBatteryLevel
} from '../../src/redux/slices/deviceSlice';

describe('deviceSlice', () => {
  const initialState = {
    scanning: false,
    discoveredDevices: [],
    connectedDevice: null,
    connectionStatus: 'disconnected',
    batteryLevel: null,
    lastSyncTime: null
  };

  it('should return initial state', () => {
    expect(deviceReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setScanning', () => {
    it('should set scanning to true', () => {
      const state = deviceReducer(initialState, setScanning(true));
      expect(state.scanning).toBe(true);
    });

    it('should set scanning to false', () => {
      const state = deviceReducer({ ...initialState, scanning: true }, setScanning(false));
      expect(state.scanning).toBe(false);
    });
  });

  describe('addDiscoveredDevice', () => {
    it('should add a new device', () => {
      const device = { id: 'device-1', name: 'Symbion-ABC', rssi: -50 };
      const state = deviceReducer(initialState, addDiscoveredDevice(device));
      
      expect(state.discoveredDevices).toHaveLength(1);
      expect(state.discoveredDevices[0]).toEqual(device);
    });

    it('should not add duplicate devices', () => {
      const device = { id: 'device-1', name: 'Symbion-ABC', rssi: -50 };
      let state = deviceReducer(initialState, addDiscoveredDevice(device));
      state = deviceReducer(state, addDiscoveredDevice(device));
      
      expect(state.discoveredDevices).toHaveLength(1);
    });

    it('should update existing device RSSI', () => {
      const device1 = { id: 'device-1', name: 'Symbion-ABC', rssi: -50 };
      const device2 = { id: 'device-1', name: 'Symbion-ABC', rssi: -45 };
      
      let state = deviceReducer(initialState, addDiscoveredDevice(device1));
      state = deviceReducer(state, addDiscoveredDevice(device2));
      
      expect(state.discoveredDevices).toHaveLength(1);
      expect(state.discoveredDevices[0].rssi).toBe(-45);
    });
  });

  describe('clearDiscoveredDevices', () => {
    it('should clear all discovered devices', () => {
      const state = {
        ...initialState,
        discoveredDevices: [
          { id: 'device-1', name: 'Device 1', rssi: -50 },
          { id: 'device-2', name: 'Device 2', rssi: -60 }
        ]
      };
      
      const newState = deviceReducer(state, clearDiscoveredDevices());
      expect(newState.discoveredDevices).toHaveLength(0);
    });
  });

  describe('setConnectedDevice', () => {
    it('should set connected device', () => {
      const device = { id: 'device-1', name: 'Symbion-ABC' };
      const state = deviceReducer(initialState, setConnectedDevice(device));
      
      expect(state.connectedDevice).toEqual(device);
      expect(state.connectionStatus).toBe('connected');
    });
  });

  describe('setDisconnected', () => {
    it('should clear connected device', () => {
      const state = {
        ...initialState,
        connectedDevice: { id: 'device-1', name: 'Symbion-ABC' },
        connectionStatus: 'connected'
      };
      
      const newState = deviceReducer(state, setDisconnected());
      expect(newState.connectedDevice).toBeNull();
      expect(newState.connectionStatus).toBe('disconnected');
    });
  });

  describe('updateConnectionStatus', () => {
    it('should update connection status', () => {
      const state = deviceReducer(initialState, updateConnectionStatus('connecting'));
      expect(state.connectionStatus).toBe('connecting');
    });

    it('should accept all valid statuses', () => {
      const statuses = ['disconnected', 'connecting', 'connected', 'disconnecting'];
      
      statuses.forEach(status => {
        const state = deviceReducer(initialState, updateConnectionStatus(status));
        expect(state.connectionStatus).toBe(status);
      });
    });
  });

  describe('setBatteryLevel', () => {
    it('should set battery level', () => {
      const state = deviceReducer(initialState, setBatteryLevel(85));
      expect(state.batteryLevel).toBe(85);
    });

    it('should accept null battery level', () => {
      const state = deviceReducer({ ...initialState, batteryLevel: 50 }, setBatteryLevel(null));
      expect(state.batteryLevel).toBeNull();
    });
  });
});

