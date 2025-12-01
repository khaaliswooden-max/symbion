// firmware/src/main.cpp
// Main entry point for Symbion Gut-Brain Interface firmware

#include <Arduino.h>
#include <ArduinoBLE.h>
#include "sensor_manager.h"
#include "signal_processing.h"
#include "ble_comms.h"
#include "power_manager.h"
#include "device_info.h"

// Global instances
SensorManager sensorManager;
SignalProcessor signalProcessor;
BLECommsManager bleComms;
PowerManager powerManager;
DeviceInfoManager deviceInfo;

// Sampling configuration
#define SAMPLING_INTERVAL_MS    1000    // 1 Hz default
#define BATTERY_UPDATE_MS       60000   // Update battery every minute
#define POWER_CHECK_INTERVAL_MS 5000    // Check power mode every 5 seconds

// State variables
bool sampling_active = false;
uint32_t last_sample_time = 0;
uint32_t last_battery_update = 0;
uint32_t last_power_check = 0;
uint16_t sampling_interval_ms = SAMPLING_INTERVAL_MS;

// Signal processing filter states
FilterState serotonin_filter;
FilterState dopamine_filter;
FilterState gaba_filter;

KalmanState serotonin_kalman;
KalmanState dopamine_kalman;
KalmanState gaba_kalman;

// AES encryption key (should be set via secure pairing in production)
const uint8_t aes_key[16] = {
    0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
    0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c
};

void setup() {
    // Initialize serial for debugging
    Serial.begin(115200);
    while (!Serial && millis() < 3000); // Wait up to 3 seconds for serial
    
    Serial.println("=================================");
    Serial.println("  Symbion Gut-Brain Interface");
    Serial.println("  Firmware v1.0.0");
    Serial.println("=================================");
    
    // Initialize power management
    Serial.print("Initializing power manager... ");
    powerManager.init();
    Serial.println("OK");
    
    // Initialize sensor manager
    Serial.print("Initializing sensors... ");
    sensorManager.init();
    Serial.println("OK");
    
    // Run sensor self-test
    Serial.print("Running self-test... ");
    if (sensorManager.selfTest()) {
        Serial.println("PASSED");
    } else {
        Serial.println("FAILED - Check hardware connections");
    }
    
    // Initialize signal processing filters
    Serial.print("Initializing filters... ");
    SignalProcessor::initFilterState(&serotonin_filter);
    SignalProcessor::initFilterState(&dopamine_filter);
    SignalProcessor::initFilterState(&gaba_filter);
    
    SignalProcessor::initKalmanState(&serotonin_kalman, 100.0f, 0.1f, 10.0f);
    SignalProcessor::initKalmanState(&dopamine_kalman, 200.0f, 0.1f, 15.0f);
    SignalProcessor::initKalmanState(&gaba_kalman, 500.0f, 0.1f, 20.0f);
    Serial.println("OK");
    
    // Initialize BLE
    Serial.print("Initializing BLE... ");
    bleComms.init();
    bleComms.setEncryptionKey(aes_key);
    Serial.println("OK");
    
    // Initialize device info & battery services
    Serial.print("Initializing device services... ");
    deviceInfo.init();
    Serial.println("OK");
    
    Serial.println("\nSystem ready. Waiting for BLE connection...");
    Serial.print("Device name: Symbion-GBI\n");
    
    // Initial battery reading
    deviceInfo.updateBatteryLevel();
    Serial.print("Battery: ");
    Serial.print(deviceInfo.getBatteryPercentage());
    Serial.println("%");
}

