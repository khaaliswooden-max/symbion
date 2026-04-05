// firmware/src/power_manager.cpp

#include "power_manager.h"
#include <Arduino.h>

// nRF52 specific headers
#ifdef NRF52
#include <nrf_power.h>
#include <nrf_gpio.h>
#include <nrf_saadc.h>
#include <nrf_clock.h>
extern "C" {
#include "nrf_sdm.h"
#include "nrf_soc.h"
}
#endif

// Peripheral enable flags
static uint32_t enabled_peripherals = 0xFFFFFFFF;

void PowerManager::init() {
    current_mode = POWER_MODE_ACTIVE;
    
#ifdef NRF52
    // Enable DC-DC converter for better efficiency
    sd_power_dcdc_mode_set(NRF_POWER_DCDC_ENABLE);
    
    // Configure wake sources
    configureWakeSources();
#endif
}

void PowerManager::configureWakeSources() {
#ifdef NRF52
    // Configure sensor trigger pin as wake source
    nrf_gpio_cfg_sense_input(SENSOR_TRIGGER_PIN,
                             NRF_GPIO_PIN_PULLUP,
                             NRF_GPIO_PIN_SENSE_LOW);
#endif
}

void PowerManager::enterSleepMode() {
    // Disable peripherals to minimize power
    disableUnusedPeripherals();
    
#ifdef NRF52
    // Ensure wake sources are configured
    configureWakeSources();
    
    // Enter System OFF mode (<1μW)
    sd_power_system_off();
#else
    // Fallback for non-nRF platforms
    delay(0xFFFFFFFF);
#endif
}

void PowerManager::dynamicVoltageScaling(uint8_t load_level) {
#ifdef NRF52
    if (load_level < LOAD_LEVEL_LOW) {
        // Low activity: 8MHz, 1.8V
        NRF_CLOCK->HFCLKCTRL = 0;  // 8MHz
        sd_power_dcdc_mode_set(NRF_POWER_DCDC_ENABLE);
        current_mode = POWER_MODE_LOW_POWER;
    } else if (load_level < LOAD_LEVEL_MEDIUM) {
        // Medium activity: 16MHz, 2.1V
        NRF_CLOCK->HFCLKCTRL = 1;  // 16MHz
        current_mode = POWER_MODE_ACTIVE;
    } else {
        // High activity: 64MHz, 3.0V
        NRF_CLOCK->HFCLKCTRL = 3;  // 64MHz
        current_mode = POWER_MODE_ACTIVE;
    }
#endif
}

void PowerManager::setPerformanceMode(PowerMode mode) {
    switch (mode) {
        case POWER_MODE_ACTIVE:
            dynamicVoltageScaling(100);  // Full speed
            break;
        case POWER_MODE_LOW_POWER:
            dynamicVoltageScaling(10);   // Low speed
            break;
        case POWER_MODE_SLEEP:
            enterSleepMode();
            break;
    }
    current_mode = mode;
}

int16_t PowerManager::readADC() {
    int16_t result = 0;
    
#ifdef NRF52
    // Configure SAADC for single measurement
    nrf_saadc_channel_config_t config = {
        .resistor_p = NRF_SAADC_RESISTOR_DISABLED,
        .resistor_n = NRF_SAADC_RESISTOR_DISABLED,
        .gain = NRF_SAADC_GAIN1_6,
        .reference = NRF_SAADC_REFERENCE_INTERNAL,
        .acq_time = NRF_SAADC_ACQTIME_10US,
        .mode = NRF_SAADC_MODE_SINGLE_ENDED,
        .burst = NRF_SAADC_BURST_DISABLED,
        .pin_p = NRF_SAADC_INPUT_VDD,
        .pin_n = NRF_SAADC_INPUT_DISABLED
    };
    
    nrf_saadc_channel_init(0, &config);
    nrf_saadc_enable();
    
    nrf_saadc_task_trigger(NRF_SAADC_TASK_START);
    while (!nrf_saadc_event_check(NRF_SAADC_EVENT_STARTED));
    nrf_saadc_event_clear(NRF_SAADC_EVENT_STARTED);
    
    nrf_saadc_task_trigger(NRF_SAADC_TASK_SAMPLE);
    while (!nrf_saadc_event_check(NRF_SAADC_EVENT_END));
    nrf_saadc_event_clear(NRF_SAADC_EVENT_END);
    
    result = nrf_saadc_result_get(0);
    
    nrf_saadc_task_trigger(NRF_SAADC_TASK_STOP);
    nrf_saadc_disable();
#else
    // Fallback: read from analog pin
    result = analogRead(A7);
#endif
    
    return result;
}

float PowerManager::measureBatteryVoltage() {
    int16_t result = readADC();
    
    // Convert to voltage
    // GAIN1_6 means input range is 0-3.6V
    // 10-bit result (0-1023)
    return (result * 3.6f) / 1024.0f;
}

uint8_t PowerManager::calculateBatteryPercentage(float voltage) {
    float voltage_mv = voltage * 1000.0f;
    
    if (voltage_mv >= BATTERY_FULL_MV) {
        return 100;
    } else if (voltage_mv <= BATTERY_CRITICAL_MV) {
        return 0;
    }
    
    // Linear interpolation between critical and full
    float range = BATTERY_FULL_MV - BATTERY_CRITICAL_MV;
    float level = voltage_mv - BATTERY_CRITICAL_MV;
    
    return (uint8_t)((level / range) * 100.0f);
}

BatteryStatus PowerManager::getBatteryStatus() {
    BatteryStatus status;
    
    status.voltage_v = measureBatteryVoltage();
    status.percentage = calculateBatteryPercentage(status.voltage_v);
    status.is_charging = false;  // TODO: Add charging detection
    status.is_critical = (status.voltage_v * 1000.0f) < BATTERY_CRITICAL_MV;
    
    return status;
}

void PowerManager::disableUnusedPeripherals() {
#ifdef NRF52
    // Disable UART if not in use
    if (!(enabled_peripherals & (1 << 0))) {
        NRF_UARTE0->ENABLE = 0;
    }
    
    // Disable SPI if not in use
    if (!(enabled_peripherals & (1 << 1))) {
        NRF_SPIM0->ENABLE = 0;
    }
    
    // Disable TWI (I2C) if not in use
    if (!(enabled_peripherals & (1 << 2))) {
        NRF_TWIM0->ENABLE = 0;
    }
    
    // Disable unused GPIO
    for (int i = 0; i < 32; i++) {
        if (i != SENSOR_TRIGGER_PIN) {
            nrf_gpio_cfg_default(i);
        }
    }
#endif
}

void PowerManager::enablePeripheral(uint8_t peripheral_id) {
    enabled_peripherals |= (1 << peripheral_id);
}

float PowerManager::estimatePowerConsumption() {
    // Estimated power consumption in mW based on current mode
    switch (current_mode) {
        case POWER_MODE_ACTIVE:
            return 15.0f;      // ~15mW at 64MHz
        case POWER_MODE_LOW_POWER:
            return 3.0f;       // ~3mW at 8MHz with DCDC
        case POWER_MODE_SLEEP:
            return 0.001f;     // ~1μW in System OFF
        default:
            return 15.0f;
    }
}

