# Component Specifications

Detailed specifications for Symbion hardware components.

## Power Management

### MCP73831T-2ACI/OT - Li-Po Battery Charger
- **Manufacturer:** Microchip Technology
- **Package:** SOT-23-5
- **Charge Current:** 500mA (programmable with resistor)
- **Input Voltage:** 3.75V - 6V
- **Charge Termination:** 4.2V ±1%
- **Thermal Regulation:** Yes
- **Temperature Range:** -40°C to +85°C
- **Status Outputs:** Charge complete indicator
- **Datasheet:** [MCP73831 Datasheet](https://ww1.microchip.com/downloads/en/DeviceDoc/MCP73831-Family-Data-Sheet-DS20001984H.pdf)

### MCP1700-3302E/TO - 3.3V LDO Regulator
- **Manufacturer:** Microchip Technology
- **Package:** SOT-23
- **Output Voltage:** 3.3V ±2%
- **Output Current:** 250mA
- **Dropout Voltage:** 178mV @ 250mA
- **Quiescent Current:** 1.6µA (typical)
- **Line Regulation:** 0.2%/V (typical)
- **Load Regulation:** 0.4%/mA (typical)
- **PSRR:** 70dB @ 1kHz
- **Temperature Range:** -40°C to +125°C
- **Datasheet:** [MCP1700 Datasheet](https://ww1.microchip.com/downloads/en/DeviceDoc/20001826D.pdf)

---

## Microcontroller

### nRF52832-QFAA-R - BLE 5.0 SoC
- **Manufacturer:** Nordic Semiconductor
- **Package:** QFN-48 (6x6mm, 0.5mm pitch)
- **Core:** ARM Cortex-M4F @ 64MHz
- **Flash Memory:** 512KB
- **RAM:** 64KB
- **BLE:** Bluetooth 5.0, 5.1, 5.2 compatible
- **Radio:** 2.4GHz transceiver, -96dBm sensitivity
- **TX Power:** +4dBm max
- **Current Consumption:**
  - Active (TX 0dBm): 5.3mA
  - Active (RX): 5.4mA
  - System ON (Idle): 1.7µA
  - System OFF: 0.4µA
- **ADC:** 12-bit, 8 channels, 200ksps
- **Timers:** 3x 32-bit, 2x 24-bit PWM
- **GPIO:** 32 programmable I/O
- **Interfaces:** SPI, I2C, UART, PDM, I2S
- **Temperature Range:** -40°C to +85°C
- **Datasheet:** [nRF52832 Datasheet](https://infocenter.nordicsemi.com/pdf/nRF52832_PS_v1.4.pdf)

---

## Analog Front-End

### MCP6004-I/ST - Quad Op-Amp
- **Manufacturer:** Microchip Technology
- **Package:** SOIC-14
- **Channels:** 4 independent op-amps
- **Supply Voltage:** 1.8V - 6.0V
- **GBW Product:** 1MHz
- **Input Offset Voltage:** 4.5mV (max)
- **Input Bias Current:** 1pA (typical)
- **Rail-to-Rail:** Input and output
- **Slew Rate:** 0.6V/µs
- **Supply Current:** 100µA per amplifier
- **Temperature Range:** -40°C to +125°C
- **Use Case:** Signal conditioning for biosensor inputs
- **Datasheet:** [MCP6004 Datasheet](https://ww1.microchip.com/downloads/en/DeviceDoc/21733j.pdf)

### LM35DZ/NOPB - Temperature Sensor
- **Manufacturer:** Texas Instruments
- **Package:** SOT-23 (TO-92 alternative)
- **Accuracy:** ±0.5°C @ 25°C
- **Range:** 0°C to +100°C
- **Scale Factor:** 10mV/°C
- **Linearity:** ±0.25°C (typical)
- **Quiescent Current:** 60µA
- **Self-Heating:** 0.08°C in still air
- **Output Impedance:** 0.5Ω (typical)
- **Temperature Range:** -55°C to +150°C
- **Use Case:** Temperature compensation for biosensors
- **Datasheet:** [LM35 Datasheet](https://www.ti.com/lit/ds/symlink/lm35.pdf)

---

## Timing

### ABM3-32.000MHZ-B2-T - 32MHz Crystal
- **Manufacturer:** Abracon
- **Package:** SMD 3.2x2.5mm
- **Frequency:** 32.000MHz
- **Tolerance:** ±10ppm
- **Stability:** ±10ppm over temperature
- **Load Capacitance:** 8pF
- **ESR:** 50Ω max
- **Drive Level:** 100µW max
- **Temperature Range:** -20°C to +70°C
- **Use Case:** nRF52832 main clock
- **Datasheet:** [ABM3 Datasheet](https://abracon.com/Resonators/abm3.pdf)

### ABS07-32.768KHZ-T - RTC Crystal
- **Manufacturer:** Abracon
- **Package:** SMD 3.2x1.5mm
- **Frequency:** 32.768kHz
- **Tolerance:** ±20ppm
- **Stability:** ±5ppm/year
- **Load Capacitance:** 12.5pF
- **ESR:** 70kΩ max
- **Temperature Range:** -40°C to +85°C
- **Use Case:** Low-power RTC for nRF52832
- **Datasheet:** [ABS07 Datasheet](https://abracon.com/Resonators/abs07.pdf)

---

## Connectors

### USB4110-GF-A - USB Type-C Receptacle
- **Manufacturer:** GCT (Global Connector Technology)
- **Pins:** 16-pin (full featured)
- **Current Rating:** 3A
- **Voltage Rating:** 20V
- **Durability:** 10,000 mating cycles
- **Contact Resistance:** 40mΩ max
- **Insulation Resistance:** 100MΩ min
- **Temperature Range:** -40°C to +85°C
- **Use Case:** Battery charging and data interface
- **Datasheet:** [USB4110 Datasheet](https://gct.co/files/drawings/usb4110.pdf)

### M20-9770546 - SWD Programming Header
- **Manufacturer:** Harwin
- **Pitch:** 1.27mm
- **Pins:** 5 (VCC, SWDIO, SWDCLK, GND, RESET)
- **Current Rating:** 1A per contact
- **Orientation:** Vertical
- **Height:** 3.3mm
- **Temperature Range:** -55°C to +105°C
- **Use Case:** Firmware programming via J-Link/DAPLink
- **Datasheet:** [M20 Series Datasheet](https://cdn.harwin.com/pdfs/M20-777.pdf)

### S2B-PH-K-S - Battery Connector
- **Manufacturer:** JST (Japan Solderless Terminal)
- **Series:** PH Series
- **Pins:** 2
- **Pitch:** 2.0mm
- **Current Rating:** 2A
- **Voltage Rating:** 100V AC/DC
- **Durability:** 1,000 mating cycles
- **Temperature Range:** -25°C to +85°C
- **Use Case:** Li-Po battery connection
- **Datasheet:** [PH Series Datasheet](http://www.jst-mfg.com/product/pdf/eng/ePH.pdf)

---

## User Interface

### LTST-C19HE1WT - RGB LED
- **Manufacturer:** Lite-On
- **Package:** SMD 1210 (3.2x2.7mm)
- **Type:** Common Anode
- **Colors:** Red, Green, Blue
- **Forward Voltage:**
  - Red: 1.9V (typical)
  - Green: 3.0V (typical)
  - Blue: 3.0V (typical)
- **Forward Current:** 20mA per LED
- **Luminous Intensity:**
  - Red: 80-180mcd
  - Green: 200-500mcd
  - Blue: 50-140mcd
- **Viewing Angle:** 120°
- **Temperature Range:** -40°C to +85°C
- **Use Case:** Status indication (connection, battery, alerts)
- **Datasheet:** [LTST-C19HE1WT Datasheet](https://optoelectronics.liteon.com/upload/download/DS22-2000-235/LTST-C19HE1WT.pdf)

### PTS636 SM43J SMTR LFS - Tactile Switch
- **Manufacturer:** C&K
- **Actuator:** J-lead (gull-wing)
- **Size:** 4.2x3.2mm
- **Travel:** 0.2mm
- **Operating Force:** 260gf
- **Current/Voltage Rating:** 50mA @ 12VDC
- **Contact Resistance:** 100Ω max
- **Durability:** 100,000 cycles
- **Temperature Range:** -40°C to +85°C
- **Use Case:** User button for mode switching
- **Datasheet:** [PTS636 Datasheet](https://www.ckswitches.com/media/1479/pts636.pdf)

---

## Protection

### PESD5V0S1BA - ESD Protection Diode
- **Manufacturer:** Nexperia
- **Package:** SOD-323
- **Channels:** 1
- **VRWM (Working Voltage):** 5V
- **VBR (Breakdown Voltage):** 6.0V min
- **Capacitance:** 15pF @ 0V
- **Clamping Voltage:** 9.7V @ 1A
- **ESD Protection:** ±15kV contact, ±18kV air
- **Temperature Range:** -55°C to +150°C
- **Use Case:** USB and sensor input protection
- **Datasheet:** [PESD5V0S1BA Datasheet](https://assets.nexperia.com/documents/data-sheet/PESD5V0S1BA.pdf)

### BAT54C - Schottky Diode Dual
- **Manufacturer:** Nexperia
- **Package:** SOT-23
- **Configuration:** Common cathode
- **VRRM:** 30V
- **IF (Forward Current):** 200mA
- **VF (Forward Voltage):** 0.8V @ 100mA
- **IR (Reverse Current):** 2µA @ 25V
- **Temperature Range:** -65°C to +150°C
- **Use Case:** Reverse polarity protection, OR-ing
- **Datasheet:** [BAT54C Datasheet](https://assets.nexperia.com/documents/data-sheet/BAT54_SER.pdf)

---

## Power Switching

### SI2301CDS-T1-GE3 - P-Channel MOSFET
- **Manufacturer:** Vishay Siliconix
- **Package:** SOT-23
- **VDS (Drain-Source Voltage):** -20V
- **ID (Continuous Drain Current):** -2.3A
- **RDS(on) @ VGS=-4.5V:** 130mΩ (max)
- **VGS(th) (Threshold Voltage):** -0.5V to -1.5V
- **Gate Charge:** 5.5nC (typical)
- **Temperature Range:** -55°C to +150°C
- **Use Case:** High-side switch, reverse polarity protection
- **Datasheet:** [SI2301CDS Datasheet](https://www.vishay.com/docs/70188/70188.pdf)

---

## RF Components

### 2450AT18A100 - 2.4GHz Ceramic Antenna
- **Manufacturer:** Johanson Technology
- **Type:** Ceramic chip antenna
- **Frequency:** 2400-2500MHz
- **Peak Gain:** 1.5dBi
- **Efficiency:** >50%
- **Impedance:** 50Ω
- **VSWR:** <3:1
- **Polarization:** Linear
- **Size:** 1.8x0.8x1.0mm
- **Temperature Range:** -40°C to +85°C
- **Use Case:** BLE antenna (alternative to PCB trace)
- **Datasheet:** [2450AT18A100 Datasheet](https://www.johansontechnology.com/datasheets/2450AT18A100/2450AT18A100.pdf)

### LQW18AN Series - RF Inductors
- **Manufacturer:** Murata
- **Package:** 0603
- **Frequency Range:** DC - 6GHz
- **Q Factor:** >30 @ 2.4GHz
- **Tolerance:** ±0.3nH
- **SRF (Self Resonant Freq):** >6GHz
- **Current Rating:** 300mA
- **Temperature Range:** -55°C to +125°C
- **Use Case:** BLE impedance matching network
- **Datasheet:** [LQW18AN Datasheet](https://www.murata.com/~/media/webrenewal/products/inductor/chip/tokoproducts/wirewoundferritetype/lqw18an_02.ashx)

---

## Battery

### LP603450 - Li-Po Battery
- **Type:** Lithium Polymer rechargeable
- **Nominal Voltage:** 3.7V
- **Capacity:** 500mAh
- **Dimensions:** 34mm x 50mm x 6mm
- **Weight:** ~10g
- **Charge Voltage:** 4.2V max
- **Discharge Cut-off:** 3.0V
- **Max Charge Current:** 500mA (1C)
- **Max Discharge Current:** 1A (2C)
- **Cycle Life:** >300 cycles @ 80% capacity
- **Temperature Range:**
  - Charge: 0°C to +45°C
  - Discharge: -20°C to +60°C
- **Safety Features:** PCM (Protection Circuit Module)
- **Use Case:** Main power source
- **Estimated Runtime:**
  - Active monitoring: ~8-10 hours
  - Standby: ~7 days

---

## Cost Breakdown

### Per-Unit BOM Cost (MOQ 1)
- ICs: $8.85
- Passives: $1.45
- Connectors: $1.91
- Mechanical: $1.74
- RF: $1.37
- Battery: $1.50
- Misc: $3.65
- **Total:** ~$20.47

### Manufacturing Costs (MOQ 100)
- PCB (4-layer ENIG): $15.00
- Stencil: $8.00 (one-time)
- Assembly: $25.00
- Testing: $5.00
- **Total per unit:** ~$73.47

### Scaling (MOQ 1000)
- BOM: $15.50 (volume pricing)
- PCB: $8.00
- Assembly: $18.00
- **Total per unit:** ~$41.50

---

## Supplier Information

- **Primary:** Digikey Electronics
- **Secondary:** Mouser Electronics
- **PCB:** JLCPCB, PCBWay
- **Assembly:** JLCPCB SMT, PCBWay Assembly
- **Battery:** Alibaba (verified suppliers)

---

## Compliance & Testing

### Required Certifications
- FCC Part 15B (RF emissions)
- CE (European conformity)
- IC (Industry Canada)
- RoHS (Lead-free)
- REACH (Chemical compliance)

### Recommended Testing
- RF performance (2.4GHz)
- EMI/EMC compliance
- ESD immunity (±8kV contact)
- Drop test (1m)
- IP67 waterproof (with enclosure)
- Biocompatibility (ISO 10993)

---

Last Updated: 2024-12-01

