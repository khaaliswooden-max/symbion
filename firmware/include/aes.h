// firmware/include/aes.h

#ifndef AES_H
#define AES_H

#include <stdint.h>

// AES-128 block size
#define AES_BLOCK_SIZE 16

// Key schedule structure
typedef struct {
    uint8_t round_keys[176];  // 11 round keys for AES-128
} AESContext;

// Core AES functions
void aes128_init(AESContext* ctx, const uint8_t* key);
void aes128_encrypt_block(const AESContext* ctx, const uint8_t* input, uint8_t* output);
void aes128_decrypt_block(const AESContext* ctx, const uint8_t* input, uint8_t* output);

// High-level encryption (CBC mode with PKCS7 padding)
uint16_t aes128_encrypt(const uint8_t* plaintext, uint8_t* ciphertext, 
                        const uint8_t* key, uint16_t length);
uint16_t aes128_decrypt(const uint8_t* ciphertext, uint8_t* plaintext,
                        const uint8_t* key, uint16_t length);

// Utility functions
void aes_generate_iv(uint8_t* iv);
uint16_t aes_padded_length(uint16_t length);

#endif

