// firmware/include/sensor_manager.h

#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include <stdint.h>

// Analyte detection ranges
#define SEROTONIN_MIN_NM 10
#define SEROTONIN_MAX_NM 10000
#define DOPAMINE_MIN_NM 50
#define DOPAMINE_MAX_NM 5000
#define GABA_MIN_NM 100
#define GABA_MAX_NM 50000

typedef struct {
    float serotonin_nm;
    float dopamine_nm;
    float gaba_nm;
    float ph_level;
    float temperature_c;
    float calprotectin_ug_g;
    uint32_t timestamp_ms;
} SensorReading;

class SensorManager {
public:
    void init();
    SensorReading readAnalytes();
    void calibrate();
    bool selfTest();
private:
    void configureADC();
    float applyCalibration(uint16_t raw_value, uint8_t channel);
    void baselineDriftCorrection();
};

#endif

