// firmware/src/signal_processing.cpp

#include "signal_processing.h"
#include <math.h>
#include <string.h>

// Butterworth low-pass filter coefficients (2nd order, fc=0.05Hz)
const float b0 = 0.0201, b1 = 0.0402, b2 = 0.0201;
const float a1 = -1.5610, a2 = 0.6414;

float SignalProcessor::butterworthFilter(float input, FilterState* state) {
    float output = b0 * input + b1 * state->x1 + b2 * state->x2
                   - a1 * state->y1 - a2 * state->y2;
    
    // Update state
    state->x2 = state->x1;
    state->x1 = input;
    state->y2 = state->y1;
    state->y1 = output;
    
    return output;
}

// Kalman filter for noise reduction
float SignalProcessor::kalmanFilter(float measurement, KalmanState* state) {
    // Prediction
    state->p = state->p + state->q;
    
    // Update
    float k = state->p / (state->p + state->r);
    state->x = state->x + k * (measurement - state->x);
    state->p = (1 - k) * state->p;
    
    return state->x;
}

// Delta encoding for compression (4:1 ratio target)
uint16_t SignalProcessor::deltaEncode(SensorReading* readings, uint8_t* buffer, uint16_t count) {
    uint16_t bytes_written = 0;
    SensorReading baseline = readings[0];
    
    // Store baseline (full precision)
    memcpy(buffer, &baseline, sizeof(SensorReading));
    bytes_written += sizeof(SensorReading);
    
    // Store deltas (reduced precision)
    for(uint16_t i = 1; i < count; i++) {
        int16_t delta_5ht = (int16_t)((readings[i].serotonin_nm - baseline.serotonin_nm) * 10);
        int16_t delta_da = (int16_t)((readings[i].dopamine_nm - baseline.dopamine_nm) * 10);
        
        buffer[bytes_written++] = (delta_5ht >> 8) & 0xFF;
        buffer[bytes_written++] = delta_5ht & 0xFF;
        buffer[bytes_written++] = (delta_da >> 8) & 0xFF;
        buffer[bytes_written++] = delta_da & 0xFF;
    }
    
    return bytes_written;
}

// State initialization helpers
void SignalProcessor::initFilterState(FilterState* state) {
    state->x1 = 0.0f;
    state->x2 = 0.0f;
    state->y1 = 0.0f;
    state->y2 = 0.0f;
}

void SignalProcessor::initKalmanState(KalmanState* state, float initial_value, float q, float r) {
    state->x = initial_value;
    state->p = 1.0f;
    state->q = q;
    state->r = r;
}

