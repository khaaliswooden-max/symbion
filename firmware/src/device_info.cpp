// firmware/src/device_info.cpp

#include "device_info.h"
#include "power_manager.h"
#include <Arduino.h>
#include <ArduinoBLE.h>

// BLE Services
static BLEService deviceInfoService(DEVICE_INFO_SERVICE_UUID);
static BLEService batteryService(BATTERY_SERVICE_UUID);

// Device Information Characteristics
static BLECharacteristic manufacturerChar(MANUFACTURER_NAME_CHAR_UUID, BLERead, 32);
static BLECharacteristic modelNumberChar(MODEL_NUMBER_CHAR_UUID, BLERead, 16);
static BLECharacteristic serialNumberChar(SERIAL_NUMBER_CHAR_UUID, BLERead, 16);
static BLECharacteristic hardwareRevChar(HARDWARE_REV_CHAR_UUID, BLERead, 16);
static BLECharacteristic firmwareRevChar(FIRMWARE_REV_CHAR_UUID, BLERead, 16);

// Battery Characteristic
static BLECharacteristic batteryLevelChar(BATTERY_LEVEL_CHAR_UUID, BLERead | BLENotify, 1);

// External power manager instance
extern PowerManager powerManager;

void DeviceInfoManager::init() {
    battery_level = 100; // Initial value
    
    // Configure Device Information Service
    deviceInfoService.addCharacteristic(manufacturerChar);
    deviceInfoService.addCharacteristic(modelNumberChar);
    deviceInfoService.addCharacteristic(serialNumberChar);
    deviceInfoService.addCharacteristic(hardwareRevChar);
    deviceInfoService.addCharacteristic(firmwareRevChar);
    
    // Set initial values
    manufacturerChar.writeValue(MANUFACTURER_NAME);
    modelNumberChar.writeValue(MODEL_NUMBER);
    serialNumberChar.writeValue(SERIAL_NUMBER);
    hardwareRevChar.writeValue(HARDWARE_VERSION);
    firmwareRevChar.writeValue(FIRMWARE_VERSION);
    
    // Add Device Information Service
    BLE.addService(deviceInfoService);
    
    // Configure Battery Service
    batteryService.addCharacteristic(batteryLevelChar);
    batteryLevelChar.writeValue(battery_level);
    
    // Add Battery Service
    BLE.addService(batteryService);
    
    Serial.println("Device Info & Battery services initialized");
}

const char* DeviceInfoManager::getFirmwareVersion() {
    return FIRMWARE_VERSION;
}

const char* DeviceInfoManager::getHardwareVersion() {
    return HARDWARE_VERSION;
}

const char* DeviceInfoManager::getManufacturerName() {
    return MANUFACTURER_NAME;
}

const char* DeviceInfoManager::getModelNumber() {
    return MODEL_NUMBER;
}

const char* DeviceInfoManager::getSerialNumber() {
    return SERIAL_NUMBER;
}

uint8_t DeviceInfoManager::getBatteryPercentage() {
    return battery_level;
}

void DeviceInfoManager::updateBatteryLevel() {
    // Get battery status from power manager
    BatteryStatus status = powerManager.getBatteryStatus();
    battery_level = status.percentage;
    
    // Update BLE characteristic
    batteryLevelChar.writeValue(battery_level);
    
    // Log if critical
    if (status.is_critical) {
        Serial.println("WARNING: Battery critical!");
    }
}