void loop() {
    uint32_t current_time = millis();
    
    // Process BLE events and commands
    bleComms.processControlCommands();
    
    // Check if we're connected
    if (bleComms.isConnected()) {
        
        // Sampling loop
        if (sampling_active && (current_time - last_sample_time >= sampling_interval_ms)) {
            last_sample_time = current_time;
            
            // Read raw sensor data
            SensorReading raw_reading = sensorManager.readAnalytes();
            
            // Apply signal processing
            SensorReading filtered_reading = raw_reading;
            
            // Butterworth low-pass filter
            filtered_reading.serotonin_nm = signalProcessor.butterworthFilter(
                raw_reading.serotonin_nm, &serotonin_filter
            );
            filtered_reading.dopamine_nm = signalProcessor.butterworthFilter(
                raw_reading.dopamine_nm, &dopamine_filter
            );
            filtered_reading.gaba_nm = signalProcessor.butterworthFilter(
                raw_reading.gaba_nm, &gaba_filter
            );
            
            // Kalman filter for additional noise reduction
            filtered_reading.serotonin_nm = signalProcessor.kalmanFilter(
                filtered_reading.serotonin_nm, &serotonin_kalman
            );
            filtered_reading.dopamine_nm = signalProcessor.kalmanFilter(
                filtered_reading.dopamine_nm, &dopamine_kalman
            );
            filtered_reading.gaba_nm = signalProcessor.kalmanFilter(
                filtered_reading.gaba_nm, &gaba_kalman
            );
            
            // Transmit filtered data
            bleComms.transmitSensorReading(&filtered_reading);
            
            // Debug output
            Serial.print("Sample | 5-HT: ");
            Serial.print(filtered_reading.serotonin_nm, 1);
            Serial.print(" nM | DA: ");
            Serial.print(filtered_reading.dopamine_nm, 1);
            Serial.print(" nM | GABA: ");
            Serial.print(filtered_reading.gaba_nm, 1);
            Serial.print(" nM | pH: ");
            Serial.print(filtered_reading.ph_level, 2);
            Serial.println();
        }
        
        // Battery level update
        if (current_time - last_battery_update >= BATTERY_UPDATE_MS) {
            last_battery_update = current_time;
            deviceInfo.updateBatteryLevel();
            
            Serial.print("Battery: ");
            Serial.print(deviceInfo.getBatteryPercentage());
            Serial.println("%");
        }
        
        // Dynamic power management
        if (current_time - last_power_check >= POWER_CHECK_INTERVAL_MS) {
            last_power_check = current_time;
            
            // Calculate load level based on sampling rate
            uint8_t load_level;
            if (!sampling_active) {
                load_level = 10; // Idle
            } else if (sampling_interval_ms > 5000) {
                load_level = 30; // Low rate
            } else if (sampling_interval_ms > 1000) {
                load_level = 60; // Medium rate
            } else {
                load_level = 90; // High rate
            }
            
            powerManager.dynamicVoltageScaling(load_level);
        }
        
    } else {
        // Not connected - enter low power mode
        if (current_time - last_power_check >= POWER_CHECK_INTERVAL_MS) {
            last_power_check = current_time;
            powerManager.dynamicVoltageScaling(5); // Minimum power
        }
    }
    
    // Small delay to prevent busy-waiting
    delay(1);
}

// Command handlers (called from BLE callbacks)
extern "C" {
    void onStartSampling() {
        sampling_active = true;
        last_sample_time = millis();
        Serial.println("Sampling started");
    }
    
    void onStopSampling() {
        sampling_active = false;
        Serial.println("Sampling stopped");
    }
    
    void onCalibrate() {
        Serial.println("Starting calibration...");
        sampling_active = false;
        sensorManager.calibrate();
        Serial.println("Calibration complete");
    }
    
    void onSelfTest() {
        Serial.println("Running self-test...");
        bool result = sensorManager.selfTest();
        Serial.print("Self-test: ");
        Serial.println(result ? "PASSED" : "FAILED");
    }
    
    void onSetInterval(uint16_t interval_ms) {
        sampling_interval_ms = interval_ms;
        Serial.print("Sampling interval set to ");
        Serial.print(interval_ms);
        Serial.println(" ms");
    }
}

