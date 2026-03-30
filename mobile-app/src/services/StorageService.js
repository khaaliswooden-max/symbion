import { Platform } from 'react-native';

// AsyncStorage-compatible persistence layer
// Uses a simple file-based cache that works across React Native environments
const STORAGE_PREFIX = '@symbion:';
const MAX_READINGS_STORED = 10000;

// In-memory fallback when AsyncStorage is not available
let memoryStore = {};

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // Fallback to in-memory storage for testing/development
  AsyncStorage = {
    getItem: async (key) => memoryStore[key] || null,
    setItem: async (key, value) => { memoryStore[key] = value; },
    removeItem: async (key) => { delete memoryStore[key]; },
    getAllKeys: async () => Object.keys(memoryStore),
    multiRemove: async (keys) => keys.forEach(k => delete memoryStore[k]),
  };
}

class StorageService {
  async saveReadings(deviceId, readings) {
    const key = `${STORAGE_PREFIX}readings:${deviceId}`;

    // Get existing readings
    const existing = await this.getReadings(deviceId);
    const combined = [...existing, ...readings];

    // Keep only the most recent readings
    const trimmed = combined.slice(-MAX_READINGS_STORED);

    await AsyncStorage.setItem(key, JSON.stringify(trimmed));
    return trimmed.length;
  }

  async getReadings(deviceId, limit = MAX_READINGS_STORED) {
    const key = `${STORAGE_PREFIX}readings:${deviceId}`;
    const data = await AsyncStorage.getItem(key);
    if (!data) return [];

    const readings = JSON.parse(data);
    return readings.slice(-limit);
  }

  async getReadingsSince(deviceId, sinceTimestamp) {
    const readings = await this.getReadings(deviceId);
    return readings.filter(r => r.timestamp_ms > sinceTimestamp);
  }

  async clearReadings(deviceId) {
    const key = `${STORAGE_PREFIX}readings:${deviceId}`;
    await AsyncStorage.removeItem(key);
  }

  async saveEncryptionKey(deviceId, keyHex) {
    const key = `${STORAGE_PREFIX}enckey:${deviceId}`;
    await AsyncStorage.setItem(key, keyHex);
  }

  async getEncryptionKey(deviceId) {
    const key = `${STORAGE_PREFIX}enckey:${deviceId}`;
    return AsyncStorage.getItem(key);
  }

  async saveUserPreferences(prefs) {
    await AsyncStorage.setItem(`${STORAGE_PREFIX}prefs`, JSON.stringify(prefs));
  }

  async getUserPreferences() {
    const data = await AsyncStorage.getItem(`${STORAGE_PREFIX}prefs`);
    return data ? JSON.parse(data) : null;
  }

  async saveAuthTokens(tokens) {
    await AsyncStorage.setItem(`${STORAGE_PREFIX}auth`, JSON.stringify(tokens));
  }

  async getAuthTokens() {
    const data = await AsyncStorage.getItem(`${STORAGE_PREFIX}auth`);
    return data ? JSON.parse(data) : null;
  }

  async clearAuthTokens() {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}auth`);
  }

  async getUnsyncedReadings(deviceId) {
    const key = `${STORAGE_PREFIX}unsynced:${deviceId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  async markReadingsUnsynced(deviceId, readings) {
    const key = `${STORAGE_PREFIX}unsynced:${deviceId}`;
    const existing = await this.getUnsyncedReadings(deviceId);
    const combined = [...existing, ...readings].slice(-MAX_READINGS_STORED);
    await AsyncStorage.setItem(key, JSON.stringify(combined));
  }

  async clearUnsyncedReadings(deviceId) {
    const key = `${STORAGE_PREFIX}unsynced:${deviceId}`;
    await AsyncStorage.removeItem(key);
  }
}

export default new StorageService();
