/**
 * @file test_signal_processing.cpp
 * @brief Unit tests for SignalProcessor module
 * 
 * Tests filtering algorithms, Kalman filter, and delta encoding
 */

#include <unity.h>
#include "signal_processing.h"
#include <math.h>

SignalProcessor sigProc;

void setUp(void) {
    // Set up runs before each test
}

void tearDown(void) {
    // Clean up runs after each test
}

/**
 * Test Butterworth filter initialization
 */
void test_butterworth_init(void) {
    FilterState state = {0};
    float output = sigProc.butterworthFilter(100.0, &state);
    TEST_ASSERT_NOT_EQUAL(0.0, output);
}

/**
 * Test Butterworth filter smoothing
 */
void test_butterworth_smoothing(void) {
    FilterState state = {0};
    
    // Feed constant signal
    float constant = 100.0;
    float output = 0.0;
    
    for (int i = 0; i < 50; i++) {
        output = sigProc.butterworthFilter(constant, &state);
    }
    
    // After many samples, output should converge to input
    TEST_ASSERT_FLOAT_WITHIN_MESSAGE(
        5.0, 
        constant, 
        output,
        "Filter output should converge to constant input"
    );
}

/**
 * Test Butterworth filter noise reduction
 */
void test_butterworth_noise_reduction(void) {
    FilterState state = {0};
    
    // Signal with noise
    float baseline = 100.0;
    float filtered_values[10];
    
    for (int i = 0; i < 10; i++) {
        float noisy = baseline + (random(-10, 10));
        filtered_values[i] = sigProc.butterworthFilter(noisy, &state);
    }
    
    // Calculate variance of filtered signal
    float mean = 0;
    for (int i = 0; i < 10; i++) {
        mean += filtered_values[i];
    }
    mean /= 10;
    
    float variance = 0;
    for (int i = 0; i < 10; i++) {
        variance += pow(filtered_values[i] - mean, 2);
    }
    variance /= 10;
    
    // Variance should be relatively small (filter working)
    TEST_ASSERT_LESS_THAN_MESSAGE(
        100.0,
        variance,
        "Filter should reduce noise variance"
    );
}

/**
 * Test Kalman filter initialization
 */
void test_kalman_init(void) {
    KalmanState state = {
        .x = 0.0,
        .p = 1.0,
        .q = 0.01,
        .r = 0.1
    };
    
    float output = sigProc.kalmanFilter(100.0, &state);
    TEST_ASSERT_FLOAT_WITHIN(50.0, 100.0, output);
}

/**
 * Test Kalman filter tracking
 */
void test_kalman_tracking(void) {
    KalmanState state = {
        .x = 0.0,
        .p = 1.0,
        .q = 0.01,
        .r = 0.1
    };
    
    float target = 150.0;
    float output = 0.0;
    
    // Feed constant measurement
    for (int i = 0; i < 20; i++) {
        output = sigProc.kalmanFilter(target, &state);
    }
    
    // Should converge to target
    TEST_ASSERT_FLOAT_WITHIN_MESSAGE(
        10.0,
        target,
        output,
        "Kalman filter should track constant measurement"
    );
}

/**
 * Test delta encoding compression
 */
void test_delta_encoding(void) {
    const uint8_t COUNT = 10;
    SensorReading readings[COUNT];
    uint8_t buffer[512];
    
    // Generate test data with small variations
    for (uint8_t i = 0; i < COUNT; i++) {
        readings[i].serotonin_nm = 1000.0 + i * 5.0;
        readings[i].dopamine_nm = 500.0 + i * 2.0;
        readings[i].gaba_nm = 2000.0 + i * 10.0;
        readings[i].ph_level = 6.5;
        readings[i].temperature_c = 37.0;
        readings[i].calprotectin_ug_g = 50.0;
        readings[i].timestamp_ms = i * 1000;
    }
    
    uint16_t encoded_size = sigProc.deltaEncode(readings, buffer, COUNT);
    
    // Encoded size should be less than raw size
    uint16_t raw_size = COUNT * sizeof(SensorReading);
    TEST_ASSERT_LESS_THAN_MESSAGE(
        raw_size,
        encoded_size,
        "Delta encoding should compress data"
    );
    
    // Should achieve at least 2:1 compression
    TEST_ASSERT_LESS_OR_EQUAL_MESSAGE(
        raw_size / 2,
        encoded_size,
        "Should achieve at least 2:1 compression ratio"
    );
}

/**
 * Test delta encoding with identical readings
 */
void test_delta_encoding_identical(void) {
    const uint8_t COUNT = 5;
    SensorReading readings[COUNT];
    uint8_t buffer[512];
    
    // All identical readings
    for (uint8_t i = 0; i < COUNT; i++) {
        readings[i].serotonin_nm = 1000.0;
        readings[i].dopamine_nm = 500.0;
        readings[i].gaba_nm = 2000.0;
        readings[i].ph_level = 6.5;
        readings[i].temperature_c = 37.0;
        readings[i].calprotectin_ug_g = 50.0;
        readings[i].timestamp_ms = i * 1000;
    }
    
    uint16_t encoded_size = sigProc.deltaEncode(readings, buffer, COUNT);
    
    // Should compress very well (all deltas are zero)
    uint16_t raw_size = COUNT * sizeof(SensorReading);
    TEST_ASSERT_LESS_THAN_MESSAGE(
        raw_size / 3,
        encoded_size,
        "Identical readings should compress to < 1/3 original size"
    );
}

/**
 * Test filter state persistence
 */
void test_filter_state_persistence(void) {
    FilterState state1 = {0};
    FilterState state2 = {0};
    
    // Process same sequence with two filters
    float input = 100.0;
    float out1 = sigProc.butterworthFilter(input, &state1);
    float out2 = sigProc.butterworthFilter(input, &state2);
    
    // Outputs should be identical
    TEST_ASSERT_EQUAL_FLOAT(out1, out2);
    
    // Process second input only on state1
    input = 105.0;
    out1 = sigProc.butterworthFilter(input, &state1);
    
    // Now state2 processes the second input
    out2 = sigProc.butterworthFilter(input, &state2);
    
    // Outputs should still match (same sequence)
    TEST_ASSERT_EQUAL_FLOAT(out1, out2);
}

void setup() {
    delay(2000);
    
    UNITY_BEGIN();
    
    RUN_TEST(test_butterworth_init);
    RUN_TEST(test_butterworth_smoothing);
    RUN_TEST(test_butterworth_noise_reduction);
    RUN_TEST(test_kalman_init);
    RUN_TEST(test_kalman_tracking);
    RUN_TEST(test_delta_encoding);
    RUN_TEST(test_delta_encoding_identical);
    RUN_TEST(test_filter_state_persistence);
    
    UNITY_END();
}

void loop() {
    // Tests run once in setup()
}

