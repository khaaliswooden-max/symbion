# Symbion Hardware Design

Hardware design files for the Symbion Gut-Brain Interface biosensor device.

## Overview

The Symbion device is a compact, wearable biosensor that measures neurotransmitter levels and gut health biomarkers in real-time.

### Key Specifications

- **Microcontroller:** Nordic nRF52832 (ARM Cortex-M4F, BLE 5.0)
- **Power:** 3.7V Li-Po battery (500mAh)
- **Sensors:** 
  - 6-channel 12-bit ADC for biosensor inputs
  - Temperature sensor (LM35)
  - pH sensor interface
- **Connectivity:** Bluetooth Low Energy 5.0
- **Dimensions:** 45mm x 35mm x 8mm
- **Weight:** ~15g (with battery)

## Directory Structure

```
hardware/
├── schematics/          # KiCad schematic files
│   ├── symbion.kicad_sch
│   └── symbion.kicad_pro
├── pcb/                 # PCB layout files
│   ├── symbion.kicad_pcb
│   └── gerber/          # Manufacturing files
├── bom/                 # Bill of Materials
│   ├── symbion_bom.csv
│   └── component_specs.md
└── cad/                 # 3D models and enclosure
    ├── enclosure.step
    └── assembly.pdf
```

## Design Files

### KiCad Version
- **KiCad 7.x** or later required
- Libraries: Standard KiCad libraries + custom footprints

### Schematic Highlights

1. **Power Management**
   - Li-Po battery charging circuit (MCP73831)
   - 3.3V LDO regulator (MCP1700-3302E)
   - Power path management
   - Battery protection

2. **Microcontroller**
   - nRF52832 with external 32MHz crystal
   - 32.768kHz RTC crystal
   - SWD programming interface
   - Reset circuit

3. **Sensor Interface**
   - 6 analog input channels (A0-A5)
   - Differential amplifiers for signal conditioning
   - Low-pass filtering
   - ESD protection

4. **BLE Antenna**
   - PCB trace antenna (2.4GHz)
   - Pi-network impedance matching
   - Optional U.FL connector for external antenna

5. **User Interface**
   - RGB LED (status indicator)
   - Push button (user input)
   - Battery level indicator

## Bill of Materials

### Major Components

| Component | Part Number | Qty | Description |
|-----------|-------------|-----|-------------|
| MCU | nRF52832-QFAA | 1 | BLE SoC, 512KB Flash, 64KB RAM |
| Battery Charger | MCP73831T-2ACI/OT | 1 | Li-Po charge controller |
| LDO Regulator | MCP1700-3302E/TO | 1 | 3.3V, 250mA LDO |
| Op-Amp | MCP6004 | 2 | Quad op-amp for signal conditioning |
| Crystal | ABM3-32.000MHZ | 1 | 32MHz crystal for RF |
| RTC Crystal | ABS07-32.768KHZ | 1 | 32.768kHz RTC crystal |
| Temperature Sensor | LM35DZ | 1 | Precision temperature sensor |
| Battery | LP603450 | 1 | 3.7V 500mAh Li-Po |

### Passive Components
- Resistors: 0603 size, 1% tolerance
- Capacitors: 0603 size, X7R dielectric
- Inductors: 0805 size (for BLE matching)

See `bom/symbion_bom.csv` for complete list.

## PCB Specifications

### Physical
- **Size:** 45mm x 35mm
- **Layers:** 4 (Signal, Ground, Power, Signal)
- **Thickness:** 1.6mm
- **Finish:** ENIG (gold plating)

### Electrical
- **Min Track Width:** 0.15mm (6 mil)
- **Min Clearance:** 0.15mm (6 mil)
- **Via Size:** 0.3mm drill, 0.6mm pad
- **Impedance:** 50Ω for RF traces

### Manufacturing Notes
- **Solder Mask:** Blue (Pantone 293C)
- **Silkscreen:** White
- **BLE antenna keep-out zone required
- **Ground pour on all layers

## Assembly Instructions

### Hand Assembly
1. Start with smallest components (0603 passives)
2. Progress to larger components
3. Install nRF52832 with hot air rework station
4. Solder connectors and switches last
5. Program and test before enclosure

### Reflow Profile
- Preheat: 150-180°C for 60-120s
- Soak: 180-200°C for 60-120s
- Reflow: Peak 245°C for 10-30s
- Cooling: Natural to room temperature

## Testing and Validation

### Electrical Tests
- [ ] Power supply voltages (3.3V, battery voltage)
- [ ] Current consumption (<50µA in sleep)
- [ ] ADC functionality (all channels)
- [ ] BLE transmission power
- [ ] Battery charging circuit

### RF Tests
- [ ] Antenna impedance (50Ω at 2.4GHz)
- [ ] Return loss (< -10dB)
- [ ] Radiation pattern
- [ ] BLE range test (>10m)

### Biosensor Tests
- [ ] Sensor calibration
- [ ] Signal-to-noise ratio
- [ ] Cross-talk between channels
- [ ] Temperature compensation

## Programming

### SWD Interface
```
Pin 1: VCC (3.3V)
Pin 2: SWDIO
Pin 3: SWDCLK
Pin 4: GND
Pin 5: RESET
```

### Firmware Flashing
```bash
# Using J-Link
nrfjprog --program firmware.hex --chiperase --verify
nrfjprog --reset

# Using OpenOCD
openocd -f interface/jlink.cfg -f target/nrf52.cfg \
  -c "program firmware.hex verify reset exit"
```

## Certifications

### Required
- **FCC Part 15** - Radio frequency emissions
- **CE** - European conformity
- **IC** - Industry Canada certification
- **RoHS** - Hazardous substance restrictions

### Medical Device
- **FDA Class II** - Medical device registration (if marketed as medical)
- **ISO 13485** - Medical device quality management
- **IEC 60601-1** - Medical electrical equipment safety

## Safety Considerations

- **ESD Protection:** TVS diodes on all external connections
- **Overvoltage Protection:** Zener diodes on sensor inputs
- **Reverse Polarity Protection:** PMOS on battery input
- **Thermal Management:** Temperature monitoring, thermal shutdown

## Enclosure

- **Material:** Biocompatible ABS plastic
- **IP Rating:** IP67 (waterproof)
- **Mounting:** Adhesive patch or wearable clip
- **Color:** Medical white
- **Weight:** <5g (empty)

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2024-12-01 | Initial design |
| v1.1 | TBD | Add external antenna option |

## Contributing

For hardware modifications:
1. Open design in KiCad 7.x
2. Make changes following design rules
3. Run DRC (Design Rule Check)
4. Generate new Gerbers
5. Submit pull request with changes

## License

Hardware design licensed under CERN Open Hardware License v2 (CERN-OHL-S)

## Contact

- **Design Team:** hardware@symbion.health
- **Support:** support@symbion.health
- **GitHub:** https://github.com/khaaliswooden-max/symbion

---

⚠️ **Warning:** This is a medical device prototype. Proper testing, validation, and regulatory approval required before human use.

