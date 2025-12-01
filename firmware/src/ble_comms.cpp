// firmware/src/ble_comms.cpp

#include <ArduinoBLE.h>
#include "ble_comms.h"
#include "aes.h"
#include <string.h>

// BLE service and characteristics
static BLEService sensorService(SERVICE_UUID);
static BLECharacteristic sensorDataChar(SENSOR_DATA_UUID, BLERead | BLENotify, BLE_TX_BUFFER_SIZE);
static BLECharacteristic controlChar(CONTROL_UUID, BLEWrite | BLERead, 8);

// Connection state
static bool ble_connected = false;

// Callback handlers
static void onBLEConnect(BLEDevice central) {
    ble_connected = true;
    Serial.print("Connected to: ");
    Serial.println(central.address());
}

static void onBLEDisconnect(BLEDevice central) {
    ble_connected = false;
    Serial.print("Disconnected from: ");
    Serial.println(central.address());
    BLE.advertise();  // Resume advertising
}

void BLECommsManager::init() {
    if (!BLE.begin()) {
        Serial.println("BLE init failed");
        return;
    }
    
    // Set device name and appearance
    BLE.setLocalName("Symbion-GBI");
    BLE.setDeviceName("Symbion Gut-Brain Interface");
    BLE.setAdvertisedService(sensorService);
    
    // Configure characteristics
    sensorService.addCharacteristic(sensorDataChar);
    sensorService.addCharacteristic(controlChar);
    BLE.addService(sensorService);
    
    // Set initial values
    uint8_t initial_data[1] = {0x00};
    sensorDataChar.writeValue(initial_data, 1);
    controlChar.writeValue(initial_data, 1);
    
    // Set event handlers
    BLE.setEventHandler(BLEConnected, onBLEConnect);
    BLE.setEventHandler(BLEDisconnected, onBLEDisconnect);
    
    // Start advertising
    BLE.advertise();
    Serial.println("BLE advertising started");
    
    // Initialize with default key (should be replaced via secure pairing)
    memset(aes_key, 0, 16);
    connected = false;
}

void BLECommsManager::setEncryptionKey(const uint8_t* key) {
    memcpy(aes_key, key, 16);
}

bool BLECommsManager::isConnected() {
    return ble_connected;
}

void BLECommsManager::transmitEncrypted(uint8_t* data, uint16_t length) {
    if (!ble_connected) return;
    
    uint8_t encrypted[BLE_TX_BUFFER_SIZE];
    uint16_t encrypted_len = aes128_encrypt(data, encrypted, aes_key, length);
    
    // Transmit in chunks (BLE max 20 bytes per notification)
    for (uint16_t i = 0; i < encrypted_len; i += BLE_MTU_SIZE) {
        uint16_t chunk_size = encrypted_len - i;
        if (chunk_size > BLE_MTU_SIZE) {
            chunk_size = BLE_MTU_SIZE;
        }
        
        sensorDataChar.writeValue(encrypted + i, chunk_size);
        delay(10);  // Ensure transmission completes
    }
}

void BLECommsManager::transmitSensorReading(SensorReading* reading) {
    if (!ble_connected) return;
    
    // Serialize sensor reading
    uint8_t buffer[sizeof(SensorReading)];
    memcpy(buffer, reading, sizeof(SensorReading));
    
    // Transmit encrypted
    transmitEncrypted(buffer, sizeof(SensorReading));
}

void BLECommsManager::processControlCommands() {
    BLE.poll();
    
    if (controlChar.written()) {
        uint8_t cmd_buffer[8];
        int len = controlChar.valueLength();
        
        if (len > 0 && len <= 8) {
            memcpy(cmd_buffer, controlChar.value(), len);
            
            uint8_t command = cmd_buffer[0];
            
            switch (command) {
                case CMD_START_SAMPLING:
                    Serial.println("CMD: Start sampling");
                    // Signal main loop to start sampling
                    break;
                    
                case CMD_STOP_SAMPLING:
                    Serial.println("CMD: Stop sampling");
                    // Signal main loop to stop sampling
                    break;
                    
                case CMD_CALIBRATE:
                    Serial.println("CMD: Calibrate");
                    // Trigger calibration routine
                    break;
                    
                case CMD_SELF_TEST:
                    Serial.println("CMD: Self test");
                    // Run self-test and report results
                    break;
                    
                case CMD_SET_INTERVAL:
                    if (len >= 3) {
                        uint16_t interval_ms = (cmd_buffer[1] << 8) | cmd_buffer[2];
                        Serial.print("CMD: Set interval to ");
                        Serial.print(interval_ms);
                        Serial.println(" ms");
                    }
                    break;
                    
                case CMD_REQUEST_STATUS:
                    Serial.println("CMD: Status request");
                    // Send device status
                    break;
                    
                default:
                    Serial.print("CMD: Unknown command 0x");
                    Serial.println(command, HEX);
                    break;
            }
        }
    }
}

void BLECommsManager::onConnect() {
    connected = true;
}

void BLECommsManager::onDisconnect() {
    connected = false;
}

