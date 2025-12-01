// mobile-app/src/redux/slices/sensorSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMonitoring: false,
  currentReading: null,
  readingHistory: [],
  alerts: [],
  // Analyte reference ranges
  referenceRanges: {
    serotonin: { min: 50, max: 200, unit: 'nM' },
    dopamine: { min: 100, max: 500, unit: 'nM' },
    gaba: { min: 200, max: 1000, unit: 'nM' },
    ph: { min: 6.5, max: 7.5, unit: '' },
    calprotectin: { min: 0, max: 50, unit: 'µg/g' },
  },
  samplingInterval: 1000, // ms
};

const sensorSlice = createSlice({
  name: 'sensor',
  initialState,
  reducers: {
    setMonitoring: (state, action) => {
      state.isMonitoring = action.payload;
    },
    updateCurrentReading: (state, action) => {
      state.currentReading = {
        ...action.payload,
        receivedAt: Date.now(),
      };
    },
    addToHistory: (state, action) => {
      state.readingHistory.push(action.payload);
      // Keep last 1000 readings in memory
      if (state.readingHistory.length > 1000) {
        state.readingHistory.shift();
      }
    },
    clearHistory: (state) => {
      state.readingHistory = [];
    },
    addAlert: (state, action) => {
      state.alerts.push({
        id: Date.now(),
        ...action.payload,
        timestamp: Date.now(),
        read: false,
      });
    },
    markAlertRead: (state, action) => {
      const alert = state.alerts.find((a) => a.id === action.payload);
      if (alert) {
        alert.read = true;
      }
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
    setSamplingInterval: (state, action) => {
      state.samplingInterval = action.payload;
    },
    updateReferenceRanges: (state, action) => {
      state.referenceRanges = {
        ...state.referenceRanges,
        ...action.payload,
      };
    },
  },
});

export const {
  setMonitoring,
  updateCurrentReading,
  addToHistory,
  clearHistory,
  addAlert,
  markAlertRead,
  clearAlerts,
  setSamplingInterval,
  updateReferenceRanges,
} = sensorSlice.actions;

export default sensorSlice.reducer;

