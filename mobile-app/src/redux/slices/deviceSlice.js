// mobile-app/src/redux/slices/deviceSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isScanning: false,
  availableDevices: [],
  connectedDevice: null,
  connectionStatus: 'disconnected', // 'disconnected' | 'connecting' | 'connected'
  batteryLevel: null,
  firmwareVersion: null,
  lastSyncTime: null,
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setScanning: (state, action) => {
      state.isScanning = action.payload;
    },
    addDiscoveredDevice: (state, action) => {
      const exists = state.availableDevices.find(
        (d) => d.id === action.payload.id
      );
      if (!exists) {
        state.availableDevices.push(action.payload);
      }
    },
    clearDiscoveredDevices: (state) => {
      state.availableDevices = [];
    },
    setConnectedDevice: (state, action) => {
      state.connectedDevice = action.payload;
      state.connectionStatus = action.payload ? 'connected' : 'disconnected';
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    setBatteryLevel: (state, action) => {
      state.batteryLevel = action.payload;
    },
    setFirmwareVersion: (state, action) => {
      state.firmwareVersion = action.payload;
    },
    setLastSyncTime: (state, action) => {
      state.lastSyncTime = action.payload;
    },
    disconnectDevice: (state) => {
      state.connectedDevice = null;
      state.connectionStatus = 'disconnected';
      state.batteryLevel = null;
    },
  },
});

export const {
  setScanning,
  addDiscoveredDevice,
  clearDiscoveredDevices,
  setConnectedDevice,
  setConnectionStatus,
  setBatteryLevel,
  setFirmwareVersion,
  setLastSyncTime,
  disconnectDevice,
} = deviceSlice.actions;

export default deviceSlice.reducer;

