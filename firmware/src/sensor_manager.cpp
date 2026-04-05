// firmware/src/sensor_manager.cpp

#include "sensor_manager.h"
#include <Arduino.h>

// ADC channel assignments
#define ADC_CHANNEL_SEROTONIN   0
#define ADC_CHANNEL_DOPAMINE    1
#define ADC_CHANNEL_GABA        2
#define ADC_CHANNEL_PH          3
#define ADC_CHANNEL_TEMP        4
#define ADC_CHANNEL_CALPROTECTIN 5

// ADC configuration
#define ADC_RESOLUTION_BITS     12
#define ADC_MAX_VALUE           4095
#define ADC_REF_VOLTAGE_MV      3300

// Calibration coefficients (factory defaults)
static float calibration_offset[6] = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f};
static float calibration_gain[6] = {1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f};

// Baseline drift tracking
static float baseline_values[6] = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f};
static uint32_t last_baseline_update_ms = 0;
#define BASELINE_UPDATE_INTERVAL_MS 60000

// Conversion factors for each analyte
#define SEROTONIN_MV_TO_NM      3.03f    // mV to nanomolar
#define DOPAMINE_MV_TO_NM       1.52f
#define GABA_MV_TO_NM           15.15f
#define PH_MV_PER_PH            59.16f   // Nernst equation at 25°C
#define TEMP_MV_PER_C           10.0f    // Typical for LM35-style sensor
#define CALPROTECTIN_MV_TO_UG   0.015f

void SensorManager::init() {
    configureADC();
    
    // Allow sensors to stabilize
    delay(100);
    
    // Initialize baseline values
    for (int i = 0; i < 6; i++) {
        baseline_values[i] = 0.0f;
    }
    last_baseline_update_ms = millis();
    
    // Perform initial baseline reading
    baselineDriftCorrection();
}

void SensorManager::configureADC() {
    // Configure ADC for 12-bit resolution
    analogReadResolution(ADC_RESOLUTION_BITS);
    
    // Set reference voltage to internal 3.3V
    analogReference(AR_INTERNAL);
    
    // Configure analog input pins
    pinMode(A0, INPUT);  // Serotonin
    pinMode(A1, INPUT);  // Dopamine
    pinMode(A2, INPUT);  // GABA
    pinMode(A3, INPUT);  // pH
    pinMode(A4, INPUT);  // Temperature
    pinMode(A5, INPUT);  // Calprotectin
}

float SensorManager::applyCalibration(uint16_t raw_value, uint8_t channel) {
    if (channel >= 6) return 0.0f;
    
    // Convert raw ADC to millivolts
    float voltage_mv = (raw_value * ADC_REF_VOLTAGE_MV) / (float)ADC_MAX_VALUE;
    
    // Apply calibration: corrected = (raw - offset) * gain
    float corrected = (voltage_mv - calibration_offset[channel]) * calibration_gain[channel];
    
    // Apply baseline drift correction
    corrected -= baseline_values[channel];
    
    return corrected;
}

void SensorManager::baselineDriftCorrection() {
    uint32_t current_time = millis();
    
    // Update baseline periodically
    if (current_time - last_baseline_update_ms < BASELINE_UPDATE_INTERVAL_MS) {
        return;
    }
    
    // Take multiple readings and average for stable baseline
    const int num_samples = 10;
    float sample_sum[6] = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f};
    
    for (int i = 0; i < num_samples; i++) {
        sample_sum[0] += analogRead(A0);
        sample_sum[1] += analogRead(A1);
        sample_sum[2] += analogRead(A2);
        sample_sum[3] += analogRead(A3);
        sample_sum[4] += analogRead(A4);
        sample_sum[5] += analogRead(A5);
        delay(1);
    }
    
    // Apply exponential moving average for smooth baseline tracking
    const float alpha = 0.1f;
    for (int i = 0; i < 6; i++) {
        float avg_mv = ((sample_sum[i] / num_samples) * ADC_REF_VOLTAGE_MV) / ADC_MAX_VALUE;
        baseline_values[i] = (alpha * avg_mv) + ((1.0f - alpha) * baseline_values[i]);
    }
    
    last_baseline_update_ms = current_time;
}

