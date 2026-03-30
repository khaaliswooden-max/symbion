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
const CMD_SET_KEY = 0x06;

// AES-128 constants
const AES_BLOCK_SIZE = 16;

// AES S-Box lookup table
const SBOX = new Uint8Array([
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
]);

// Inverse S-Box for decryption
const INV_SBOX = new Uint8Array(256);
for (let i = 0; i < 256; i++) INV_SBOX[SBOX[i]] = i;

const RCON = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

function xtime(a) {
  return ((a << 1) ^ (((a >> 7) & 1) * 0x1b)) & 0xff;
}

function keyExpansion(key) {
  const w = new Uint8Array(176);
  w.set(key);
  for (let i = 4; i < 44; i++) {
    let t = w.slice((i - 1) * 4, i * 4);
    if (i % 4 === 0) {
      t = new Uint8Array([SBOX[t[1]] ^ RCON[i / 4 - 1], SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]]);
    }
    for (let j = 0; j < 4; j++) {
      w[i * 4 + j] = w[(i - 4) * 4 + j] ^ t[j];
    }
  }
  return w;
}

function invSubBytes(state) {
  for (let i = 0; i < 16; i++) state[i] = INV_SBOX[state[i]];
}

function invShiftRows(state) {
  let t;
  t = state[13]; state[13] = state[9]; state[9] = state[5]; state[5] = state[1]; state[1] = t;
  t = state[2]; state[2] = state[10]; state[10] = t; t = state[6]; state[6] = state[14]; state[14] = t;
  t = state[3]; state[3] = state[7]; state[7] = state[11]; state[11] = state[15]; state[15] = t;
}

function mul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p;
}

function invMixColumns(state) {
  for (let c = 0; c < 4; c++) {
    const i = c * 4;
    const a = state.slice(i, i + 4);
    state[i]     = mul(a[0],14) ^ mul(a[1],11) ^ mul(a[2],13) ^ mul(a[3],9);
    state[i + 1] = mul(a[0],9)  ^ mul(a[1],14) ^ mul(a[2],11) ^ mul(a[3],13);
    state[i + 2] = mul(a[0],13) ^ mul(a[1],9)  ^ mul(a[2],14) ^ mul(a[3],11);
    state[i + 3] = mul(a[0],11) ^ mul(a[1],13) ^ mul(a[2],9)  ^ mul(a[3],14);
  }
}

function addRoundKey(state, roundKeys, round) {
  const offset = round * 16;
  for (let i = 0; i < 16; i++) state[i] ^= roundKeys[offset + i];
}

function aes128DecryptBlock(block, roundKeys) {
  const state = new Uint8Array(block);
  addRoundKey(state, roundKeys, 10);
  for (let round = 9; round >= 1; round--) {
    invShiftRows(state);
    invSubBytes(state);
    addRoundKey(state, roundKeys, round);
    invMixColumns(state);
  }
  invShiftRows(state);
  invSubBytes(state);
  addRoundKey(state, roundKeys, 0);
  return state;
}

function aes128CbcDecrypt(ciphertext, key) {
  if (ciphertext.length < AES_BLOCK_SIZE * 2) return null; // IV + at least one block

  const roundKeys = keyExpansion(key);
  const iv = ciphertext.slice(0, AES_BLOCK_SIZE);
  const encrypted = ciphertext.slice(AES_BLOCK_SIZE);
  const numBlocks = Math.floor(encrypted.length / AES_BLOCK_SIZE);

  const plaintext = new Uint8Array(numBlocks * AES_BLOCK_SIZE);
  let prevBlock = iv;

  for (let b = 0; b < numBlocks; b++) {
    const block = encrypted.slice(b * AES_BLOCK_SIZE, (b + 1) * AES_BLOCK_SIZE);
    const decrypted = aes128DecryptBlock(block, roundKeys);
    for (let i = 0; i < AES_BLOCK_SIZE; i++) {
      plaintext[b * AES_BLOCK_SIZE + i] = decrypted[i] ^ prevBlock[i];
    }
    prevBlock = block;
  }

  // Remove PKCS7 padding
  const padLen = plaintext[plaintext.length - 1];
  if (padLen > 0 && padLen <= AES_BLOCK_SIZE) {
    return plaintext.slice(0, plaintext.length - padLen);
  }
  return plaintext;
}

