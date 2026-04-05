// firmware/include/device_info.h

#ifndef DEVICE_INFO_H
#define DEVICE_INFO_H

#include <stdint.h>

// Firmware version
#define FIRMWARE_VERSION "1.0.0"
#define HARDWARE_VERSION "1.0"
#define MANUFACTURER_NAME "Symbion"
#define MODEL_NUMBER "GBI-001"
#define SERIAL_NUMBER "SN-2024-001"

// Device Information Service UUIDs (standard BLE)
#define DEVICE_INFO_SERVICE_UUID        "180A"
#define MANUFACTURER_NAME_CHAR_UUID     "2A29"
#define MODEL_NUMBER_CHAR_UUID          "2A24"
#define SERIAL_NUMBER_CHAR_UUID         "2A25"
#define HARDWARE_REV_CHAR_UUID          "2A27"
#define FIRMWARE_REV_CHAR_UUID          "2A26"

// Battery Service UUIDs (standard BLE)
#define BATTERY_SERVICE_UUID            "180F"
#define BATTERY_LEVEL_CHAR_UUID         "2A19"

class DeviceInfoManager {
public:
    void init();
    
    // Device info getters
    const char* getFirmwareVersion();
    const char* getHardwareVersion();
    const char* getManufacturerName();
    const char* getModelNumber();
    const char* getSerialNumber();
    
    // Battery management
    uint8_t getBatteryPercentage();
    void updateBatteryLevel();
    
private:
    uint8_t battery_level;
};

#endif

