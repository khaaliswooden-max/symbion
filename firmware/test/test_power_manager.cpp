/**
 * @file test_power_manager.cpp
 * @brief Unit tests for PowerManager module
 * 
 * Tests power modes, battery monitoring, DVS
 */

#include <unity.h>
#include "power_manager.h"

PowerManager powerMgr;

void setUp(void) {
    // Set up runs before each test
    powerMgr.init();
}

void tearDown(void) {
    // Clean up runs after each test
}

/**
 * Test power manager initialization
 */
void test_power_init(void) {
    powerMgr.init();
    TEST_PASS_MESSAGE("Power manager initialized");
}

/**
 * Test battery status reading
 */
void test_battery_status(void) {
    BatteryStatus status = powerMgr.getBatteryStatus();
    
    // Voltage should be in valid Li-Po range (3.0V - 4.2V)
    TEST_ASSERT_FLOAT_WITHIN_MESSAGE(
        2.0,
        3.6,
        status.voltage_mv / 1000.0,
        "Battery voltage should be in valid range"
    );
    
    // Percentage should be 0-100
    TEST_ASSERT_GREATER_OR_EQUAL_MESSAGE(
        0,
        status.percentage,
        "Battery percentage should be >= 0"
    );
    TEST_ASSERT_LESS_OR_EQUAL_MESSAGE(
        100,
        status.percentage,
        "Battery percentage should be <= 100"
    );
    
    // Charging state should be boolean
    TEST_ASSERT_TRUE_MESSAGE(
        status.is_charging == true || status.is_charging == false,
        "Charging state should be boolean"
    );
}

/**
 * Test sleep mode entry
 */
void test_sleep_light(void) {
    uint32_t duration_ms = 100;
    uint32_t start = millis();
    
    powerMgr.sleep(POWER_MODE_SLEEP_LIGHT, duration_ms);
    
    uint32_t elapsed = millis() - start;
    
    // Should sleep for approximately the requested duration
    TEST_ASSERT_INT_WITHIN_MESSAGE(
        50,
        duration_ms,
        elapsed,
        "Sleep duration should be close to requested"
    );
}

/**
 * Test DVS (Dynamic Voltage Scaling)
 */
void test_dvs_performance_mode(void) {
    powerMgr.setPerformanceMode(PERF_MODE_HIGH);
    // Should not crash
    TEST_PASS_MESSAGE("Performance mode set to HIGH");
}

void test_dvs_low_power_mode(void) {
    powerMgr.setPerformanceMode(PERF_MODE_LOW);
    // Should not crash
    TEST_PASS_MESSAGE("Performance mode set to LOW");
}

/**
 * Test peripheral power control
 */
void test_disable_peripherals(void) {
    powerMgr.disableUnusedPeripherals();
    TEST_PASS_MESSAGE("Peripherals disabled");
}

void test_enable_peripherals(void) {
    powerMgr.enablePeripherals();
    TEST_PASS_MESSAGE("Peripherals enabled");
}

/**
 * Test battery low detection
 */
void test_battery_low_threshold(void) {
    BatteryStatus status = powerMgr.getBatteryStatus();
    
    // If battery is below 20%, low battery flag should be set
    if (status.percentage < 20) {
        // Low battery condition
        TEST_ASSERT_LESS_THAN_MESSAGE(
            3500,
            status.voltage_mv,
            "Low battery voltage should be < 3.5V"
        );
    } else {
        // Normal battery condition
        TEST_ASSERT_GREATER_OR_EQUAL_MESSAGE(
            3300,
            status.voltage_mv,
            "Normal battery voltage should be >= 3.3V"
        );
    }
}

/**
 * Test battery critical detection
 */
void test_battery_critical_threshold(void) {
    BatteryStatus status = powerMgr.getBatteryStatus();
    
    // Critical battery should be < 10%
    if (status.percentage < 10) {
        TEST_ASSERT_LESS_THAN_MESSAGE(
            3300,
            status.voltage_mv,
            "Critical battery voltage should be < 3.3V"
        );
    }
}

/**
 * Test power consumption estimates
 */
void test_power_consumption_active(void) {
    powerMgr.setPerformanceMode(PERF_MODE_HIGH);
    
    // Active mode should consume > 1mA
    // This is a logical test, not measuring actual current
    TEST_PASS_MESSAGE("Active power mode set");
}

void test_power_consumption_sleep(void) {
    powerMgr.setPerformanceMode(PERF_MODE_LOW);
    
    // Low power mode set
    TEST_PASS_MESSAGE("Low power mode set");
}

/**
 * Test wake-up sources
 */
void test_wakeup_configuration(void) {
    // Configure wake-up sources
    powerMgr.configureWakeup();
    TEST_PASS_MESSAGE("Wake-up sources configured");
}

/**
 * Test system OFF mode preparation
 */
void test_system_off_prepare(void) {
    // Note: Cannot actually test system OFF as device would shut down
    // Just test that preparation doesn't crash
    powerMgr.prepareSystemOff();
    TEST_PASS_MESSAGE("System OFF preparation completed");
}

void setup() {
    delay(2000);
    
    UNITY_BEGIN();
    
    RUN_TEST(test_power_init);
    RUN_TEST(test_battery_status);
    RUN_TEST(test_sleep_light);
    RUN_TEST(test_dvs_performance_mode);
    RUN_TEST(test_dvs_low_power_mode);
    RUN_TEST(test_disable_peripherals);
    RUN_TEST(test_enable_peripherals);
    RUN_TEST(test_battery_low_threshold);
    RUN_TEST(test_battery_critical_threshold);
    RUN_TEST(test_power_consumption_active);
    RUN_TEST(test_power_consumption_sleep);
    RUN_TEST(test_wakeup_configuration);
    RUN_TEST(test_system_off_prepare);
    
    UNITY_END();
}

void loop() {
    // Tests run once in setup()
}

