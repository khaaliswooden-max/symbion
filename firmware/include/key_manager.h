#ifndef KEY_MANAGER_H
#define KEY_MANAGER_H

#include <stdint.h>

// Key provisioning states
#define KEY_STATE_UNPROVISIONED  0
#define KEY_STATE_PROVISIONING   1
#define KEY_STATE_PROVISIONED    2

// BLE key exchange command
#define CMD_SET_KEY             0x06

// ECDH-like simple key derivation for BLE pairing
// In production, use nRF52 CryptoCell CC310 for true ECDH
class KeyManager {
public:
    void init();

    // Check if device has a provisioned key
    bool isProvisioned();

    // Get current encryption key (returns false if not provisioned)
    bool getKey(uint8_t* keyOut);

    // Provision a new key via BLE secure channel
    // key must be 16 bytes (AES-128)
    bool provisionKey(const uint8_t* key, uint8_t keyLen);

    // Derive a session key from the provisioned master key and a nonce
    // This provides forward secrecy per-session
    void deriveSessionKey(uint8_t* sessionKeyOut, const uint8_t* nonce, uint8_t nonceLen);

    // Wipe all key material (factory reset)
    void wipeKeys();

    // Generate a random nonce for session key derivation
    void generateNonce(uint8_t* nonce, uint8_t len);

private:
    uint8_t masterKey[16];
    uint8_t sessionKey[16];
    uint8_t keyState;

    // Persist key to non-volatile storage (nRF52 flash)
    void saveToFlash();
    void loadFromFlash();

    // Simple key derivation: HMAC-like construction
    void kdf(uint8_t* output, const uint8_t* key, const uint8_t* data, uint8_t dataLen);
};

#endif
