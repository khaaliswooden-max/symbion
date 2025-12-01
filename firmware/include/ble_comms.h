// firmware/include/ble_comms.h

#ifndef BLE_COMMS_H
#define BLE_COMMS_H

#include <stdint.h>
#include "sensor_manager.h"

// BLE UUIDs for gut-brain sensing service
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define SENSOR_DATA_UUID    "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define CONTROL_UUID        "1c95d5e3-d8f7-413a-bf3d-7a2e5d7be87e"

// BLE transmission parameters
#define BLE_MTU_SIZE        20
#define BLE_TX_BUFFER_SIZE  256

// Control commands
#define CMD_START_SAMPLING  0x01
#define CMD_STOP_SAMPLING   0x02
#define CMD_CALIBRATE       0x03
#define CMD_SELF_TEST       0x04
#define CMD_SET_INTERVAL    0x05
#define CMD_REQUEST_STATUS  0x06

class BLECommsManager {
public:
    void init();
    void transmitEncrypted(uint8_t* data, uint16_t length);
    void transmitSensorReading(SensorReading* reading);
    bool isConnected();
    void processControlCommands();
    void setEncryptionKey(const uint8_t* key);
    
private:
    uint8_t aes_key[16];
    bool connected;
    
    void onConnect();
    void onDisconnect();
};

#endif

