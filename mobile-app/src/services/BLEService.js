// mobile-app/src/services/BLEService.js

import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

// Symbion device UUIDs (must match firmware)
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const SENSOR_DATA_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const CONTROL_UUID = '1c95d5e3-d8f7-413a-bf3d-7a2e5d7be87e';

// Control commands
const CMD_START_SAMPLING = 0x01;
const CMD_STOP_SAMPLING = 0x02;
const CMD_CALIBRATE = 0x03;
const CMD_SELF_TEST = 0x04;
const CMD_SET_INTERVAL = 0x05;

class BLEService {
  constructor() {
    this.manager = new BleManager();
    this.device = null;
    this.subscription = null;
    this.dataCallback = null;
    this.encryptionKey = null;
  }

  async startScan(onDeviceFound) {
    return new Promise((resolve, reject) => {
      this.manager.startDeviceScan(
        [SERVICE_UUID],
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            reject(error);
            return;
          }
          if (device) {
            onDeviceFound({
              id: device.id,
              name: device.name || device.localName,
              rssi: device.rssi,
            });
          }
        }
      );
      resolve();
    });
  }

  stopScan() {
    this.manager.stopDeviceScan();
  }

  async connect(deviceId) {
    try {
      // Connect to device
      this.device = await this.manager.connectToDevice(deviceId);
      
      // Discover services and characteristics
      await this.device.discoverAllServicesAndCharacteristics();
      
      // Setup disconnect listener
      this.device.onDisconnected((error, device) => {
        console.log('Device disconnected:', device?.name);
        this.device = null;
      });

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    if (this.device) {
      await this.device.cancelConnection();
      this.device = null;
    }
  }

  isConnected() {
    return this.device !== null;
  }

  setEncryptionKey(key) {
    this.encryptionKey = key;
  }

  onDataReceived(callback) {
    this.dataCallback = callback;
  }

  async startMonitoring() {
    if (!this.device) {
      throw new Error('No device connected');
    }

    // Send start command
    await this.sendCommand(CMD_START_SAMPLING);

    // Subscribe to notifications
    this.subscription = this.device.monitorCharacteristicForService(
      SERVICE_UUID,
      SENSOR_DATA_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Notification error:', error);
          return;
        }
        if (characteristic?.value) {
          const data = this.parseData(characteristic.value);
          if (this.dataCallback) {
            this.dataCallback(data);
          }
        }
      }
    );
  }

  async stopMonitoring() {
    // Send stop command
    await this.sendCommand(CMD_STOP_SAMPLING);

    // Unsubscribe from notifications
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  async sendCommand(command, payload = []) {
    if (!this.device) {
      throw new Error('No device connected');
    }

    const data = [command, ...payload];
    const base64Data = Buffer.from(data).toString('base64');

    await this.device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      CONTROL_UUID,
      base64Data
    );
  }

  async calibrate() {
    await this.sendCommand(CMD_CALIBRATE);
  }

  async selfTest() {
    await this.sendCommand(CMD_SELF_TEST);
    // TODO: Read response
  }

  async setSamplingInterval(intervalMs) {
    const highByte = (intervalMs >> 8) & 0xff;
    const lowByte = intervalMs & 0xff;
    await this.sendCommand(CMD_SET_INTERVAL, [highByte, lowByte]);
  }

  parseData(base64Value) {
    // Decode base64 to bytes
    const bytes = Buffer.from(base64Value, 'base64');
    
    // Decrypt if key is set
    let decrypted = bytes;
    if (this.encryptionKey) {
      decrypted = this.decrypt(bytes);
    }

    // Parse sensor reading structure
    // Matches firmware SensorReading struct:
    // float serotonin_nm (4 bytes)
    // float dopamine_nm (4 bytes)
    // float gaba_nm (4 bytes)
    // float ph_level (4 bytes)
    // float temperature_c (4 bytes)
    // float calprotectin_ug_g (4 bytes)
    // uint32_t timestamp_ms (4 bytes)

    if (decrypted.length < 28) {
      console.warn('Invalid data length:', decrypted.length);
      return null;
    }

    const dataView = new DataView(decrypted.buffer, decrypted.byteOffset);

    return {
      serotonin_nm: dataView.getFloat32(0, true),
      dopamine_nm: dataView.getFloat32(4, true),
      gaba_nm: dataView.getFloat32(8, true),
      ph_level: dataView.getFloat32(12, true),
      temperature_c: dataView.getFloat32(16, true),
      calprotectin_ug_g: dataView.getFloat32(20, true),
      timestamp_ms: dataView.getUint32(24, true),
    };
  }

  decrypt(encryptedBytes) {
    // AES-128 decryption
    // In production, use a proper crypto library like react-native-aes-crypto
    // This is a placeholder that returns data as-is
    if (!this.encryptionKey) {
      return encryptedBytes;
    }
    
    // TODO: Implement AES decryption
    // const decrypted = AES.decrypt(encryptedBytes, this.encryptionKey);
    return encryptedBytes;
  }

  // Battery level reading
  async readBatteryLevel() {
    if (!this.device) {
      return null;
    }

    try {
      // Standard Battery Service UUID
      const BATTERY_SERVICE = '180f';
      const BATTERY_LEVEL_CHAR = '2a19';

      const characteristic = await this.device.readCharacteristicForService(
        BATTERY_SERVICE,
        BATTERY_LEVEL_CHAR
      );

      if (characteristic?.value) {
        const bytes = Buffer.from(characteristic.value, 'base64');
        return bytes[0]; // Battery percentage 0-100
      }
    } catch (error) {
      console.warn('Battery read failed:', error);
    }
    return null;
  }

  // Device info
  async readDeviceInfo() {
    if (!this.device) {
      return null;
    }

    try {
      // Device Information Service
      const DEVICE_INFO_SERVICE = '180a';
      const FIRMWARE_VERSION_CHAR = '2a26';

      const characteristic = await this.device.readCharacteristicForService(
        DEVICE_INFO_SERVICE,
        FIRMWARE_VERSION_CHAR
      );

      if (characteristic?.value) {
        return Buffer.from(characteristic.value, 'base64').toString('utf8');
      }
    } catch (error) {
      console.warn('Device info read failed:', error);
    }
    return null;
  }
}

export default new BLEService();

