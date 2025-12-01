/**
 * @file test_aes.cpp
 * @brief Unit tests for AES-128 encryption module
 * 
 * Tests encryption, decryption, and CBC mode
 */

#include <unity.h>
#include "aes.h"
#include <string.h>

void setUp(void) {
    // Set up runs before each test
}

void tearDown(void) {
    // Clean up runs after each test
}

/**
 * Test AES-128 encryption/decryption round trip
 */
void test_aes_encrypt_decrypt(void) {
    uint8_t key[16] = {
        0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
        0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c
    };
    
    uint8_t iv[16] = {
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f
    };
    
    const char* plaintext = "Hello Symbion!!"; // 16 bytes
    uint8_t encrypted[16];
    uint8_t decrypted[16];
    
    // Encrypt
    aes128_encrypt((uint8_t*)plaintext, encrypted, key, iv);
    
    // Decrypt
    aes128_decrypt(encrypted, decrypted, key, iv);
    
    // Should match original
    TEST_ASSERT_EQUAL_STRING_LEN_MESSAGE(
        plaintext,
        (char*)decrypted,
        16,
        "Decrypted text should match original plaintext"
    );
}

/**
 * Test AES encryption produces different output than input
 */
void test_aes_encryption_changes_data(void) {
    uint8_t key[16] = {
        0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
        0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c
    };
    
    uint8_t iv[16] = {0};
    
    uint8_t plaintext[16] = "Test Data 123456";
    uint8_t encrypted[16];
    
    aes128_encrypt(plaintext, encrypted, key, iv);
    
    // Encrypted should be different from plaintext
    int different = memcmp(plaintext, encrypted, 16);
    TEST_ASSERT_NOT_EQUAL_MESSAGE(
        0,
        different,
        "Encrypted data should differ from plaintext"
    );
}

/**
 * Test AES with different IVs produces different ciphertexts
 */
void test_aes_different_iv(void) {
    uint8_t key[16] = {
        0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
        0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c
    };
    
    uint8_t iv1[16] = {0};
    uint8_t iv2[16] = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1};
    
    uint8_t plaintext[16] = "Same Plain Text!";
    uint8_t encrypted1[16];
    uint8_t encrypted2[16];
    
    aes128_encrypt(plaintext, encrypted1, key, iv1);
    aes128_encrypt(plaintext, encrypted2, key, iv2);
    
    // Different IVs should produce different ciphertexts
    int different = memcmp(encrypted1, encrypted2, 16);
    TEST_ASSERT_NOT_EQUAL_MESSAGE(
        0,
        different,
        "Different IVs should produce different ciphertexts"
    );
}

/**
 * Test AES with multiple blocks
 */
void test_aes_multiple_blocks(void) {
    uint8_t key[16] = {
        0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
        0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c
    };
    
    uint8_t iv[16] = {0};
    
    const char* plaintext = "This is 32 bytes of test data!!"; // 32 bytes
    uint8_t encrypted[32];
    uint8_t decrypted[32];
    
    // Encrypt
    aes128_encrypt((uint8_t*)plaintext, encrypted, key, iv);
    aes128_encrypt((uint8_t*)plaintext + 16, encrypted + 16, key, iv);
    
    // Decrypt
    aes128_decrypt(encrypted, decrypted, key, iv);
    aes128_decrypt(encrypted + 16, decrypted + 16, key, iv);
    
    // Should match original
    TEST_ASSERT_EQUAL_STRING_LEN_MESSAGE(
        plaintext,
        (char*)decrypted,
        32,
        "Multi-block decryption should match original"
    );
}

/**
 * Test AES with all zeros
 */
void test_aes_all_zeros(void) {
    uint8_t key[16] = {0};
    uint8_t iv[16] = {0};
    uint8_t plaintext[16] = {0};
    uint8_t encrypted[16];
    uint8_t decrypted[16];
    
    aes128_encrypt(plaintext, encrypted, key, iv);
    aes128_decrypt(encrypted, decrypted, key, iv);
    
    TEST_ASSERT_EQUAL_MEMORY_MESSAGE(
        plaintext,
        decrypted,
        16,
        "All-zero encryption/decryption should work"
    );
}

/**
 * Test AES with all ones
 */
void test_aes_all_ones(void) {
    uint8_t key[16];
    uint8_t iv[16];
    uint8_t plaintext[16];
    memset(key, 0xFF, 16);
    memset(iv, 0xFF, 16);
    memset(plaintext, 0xFF, 16);
    
    uint8_t encrypted[16];
    uint8_t decrypted[16];
    
    aes128_encrypt(plaintext, encrypted, key, iv);
    aes128_decrypt(encrypted, decrypted, key, iv);
    
    TEST_ASSERT_EQUAL_MEMORY_MESSAGE(
        plaintext,
        decrypted,
        16,
        "All-ones encryption/decryption should work"
    );
}

/**
 * Test sensor data encryption
 */
void test_aes_sensor_data_encryption(void) {
    uint8_t key[16] = {
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
        0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10
    };
    uint8_t iv[16] = {0};
    
    // Simulate sensor reading (28 bytes, pad to 32)
    struct {
        float serotonin;
        float dopamine;
        float gaba;
        float ph;
        float temp;
        float calprotectin;
        uint32_t timestamp;
    } sensor_data = {
        1000.5, 500.3, 2000.7, 6.5, 37.0, 50.2, 12345
    };
    
    uint8_t plaintext[32];
    memcpy(plaintext, &sensor_data, sizeof(sensor_data));
    memset(plaintext + sizeof(sensor_data), 0, 32 - sizeof(sensor_data)); // Pad
    
    uint8_t encrypted[32];
    uint8_t decrypted[32];
    
    // Encrypt both blocks
    aes128_encrypt(plaintext, encrypted, key, iv);
    aes128_encrypt(plaintext + 16, encrypted + 16, key, iv);
    
    // Decrypt both blocks
    aes128_decrypt(encrypted, decrypted, key, iv);
    aes128_decrypt(encrypted + 16, decrypted + 16, key, iv);
    
    // Verify data integrity
    TEST_ASSERT_EQUAL_MEMORY_MESSAGE(
        plaintext,
        decrypted,
        32,
        "Sensor data should survive encryption/decryption"
    );
}

void setup() {
    delay(2000);
    
    UNITY_BEGIN();
    
    RUN_TEST(test_aes_encrypt_decrypt);
    RUN_TEST(test_aes_encryption_changes_data);
    RUN_TEST(test_aes_different_iv);
    RUN_TEST(test_aes_multiple_blocks);
    RUN_TEST(test_aes_all_zeros);
    RUN_TEST(test_aes_all_ones);
    RUN_TEST(test_aes_sensor_data_encryption);
    
    UNITY_END();
}

void loop() {
    // Tests run once in setup()
}

