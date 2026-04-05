#include "key_manager.h"
#include "aes.h"
#include <Arduino.h>
#include <string.h>

// Simulated NVM address for key storage
// On real nRF52, use nrf_nvmc or FDS (Flash Data Storage)
static uint8_t nvm_key_storage[16] = {0};
static bool nvm_has_key = false;

void KeyManager::init() {
    memset(masterKey, 0, 16);
    memset(sessionKey, 0, 16);
    keyState = KEY_STATE_UNPROVISIONED;

    // Try to load persisted key from flash
    loadFromFlash();
}

bool KeyManager::isProvisioned() {
    return keyState == KEY_STATE_PROVISIONED;
}

bool KeyManager::getKey(uint8_t* keyOut) {
    if (keyState != KEY_STATE_PROVISIONED) return false;
    memcpy(keyOut, sessionKey, 16);
    return true;
}

bool KeyManager::provisionKey(const uint8_t* key, uint8_t keyLen) {
    if (keyLen != 16) {
        Serial.println("Key provisioning failed: invalid key length");
        return false;
    }

    keyState = KEY_STATE_PROVISIONING;

    // Store as master key
    memcpy(masterKey, key, 16);

    // Generate initial session key from master key
    uint8_t initNonce[8];
    generateNonce(initNonce, 8);
    deriveSessionKey(sessionKey, initNonce, 8);

    keyState = KEY_STATE_PROVISIONED;

    // Persist to non-volatile storage
    saveToFlash();

    Serial.println("Key provisioned successfully");
    return true;
}

void KeyManager::deriveSessionKey(uint8_t* sessionKeyOut, const uint8_t* nonce, uint8_t nonceLen) {
    kdf(sessionKeyOut, masterKey, nonce, nonceLen);
    // Also update internal session key
    memcpy(sessionKey, sessionKeyOut, 16);
}

void KeyManager::wipeKeys() {
    memset(masterKey, 0, 16);
    memset(sessionKey, 0, 16);
    keyState = KEY_STATE_UNPROVISIONED;

    // Clear NVM
    memset(nvm_key_storage, 0, 16);
    nvm_has_key = false;

    Serial.println("All keys wiped");
}

void KeyManager::generateNonce(uint8_t* nonce, uint8_t len) {
    // Use millis() and analogRead() entropy sources
    // On real nRF52, use nrf_rng for hardware RNG
    uint32_t seed = millis();
    for (uint8_t i = 0; i < len; i++) {
        seed ^= (analogRead(A0) & 0xFF);
        seed = seed * 1103515245 + 12345;
        nonce[i] = (seed >> 16) & 0xFF;
    }
}

void KeyManager::saveToFlash() {
    // Simulated flash storage
    // On real nRF52: use nrf_nvmc_write_bytes() or FDS
    memcpy(nvm_key_storage, masterKey, 16);
    nvm_has_key = true;
}

void KeyManager::loadFromFlash() {
    // Simulated flash read
    if (nvm_has_key) {
        memcpy(masterKey, nvm_key_storage, 16);

        // Derive session key from stored master key
        uint8_t nonce[8];
        generateNonce(nonce, 8);
        deriveSessionKey(sessionKey, nonce, 8);

        keyState = KEY_STATE_PROVISIONED;
        Serial.println("Loaded encryption key from flash");
    }
}

void KeyManager::kdf(uint8_t* output, const uint8_t* key, const uint8_t* data, uint8_t dataLen) {
    // Simple HMAC-like KDF using AES as the compression function
    // KDF(key, data) = AES(key, pad(data)) XOR pad(data)
    uint8_t padded[16] = {0};
    uint8_t encrypted[16];

    // Copy data into padded block
    uint8_t copyLen = dataLen < 16 ? dataLen : 16;
    memcpy(padded, data, copyLen);

    // Add a counter byte for domain separation
    padded[15] = 0x01;

    // Encrypt with AES
    AESContext ctx;
    aes128_init(&ctx, key);
    aes128_encrypt_block(&ctx, padded, encrypted);

    // XOR with padded input
    for (int i = 0; i < 16; i++) {
        output[i] = encrypted[i] ^ padded[i];
    }
}
