// mobile-app/src/redux/slices/userSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  isAuthenticated: false,
  preferences: {
    notifications: true,
    darkMode: false,
    units: 'metric',
    alertThresholds: {
      serotoninLow: 30,
      serotoninHigh: 300,
      dopamineLow: 50,
      dopamineHigh: 600,
      gabaLow: 100,
      gabaHigh: 1200,
    },
  },
  healthProfile: {
    age: null,
    weight: null,
    conditions: [],
    medications: [],
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
    },
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },
    setDarkMode: (state, action) => {
      state.preferences.darkMode = action.payload;
    },
    setNotifications: (state, action) => {
      state.preferences.notifications = action.payload;
    },
    updateAlertThresholds: (state, action) => {
      state.preferences.alertThresholds = {
        ...state.preferences.alertThresholds,
        ...action.payload,
      };
    },
    updateHealthProfile: (state, action) => {
      state.healthProfile = {
        ...state.healthProfile,
        ...action.payload,
      };
    },
    addCondition: (state, action) => {
      if (!state.healthProfile.conditions.includes(action.payload)) {
        state.healthProfile.conditions.push(action.payload);
      }
    },
    removeCondition: (state, action) => {
      state.healthProfile.conditions = state.healthProfile.conditions.filter(
        (c) => c !== action.payload
      );
    },
    addMedication: (state, action) => {
      state.healthProfile.medications.push(action.payload);
    },
    removeMedication: (state, action) => {
      state.healthProfile.medications = state.healthProfile.medications.filter(
        (m) => m.name !== action.payload
      );
    },
  },
});

export const {
  setProfile,
  logout,
  updatePreferences,
  setDarkMode,
  setNotifications,
  updateAlertThresholds,
  updateHealthProfile,
  addCondition,
  removeCondition,
  addMedication,
  removeMedication,
} = userSlice.actions;

export default userSlice.reducer;

