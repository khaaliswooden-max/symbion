// firmware/include/signal_processing.h

#ifndef SIGNAL_PROCESSING_H
#define SIGNAL_PROCESSING_H

#include <stdint.h>
#include "sensor_manager.h"

// Butterworth filter state (2nd order IIR)
typedef struct {
    float x1;  // Input delay 1
    float x2;  // Input delay 2
    float y1;  // Output delay 1
    float y2;  // Output delay 2
} FilterState;

// Kalman filter state
typedef struct {
    float x;   // State estimate
    float p;   // Estimation error covariance
    float q;   // Process noise covariance
    float r;   // Measurement noise covariance
} KalmanState;

class SignalProcessor {
public:
    // Low-pass filtering
    float butterworthFilter(float input, FilterState* state);
    
    // Noise reduction
    float kalmanFilter(float measurement, KalmanState* state);
    
    // Data compression
    uint16_t deltaEncode(SensorReading* readings, uint8_t* buffer, uint16_t count);
    
    // State initialization helpers
    static void initFilterState(FilterState* state);
    static void initKalmanState(KalmanState* state, float initial_value, float q, float r);
};

#endif

