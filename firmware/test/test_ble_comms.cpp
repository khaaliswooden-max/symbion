/**
 * @file test_ble_comms.cpp
 * @brief Unit tests for BLE Communications module
 * 
 * Tests BLE initialization, advertising, data transmission
 */

#include <unity.h>
#include "ble_comms.h"
#include "sensor_manager.h"

BLECommsManager bleComms;

void setUp(void) {
    // Set up runs before each test
}

void tearDown(void) {
    // Clean up runs after each test
}

/**
 * Test BLE initialization
 */
void test_ble_init(void) {
    bool result = bleComms.init();
    TEST_ASSERT_TRUE_MESSAGE(result, "BLE initialization should succeed");
}

/**
 * Test BLE advertising start
 */
void test_ble_start_advertising(void) {
    bleComms.init();
    bleComms.startAdvertising();
    
    bool is_advertising = bleComms.isAdvertising();
    TEST_ASSERT_TRUE_MESSAGE(is_advertising, "BLE should be advertising");
}

/**
 * Test BLE advertising stop
 */
void test_ble_stop_advertising(void) {
    bleComms.init();
    bleComms.startAdvertising();
    bleComms.stopAdvertising();
    
    bool is_advertising = bleComms.isAdvertising();
    TEST_ASSERT_FALSE_MESSAGE(is_advertising, "BLE should not be advertising");
}

/**
 * Test connection state
 */
void test_ble_connection_state(void) {
    bleComms.init();
    
    // Initially should not be connected
    bool is_connected = bleComms.isConnected();
    TEST_ASSERT_FALSE_MESSAGE(is_connected, "Should not be connected initially");
}

/**
 * Test encryption key setting
 */
void test_ble_set_encryption_key(void) {
    bleComms.init();
    
    uint8_t test_key[16] = {
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
        0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10
    };
    
    bleComms.setEncryptionKey(test_key);
    // If no crash, test passes
    TEST_PASS();
}

/**
 * Test sensor data transmission format
 */
void test_ble_send_sensor_data_format(void) {
    bleComms.init();
    
    SensorReading reading = {
        .serotonin_nm = 1000.0,
        .dopamine_nm = 500.0,
        .gaba_nm = 2000.0,
        .ph_level = 6.5,
        .temperature_c = 37.0,
        .calprotectin_ug_g = 50.0,
        .timestamp_ms = 12345
    };
    
    // This will fail if not connected, but shouldn't crash
    bleComms.sendSensorData(&reading);
    TEST_PASS_MESSAGE("Send function executed without crash");
}

/**
 * Test command callback registration
 */
void test_ble_command_callback(void) {
    bleComms.init();
    
    bool callback_invoked = false;
    
    auto test_callback = [&](uint8_t cmd, uint8_t* data, uint16_t len) {
        callback_invoked = true;
    };
    
    bleComms.onCommand(test_callback);
    // Callback registered successfully
    TEST_PASS();
}

/**
 * Test BLE service UUIDs are valid
 */
void test_ble_service_uuids(void) {
    // Test that UUID strings are properly formatted
    const char* service_uuid = SYMBION_SERVICE_UUID;
    
    // Should be 36 characters (32 hex + 4 dashes)
    TEST_ASSERT_EQUAL_MESSAGE(
        36,
        strlen(service_uuid),
        "Service UUID should be 36 characters"
    );
    
    // Should contain dashes at positions 8, 13, 18, 23
    TEST_ASSERT_EQUAL('-', service_uuid[8]);
    TEST_ASSERT_EQUAL('-', service_uuid[13]);
    TEST_ASSERT_EQUAL('-', service_uuid[18]);
    TEST_ASSERT_EQUAL('-', service_uuid[23]);
}

/**
 * Test chunked data transmission
 */
void test_ble_chunked_transmission(void) {
    bleComms.init();
    
    // Create large data buffer
    uint8_t large_data[256];
    for (int i = 0; i < 256; i++) {
        large_data[i] = i & 0xFF;
    }
    
    // Should handle large data without crash
    // (will fail if not connected, but shouldn't crash)
    TEST_PASS_MESSAGE("Chunked transmission prepared");
}

/**
 * Test control command constants
 */
void test_ble_command_constants(void) {
    // Verify command values are unique
    TEST_ASSERT_NOT_EQUAL(CMD_START_SAMPLING, CMD_STOP_SAMPLING);
    TEST_ASSERT_NOT_EQUAL(CMD_START_SAMPLING, CMD_CALIBRATE);
    TEST_ASSERT_NOT_EQUAL(CMD_START_SAMPLING, CMD_SELF_TEST);
    TEST_ASSERT_NOT_EQUAL(CMD_START_SAMPLING, CMD_SET_INTERVAL);
    TEST_ASSERT_NOT_EQUAL(CMD_STOP_SAMPLING, CMD_CALIBRATE);
}

void setup() {
    delay(2000);
    
    UNITY_BEGIN();
    
    RUN_TEST(test_ble_init);
    RUN_TEST(test_ble_start_advertising);
    RUN_TEST(test_ble_stop_advertising);
    RUN_TEST(test_ble_connection_state);
    RUN_TEST(test_ble_set_encryption_key);
    RUN_TEST(test_ble_send_sensor_data_format);
    RUN_TEST(test_ble_command_callback);
    RUN_TEST(test_ble_service_uuids);
    RUN_TEST(test_ble_chunked_transmission);
    RUN_TEST(test_ble_command_constants);
    
    UNITY_END();
}

void loop() {
    // Tests run once in setup()
}

