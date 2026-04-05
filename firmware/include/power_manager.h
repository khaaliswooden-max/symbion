// firmware/include/power_manager.h

#ifndef POWER_MANAGER_H
#define POWER_MANAGER_H

#include <stdint.h>

// Wake source pin
#define SENSOR_TRIGGER_PIN  12

// Battery thresholds (mV)
#define BATTERY_FULL_MV     4200
#define BATTERY_LOW_MV      3300
#define BATTERY_CRITICAL_MV 3000

// Load level thresholds
#define LOAD_LEVEL_LOW      25
#define LOAD_LEVEL_MEDIUM   75

// Power modes
typedef enum {
    POWER_MODE_ACTIVE,      // Full performance
    POWER_MODE_LOW_POWER,   // Reduced clock, DCDC enabled
    POWER_MODE_SLEEP,       // System OFF (<1μW)
} PowerMode;

// Battery status
typedef struct {
    float voltage_v;
    uint8_t percentage;
    bool is_charging;
    bool is_critical;
} BatteryStatus;

class PowerManager {
public:
    void init();
    
    // Sleep and wake management
    void enterSleepMode();
    void configureWakeSources();
    
    // Dynamic power scaling
    void dynamicVoltageScaling(uint8_t load_level);
    void setPerformanceMode(PowerMode mode);
    
    // Battery management
    float measureBatteryVoltage();
    BatteryStatus getBatteryStatus();
    uint8_t calculateBatteryPercentage(float voltage);
    
    // Power optimization
    void disableUnusedPeripherals();
    void enablePeripheral(uint8_t peripheral_id);
    
    // Current monitoring
    float estimatePowerConsumption();
    
private:
    PowerMode current_mode;
    int16_t readADC();
};

#endif