class BLEService {
  constructor() {
    this.manager = new BleManager();
    this.device = null;
    this.subscription = null;
    this.dataCallback = null;
    this.encryptionKey = null;
    this.reassemblyBuffer = [];
    this.expectedLength = 0;
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
      this.device = await this.manager.connectToDevice(deviceId);
      await this.device.discoverAllServicesAndCharacteristics();

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
    if (typeof key === 'string') {
      this.encryptionKey = new Uint8Array(
        key.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
    } else {
      this.encryptionKey = new Uint8Array(key);
    }
  }

  onDataReceived(callback) {
    this.dataCallback = callback;
  }

  async startMonitoring() {
    if (!this.device) {
      throw new Error('No device connected');
    }

    await this.sendCommand(CMD_START_SAMPLING);

    this.reassemblyBuffer = [];

    this.subscription = this.device.monitorCharacteristicForService(
      SERVICE_UUID,
      SENSOR_DATA_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Notification error:', error);
          return;
        }
        if (characteristic?.value) {
          const chunk = Buffer.from(characteristic.value, 'base64');
          this.reassemblyBuffer.push(...chunk);

          // AES-128 CBC: IV (16) + encrypted SensorReading (padded to 32) = 48 bytes
          const expectedSize = this.encryptionKey ? 48 : 28;

          if (this.reassemblyBuffer.length >= expectedSize) {
            const fullPacket = new Uint8Array(this.reassemblyBuffer.splice(0, expectedSize));
            const data = this.parseData(fullPacket);
            if (data && this.dataCallback) {
              this.dataCallback(data);
            }
          }
        }
      }
    );
  }

  async stopMonitoring() {
    await this.sendCommand(CMD_STOP_SAMPLING);

    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.reassemblyBuffer = [];
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
    // Read self-test response after a short delay
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const char = await this.device?.readCharacteristicForService(
            SERVICE_UUID,
            CONTROL_UUID
          );
          if (char?.value) {
            const bytes = Buffer.from(char.value, 'base64');
            resolve(bytes[0] === 1); // 1 = pass, 0 = fail
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      }, 2000);
    });
  }

  async setSamplingInterval(intervalMs) {
    const highByte = (intervalMs >> 8) & 0xff;
    const lowByte = intervalMs & 0xff;
    await this.sendCommand(CMD_SET_INTERVAL, [highByte, lowByte]);
  }

  parseData(rawBytes) {
    let decrypted;

    if (this.encryptionKey) {
      decrypted = aes128CbcDecrypt(rawBytes, this.encryptionKey);
      if (!decrypted) {
        console.warn('AES decryption failed');
        return null;
      }
    } else {
      decrypted = rawBytes;
    }

    // Parse sensor reading structure (28 bytes):
    // float serotonin_nm (4), float dopamine_nm (4), float gaba_nm (4),
    // float ph_level (4), float temperature_c (4), float calprotectin_ug_g (4),
    // uint32_t timestamp_ms (4)
    if (decrypted.length < 28) {
      console.warn('Invalid data length:', decrypted.length);
      return null;
    }

    const buf = Buffer.from(decrypted);
    const dataView = new DataView(buf.buffer, buf.byteOffset);

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

  async readBatteryLevel() {
    if (!this.device) return null;

    try {
      const BATTERY_SERVICE = '180f';
      const BATTERY_LEVEL_CHAR = '2a19';

      const characteristic = await this.device.readCharacteristicForService(
        BATTERY_SERVICE,
        BATTERY_LEVEL_CHAR
      );

      if (characteristic?.value) {
        const bytes = Buffer.from(characteristic.value, 'base64');
        return bytes[0];
      }
    } catch (error) {
      console.warn('Battery read failed:', error);
    }
    return null;
  }

  async readDeviceInfo() {
    if (!this.device) return null;

    try {
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
