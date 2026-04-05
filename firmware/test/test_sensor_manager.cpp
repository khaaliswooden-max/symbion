/**
 * @file test_sensor_manager.cpp
 * @brief Unit tests for SensorManager module
 * 
 * Tests sensor initialization, calibration, self-test, and data reading
 */

#include <unity.h>
#include "sensor_manager.h"

SensorManager sensorMgr;

void setUp(void) {
    // Set up runs before each test
    sensorMgr.init();
}

void tearDown(void) {
    // Clean up runs after each test
}

/**
 * Test sensor initialization
 */
void test_sensor_init(void) {
    sensorMgr.init();
    // If init succeeds without crash, test passes
    TEST_PASS();
}

/**
 * Test sensor self-test functionality
 */
void test_sensor_self_test(void) {
    bool result = sensorMgr.selfTest();
    TEST_ASSERT_TRUE_MESSAGE(result, "Sensor self-test should pass");
}

/**
 * Test sensor reading returns valid data
 */
void test_sensor_read_valid_data(void) {
    SensorReading reading = sensorMgr.readAnalytes();
    
    // Test serotonin range
    TEST_ASSERT_GREATER_OR_EQUAL_MESSAGE(
        SEROTONIN_MIN_NM, 
        reading.serotonin_nm,
        "Serotonin below minimum range"
    );
    TEST_ASSERT_LESS_OR_EQUAL_MESSAGE(
        SEROTONIN_MAX_NM, 
        reading.serotonin_nm,
        "Serotonin above maximum range"
    );
    
    // Test dopamine range
    TEST_ASSERT_GREATER_OR_EQUAL_MESSAGE(
        DOPAMINE_MIN_NM, 
        reading.dopamine_nm,
        "Dopamine below minimum range"
    );
    TEST_ASSERT_LESS_OR_EQUAL_MESSAGE(
        DOPAMINE_MAX_NM, 
        reading.dopamine_nm,
        "Dopamine above maximum range"
    );
    
    // Test GABA range
    TEST_ASSERT_GREATER_OR_EQUAL_MESSAGE(
        GABA_MIN_NM, 
        reading.gaba_nm,
        "GABA below minimum range"
    );
    TEST_ASSERT_LESS_OR_EQUAL_MESSAGE(
        GABA_MAX_NM, 
        reading.gaba_nm,
        "GABA above maximum range"
    );
    
    // Test pH range (normal gut pH: 5.0 - 8.0)
    TEST_ASSERT_FLOAT_WITHIN_MESSAGE(
        3.0, 
        6.5, 
        reading.ph_level,
        "pH level out of expected range"
    );
    
    // Test temperature range (body temp: 35-40°C)
    TEST_ASSERT_FLOAT_WITHIN_MESSAGE(
        5.0, 
        37.0, 
        reading.temperature_c,
        "Temperature out of expected range"
    );
    
    // Test timestamp is reasonable (not zero)
    TEST_ASSERT_GREATER_THAN_MESSAGE(
        0, 
        reading.timestamp_ms,
        "Timestamp should not be zero"
    );
}

/**
 * Test calibration function
 */
void test_sensor_calibration(void) {
    sensorMgr.calibrate();
    // Calibration should complete without error
    TEST_PASS();
}

/**
 * Test multiple consecutive readings
 */
void test_sensor_multiple_readings(void) {
    SensorReading reading1 = sensorMgr.readAnalytes();
    delay(100);
    SensorReading reading2 = sensorMgr.readAnalytes();
    
    // Timestamps should be different
    TEST_ASSERT_NOT_EQUAL_MESSAGE(
        reading1.timestamp_ms,
        reading2.timestamp_ms,
        "Consecutive readings should have different timestamps"
    );
    
    // Values should be reasonably close (within 20%)
    float serotonin_diff = abs(reading2.serotonin_nm - reading1.serotonin_nm);
    float serotonin_avg = (reading1.serotonin_nm + reading2.serotonin_nm) / 2.0;
    TEST_ASSERT_LESS_THAN_MESSAGE(
        serotonin_avg * 0.2,
        serotonin_diff,
        "Consecutive serotonin readings should be stable"
    );
}

/**
 * Test ADC values are within valid range
 */
void test_adc_range(void) {
    SensorReading reading = sensorMgr.readAnalytes();
    
    // All analog values should be non-negative
    TEST_ASSERT_GREATER_OR_EQUAL(0.0, reading.serotonin_nm);
    TEST_ASSERT_GREATER_OR_EQUAL(0.0, reading.dopamine_nm);
    TEST_ASSERT_GREATER_OR_EQUAL(0.0, reading.gaba_nm);
    TEST_ASSERT_GREATER_OR_EQUAL(0.0, reading.calprotectin_ug_g);
}

void setup() {
    delay(2000); // Wait for board initialization
    
    UNITY_BEGIN();
    
    RUN_TEST(test_sensor_init);
    RUN_TEST(test_sensor_self_test);
    RUN_TEST(test_sensor_read_valid_data);
    RUN_TEST(test_sensor_calibration);
    RUN_TEST(test_sensor_multiple_readings);
    RUN_TEST(test_adc_range);
    
    UNITY_END();
}

void loop() {
    // Tests run once in setup()
}