SensorReading SensorManager::readAnalytes() {
    SensorReading reading;
    
    // Update baseline if needed
    baselineDriftCorrection();
    
    // Read and calibrate each channel
    uint16_t raw_serotonin = analogRead(A0);
    uint16_t raw_dopamine = analogRead(A1);
    uint16_t raw_gaba = analogRead(A2);
    uint16_t raw_ph = analogRead(A3);
    uint16_t raw_temp = analogRead(A4);
    uint16_t raw_calprotectin = analogRead(A5);
    
    // Apply calibration and convert to final units
    float serotonin_mv = applyCalibration(raw_serotonin, ADC_CHANNEL_SEROTONIN);
    float dopamine_mv = applyCalibration(raw_dopamine, ADC_CHANNEL_DOPAMINE);
    float gaba_mv = applyCalibration(raw_gaba, ADC_CHANNEL_GABA);
    float ph_mv = applyCalibration(raw_ph, ADC_CHANNEL_PH);
    float temp_mv = applyCalibration(raw_temp, ADC_CHANNEL_TEMP);
    float calprotectin_mv = applyCalibration(raw_calprotectin, ADC_CHANNEL_CALPROTECTIN);
    
    // Convert to final units
    reading.serotonin_nm = serotonin_mv * SEROTONIN_MV_TO_NM;
    reading.dopamine_nm = dopamine_mv * DOPAMINE_MV_TO_NM;
    reading.gaba_nm = gaba_mv * GABA_MV_TO_NM;
    reading.ph_level = 7.0f + (ph_mv / PH_MV_PER_PH);  // pH 7 is zero-point
    reading.temperature_c = temp_mv / TEMP_MV_PER_C;
    reading.calprotectin_ug_g = calprotectin_mv * CALPROTECTIN_MV_TO_UG;
    
    // Clamp values to valid ranges
    if (reading.serotonin_nm < SEROTONIN_MIN_NM) reading.serotonin_nm = SEROTONIN_MIN_NM;
    if (reading.serotonin_nm > SEROTONIN_MAX_NM) reading.serotonin_nm = SEROTONIN_MAX_NM;
    
    if (reading.dopamine_nm < DOPAMINE_MIN_NM) reading.dopamine_nm = DOPAMINE_MIN_NM;
    if (reading.dopamine_nm > DOPAMINE_MAX_NM) reading.dopamine_nm = DOPAMINE_MAX_NM;
    
    if (reading.gaba_nm < GABA_MIN_NM) reading.gaba_nm = GABA_MIN_NM;
    if (reading.gaba_nm > GABA_MAX_NM) reading.gaba_nm = GABA_MAX_NM;
    
    // Timestamp
    reading.timestamp_ms = millis();
    
    return reading;
}

void SensorManager::calibrate() {
    // Two-point calibration procedure
    // Assumes calibration solutions are applied externally
    
    // Step 1: Zero-point calibration (blank solution)
    delay(5000);  // Wait for solution to stabilize
    
    const int num_samples = 50;
    float zero_sum[6] = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f};
    
    for (int i = 0; i < num_samples; i++) {
        zero_sum[0] += analogRead(A0);
        zero_sum[1] += analogRead(A1);
        zero_sum[2] += analogRead(A2);
        zero_sum[3] += analogRead(A3);
        zero_sum[4] += analogRead(A4);
        zero_sum[5] += analogRead(A5);
        delay(10);
    }
    
    // Store zero-point offsets
    for (int i = 0; i < 6; i++) {
        float avg_raw = zero_sum[i] / num_samples;
        calibration_offset[i] = (avg_raw * ADC_REF_VOLTAGE_MV) / ADC_MAX_VALUE;
    }
    
    // Reset baseline values after calibration
    for (int i = 0; i < 6; i++) {
        baseline_values[i] = 0.0f;
    }
    last_baseline_update_ms = millis();
}

bool SensorManager::selfTest() {
    bool all_passed = true;
    
    // Test 1: Verify ADC is responsive (readings should not be stuck at 0 or max)
    for (int channel = 0; channel < 6; channel++) {
        uint16_t reading = analogRead(A0 + channel);
        if (reading == 0 || reading == ADC_MAX_VALUE) {
            // Sensor may be disconnected or shorted
            all_passed = false;
        }
    }
    
    // Test 2: Check for reasonable noise levels
    const int noise_samples = 20;
    for (int channel = 0; channel < 6; channel++) {
        uint16_t min_val = ADC_MAX_VALUE;
        uint16_t max_val = 0;
        
        for (int i = 0; i < noise_samples; i++) {
            uint16_t reading = analogRead(A0 + channel);
            if (reading < min_val) min_val = reading;
            if (reading > max_val) max_val = reading;
            delayMicroseconds(100);
        }
        
        // Noise should be less than 5% of range
        uint16_t noise = max_val - min_val;
        if (noise > (ADC_MAX_VALUE * 0.05)) {
            all_passed = false;
        }
    }
    
    // Test 3: Verify temperature sensor is in reasonable range (-10°C to 50°C)
    uint16_t temp_raw = analogRead(A4);
    float temp_mv = (temp_raw * ADC_REF_VOLTAGE_MV) / (float)ADC_MAX_VALUE;
    float temp_c = temp_mv / TEMP_MV_PER_C;
    if (temp_c < -10.0f || temp_c > 50.0f) {
        all_passed = false;
    }
    
    return all_passed;
}

