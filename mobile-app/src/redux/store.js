// mobile-app/src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from './slices/deviceSlice';
import sensorReducer from './slices/sensorSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    device: deviceReducer,
    sensor: sensorReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (BLE device objects)
        ignoredActions: ['device/setConnectedDevice'],
        ignoredPaths: ['device.connectedDevice'],
      },
    }),
});

export default store;

