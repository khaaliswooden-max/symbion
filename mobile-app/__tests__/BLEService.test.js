/**
 * @file BLEService.test.js
 * @brief Unit tests for BLE Service
 */

import BLEService from '../src/services/BLEService';
import { BleManager } from 'react-native-ble-plx';

// Mock react-native-ble-plx
jest.mock('react-native-ble-plx');

describe('BLEService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startScan', () => {
    it('should start device scan', async () => {
      const mockStartDeviceScan = jest.fn();
      BleManager.mockImplementation(() => ({
        startDeviceScan: mockStartDeviceScan
      }));

      const onDeviceFound = jest.fn();
      await BLEService.startScan(onDeviceFound);

      expect(mockStartDeviceScan).toHaveBeenCalled();
    });

    it('should call onDeviceFound when device is discovered', async () => {
      const mockDevice = {
        id: 'device-123',
        name: 'Symbion-ABC',
        rssi: -50
      };

      BleManager.mockImplementation(() => ({
        startDeviceScan: (serviceUUIDs, options, callback) => {
          callback(null, mockDevice);
        }
      }));

      const onDeviceFound = jest.fn();
      await BLEService.startScan(onDeviceFound);

      expect(onDeviceFound).toHaveBeenCalledWith({
        id: 'device-123',
        name: 'Symbion-ABC',
        rssi: -50
      });
    });
  });

  describe('connect', () => {
    it('should connect to device by ID', async () => {
      const mockDevice = {
        discoverAllServicesAndCharacteristics: jest.fn(),
        onDisconnected: jest.fn()
      };

      const mockConnectToDevice = jest.fn().mockResolvedValue(mockDevice);

      BleManager.mockImplementation(() => ({
        connectToDevice: mockConnectToDevice
      }));

      const result = await BLEService.connect('device-123');

      expect(mockConnectToDevice).toHaveBeenCalledWith('device-123');
      expect(mockDevice.discoverAllServicesAndCharacteristics).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle connection errors', async () => {
      const mockConnectToDevice = jest.fn().mockRejectedValue(new Error('Connection failed'));

      BleManager.mockImplementation(() => ({
        connectToDevice: mockConnectToDevice
      }));

      await expect(BLEService.connect('device-123')).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from device', async () => {
      const mockDevice = {
        cancelConnection: jest.fn().mockResolvedValue(undefined),
        discoverAllServicesAndCharacteristics: jest.fn(),
        onDisconnected: jest.fn()
      };

      BleManager.mockImplementation(() => ({
        connectToDevice: jest.fn().mockResolvedValue(mockDevice)
      }));

      await BLEService.connect('device-123');
      await BLEService.disconnect();

      expect(mockDevice.cancelConnection).toHaveBeenCalled();
    });
  });

  describe('parseData', () => {
    it('should parse sensor data correctly', () => {
      // Create test data matching SensorReading struct
      const buffer = Buffer.alloc(28);
      
      // Write float values (little endian)
      buffer.writeFloatLE(1000.5, 0);  // serotonin
      buffer.writeFloatLE(500.3, 4);   // dopamine
      buffer.writeFloatLE(2000.7, 8);  // gaba
      buffer.writeFloatLE(6.5, 12);    // ph
      buffer.writeFloatLE(37.0, 16);   // temperature
      buffer.writeFloatLE(50.2, 20);   // calprotectin
      buffer.writeUInt32LE(12345, 24); // timestamp

      const base64 = buffer.toString('base64');
      const parsed = BLEService.parseData(base64);

      expect(parsed).toBeDefined();
      expect(parsed.serotonin_nm).toBeCloseTo(1000.5, 1);
      expect(parsed.dopamine_nm).toBeCloseTo(500.3, 1);
      expect(parsed.gaba_nm).toBeCloseTo(2000.7, 1);
      expect(parsed.ph_level).toBeCloseTo(6.5, 1);
      expect(parsed.temperature_c).toBeCloseTo(37.0, 1);
      expect(parsed.calprotectin_ug_g).toBeCloseTo(50.2, 1);
      expect(parsed.timestamp_ms).toBe(12345);
    });

    it('should return null for invalid data', () => {
      const shortBuffer = Buffer.alloc(10); // Too short
      const base64 = shortBuffer.toString('base64');
      const parsed = BLEService.parseData(base64);

      expect(parsed).toBeNull();
    });
  });

  describe('sendCommand', () => {
    it('should send command to device', async () => {
      const mockWrite = jest.fn().mockResolvedValue(undefined);
      const mockDevice = {
        writeCharacteristicWithResponseForService: mockWrite,
        discoverAllServicesAndCharacteristics: jest.fn(),
        onDisconnected: jest.fn()
      };

      BleManager.mockImplementation(() => ({
        connectToDevice: jest.fn().mockResolvedValue(mockDevice)
      }));

      await BLEService.connect('device-123');
      await BLEService.sendCommand(0x01); // CMD_START_SAMPLING

      expect(mockWrite).toHaveBeenCalled();
    });

    it('should throw error if not connected', async () => {
      await expect(BLEService.sendCommand(0x01))
        .rejects
        .toThrow('No device connected');
    });
  });

  describe('startMonitoring', () => {
    it('should start monitoring and subscribe to notifications', async () => {
      const mockMonitor = jest.fn();
      const mockWrite = jest.fn().mockResolvedValue(undefined);
      const mockDevice = {
        writeCharacteristicWithResponseForService: mockWrite,
        monitorCharacteristicForService: mockMonitor,
        discoverAllServicesAndCharacteristics: jest.fn(),
        onDisconnected: jest.fn()
      };

      BleManager.mockImplementation(() => ({
        connectToDevice: jest.fn().mockResolvedValue(mockDevice)
      }));

      await BLEService.connect('device-123');
      await BLEService.startMonitoring();

      expect(mockWrite).toHaveBeenCalled(); // Start command sent
      expect(mockMonitor).toHaveBeenCalled(); // Monitoring started
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring and unsubscribe', async () => {
      const mockRemove = jest.fn();
      const mockWrite = jest.fn().mockResolvedValue(undefined);
      const mockDevice = {
        writeCharacteristicWithResponseForService: mockWrite,
        monitorCharacteristicForService: jest.fn().mockReturnValue({ remove: mockRemove }),
        discoverAllServicesAndCharacteristics: jest.fn(),
        onDisconnected: jest.fn()
      };

      BleManager.mockImplementation(() => ({
        connectToDevice: jest.fn().mockResolvedValue(mockDevice)
      }));

      await BLEService.connect('device-123');
      await BLEService.startMonitoring();
      await BLEService.stopMonitoring();

      expect(mockWrite).toHaveBeenCalledTimes(2); // Start and stop
      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('isConnected', () => {
    it('should return false when not connected', () => {
      expect(BLEService.isConnected()).toBe(false);
    });

    it('should return true when connected', async () => {
      const mockDevice = {
        discoverAllServicesAndCharacteristics: jest.fn(),
        onDisconnected: jest.fn()
      };

      BleManager.mockImplementation(() => ({
        connectToDevice: jest.fn().mockResolvedValue(mockDevice)
      }));

      await BLEService.connect('device-123');
      expect(BLEService.isConnected()).toBe(true);
    });
  });

  describe('setEncryptionKey', () => {
    it('should set encryption key', () => {
      const key = 'test-encryption-key-123';
      BLEService.setEncryptionKey(key);
      // Should not throw
    });
  });

  describe('calibrate', () => {
    it('should send calibrate command', async () => {
      const mockWrite = jest.fn().mockResolvedValue(undefined);
      const mockDevice = {
        writeCharacteristicWithResponseForService: mockWrite,
        discoverAllServicesAndCharacteristics: jest.fn(),
        onDisconnected: jest.fn()
      };

      BleManager.mockImplementation(() => ({
        connectToDevice: jest.fn().mockResolvedValue(mockDevice)
      }));

      await BLEService.connect('device-123');
      await BLEService.calibrate();

      expect(mockWrite).toHaveBeenCalled();
    });
  });

  describe('setSamplingInterval', () => {
    it('should send sampling interval command', async () => {
      const mockWrite = jest.fn().mockResolvedValue(undefined);
      const mockDevice = {
        writeCharacteristicWithResponseForService: mockWrite,
        discoverAllServicesAndCharacteristics: jest.fn(),
        onDisconnected: jest.fn()
      };

      BleManager.mockImplementation(() => ({
        connectToDevice: jest.fn().mockResolvedValue(mockDevice)
      }));

      await BLEService.connect('device-123');
      await BLEService.setSamplingInterval(5000); // 5 seconds

      expect(mockWrite).toHaveBeenCalled();
    });
  });
});

