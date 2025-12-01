// mobile-app/src/App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from './redux/store';

import HomeScreen from './screens/HomeScreen';
import DevicePairingScreen from './screens/DevicePairingScreen';
import LiveMonitoringScreen from './screens/LiveMonitoringScreen';
import HistoricalAnalysisScreen from './screens/HistoricalAnalysisScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="DevicePairing" component={DevicePairingScreen} />
          <Stack.Screen name="LiveMonitoring" component={LiveMonitoringScreen} />
          <Stack.Screen name="HistoricalAnalysis" component={HistoricalAnalysisScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

