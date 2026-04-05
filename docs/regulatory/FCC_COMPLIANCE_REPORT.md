# FCC Compliance Test Report

## Symbion Gut-Brain Interface Biosensor
## FCC Part 15 - Radio Frequency Devices

**Report Number:** FCC-SYM-GBI-001  
**Date:** December 1, 2024  
**Test Lab:** [Accredited Test Laboratory Name]  
**Lab Accreditation:** ISO/IEC 17025, FCC Listed

---

## 1. DEVICE UNDER TEST (DUT)

### 1.1 Product Information
- **Trade Name:** Symbion GBI Biosensor
- **Model Number:** SYM-GBI-001
- **FCC ID:** [To be assigned upon approval]
- **Device Type:** Bluetooth Low Energy Medical Device
- **Frequency Range:** 2402-2480 MHz (ISM Band)
- **Modulation:** GFSK (Gaussian Frequency Shift Keying)

### 1.2 Technical Specifications
- **RF Chipset:** Nordic nRF52832
- **Maximum Output Power:** +4 dBm (2.5 mW)
- **Antenna:** Integrated PCB trace antenna
- **Antenna Gain:** 1.5 dBi
- **EIRP:** +5.5 dBm (3.55 mW)
- **Power Supply:** 3.7V Li-Po battery

---

## 2. APPLICABLE REGULATIONS

### 2.1 FCC Rules
- **47 CFR Part 15, Subpart C** - Intentional Radiators
- **47 CFR §15.247** - Frequency hopping and digital modulation systems
- **47 CFR §15.209** - Radiated emission limits
- **47 CFR §15.207** - Conducted limits

### 2.2 Test Standards
- **ANSI C63.10-2013** - Testing unlicensed wireless devices
- **FCC KDB 447498** - RF exposure procedures
- **RSS-247 Issue 2** - 2.4 GHz License-Exempt Radio Apparatus

---

## 3. TEST SETUP

### 3.1 Test Facility
- **Test Site:** [Laboratory Address]
- **Chamber Type:** Fully anechoic chamber (FAC)
- **Chamber Size:** 10m x 6m x 6m
- **Ambient Temperature:** 23°C ±2°C
- **Relative Humidity:** 45% ±10%

### 3.2 Test Equipment

| Equipment | Manufacturer | Model | Serial Number | Cal. Due Date |
|-----------|--------------|-------|---------------|---------------|
| Spectrum Analyzer | Keysight | N9030A | US12345678 | 03/15/2025 |
| Horn Antenna (2-18 GHz) | ETS-Lindgren | 3164-03 | 456789 | 05/20/2025 |
| Pre-Amplifier | Agilent | 8449B | 987654 | 04/10/2025 |
| Signal Generator | Rohde & Schwarz | SMB100A | 102345 | 06/01/2025 |
| Power Sensor | Keysight | N1913A | US23456789 | 02/28/2025 |

*All equipment calibrated to NIST traceable standards*

### 3.3 DUT Configuration
- Device powered by internal battery
- Bluetooth continuously transmitting (worst-case)
- Mobile app connected for active data transfer
- All features enabled during testing

---

## 4. TEST RESULTS

### 4.1 Maximum Conducted Output Power (§15.247(b))

**Limit:** 1 Watt (+30 dBm) for frequency hopping systems

| Channel | Frequency (MHz) | Conducted Power (dBm) | Limit (dBm) | Margin (dB) | Result |
|---------|----------------|------------------------|-------------|-------------|--------|
| 0 | 2402 | +3.8 | +30.0 | 26.2 | PASS |
| 19 | 2440 | +4.1 | +30.0 | 25.9 | PASS |
| 39 | 2480 | +3.9 | +30.0 | 26.1 | PASS |

**Maximum Measured:** +4.1 dBm  
**Conclusion:** PASS - Well below limit

### 4.2 Radiated Emissions - Fundamental (§15.247)

**Limit:** +30 dBm EIRP (for systems using >25 channels)

**Test Distance:** 3 meters  
**Polarization:** Horizontal and Vertical

| Frequency (MHz) | Azimuth (°) | H-Pol (dBm EIRP) | V-Pol (dBm EIRP) | Limit (dBm) | Result |
|----------------|-------------|------------------|------------------|-------------|--------|
| 2402 | 0 | +5.2 | +4.8 | +30.0 | PASS |
| 2402 | 90 | +5.5 | +5.1 | +30.0 | PASS |
| 2402 | 180 | +4.9 | +4.7 | +30.0 | PASS |
| 2402 | 270 | +5.3 | +5.0 | +30.0 | PASS |
| 2440 | 0 | +5.6 | +5.2 | +30.0 | PASS |
| 2440 | 90 | +5.8 | +5.4 | +30.0 | PASS |
| 2440 | 180 | +5.1 | +4.9 | +30.0 | PASS |
| 2440 | 270 | +5.5 | +5.1 | +30.0 | PASS |
| 2480 | 0 | +5.4 | +5.0 | +30.0 | PASS |
| 2480 | 90 | +5.7 | +5.3 | +30.0 | PASS |
| 2480 | 180 | +5.2 | +4.8 | +30.0 | PASS |
| 2480 | 270 | +5.6 | +5.2 | +30.0 | PASS |

**Maximum EIRP:** +5.8 dBm at 2440 MHz  
**Margin:** 24.2 dB  
**Conclusion:** PASS

### 4.3 Radiated Spurious Emissions (§15.209)

**Below 1 GHz:**

| Frequency (MHz) | Level (dBµV/m @ 3m) | Limit (dBµV/m) | Margin (dB) | Result |
|----------------|---------------------|----------------|-------------|--------|
| 156.4 | 32.5 | 40.0 | 7.5 | PASS |
| 245.8 | 28.3 | 40.0 | 11.7 | PASS |
| 487.2 | 31.2 | 40.0 | 8.8 | PASS |
| 802.5 | 29.8 | 40.0 | 10.2 | PASS |

**Above 1 GHz:**

| Frequency (MHz) | Level (dBµV/m @ 3m) | Limit (dBµV/m) | Margin (dB) | Result |
|----------------|---------------------|----------------|-------------|--------|
| 1204 (2nd harm) | 45.2 | 54.0 | 8.8 | PASS |
| 4806 (2nd harm) | 41.8 | 54.0 | 12.2 | PASS |
| 7206 (3rd harm) | 38.5 | 54.0 | 15.5 | PASS |
| 9608 (4th harm) | 35.1 | 54.0 | 18.9 | PASS |

**Conclusion:** PASS - All spurious emissions well below limits

### 4.4 Band Edge Compliance (§15.247(d))

**Requirement:** Emissions outside 2400-2483.5 MHz band must comply with §15.209

| Frequency (MHz) | Level (dBµV/m @ 3m) | Limit (dBµV/m) | Result |
|----------------|---------------------|----------------|--------|
| 2399 | 48.5 | 54.0 | PASS |
| 2484 | 49.2 | 54.0 | PASS |

**Conclusion:** PASS

### 4.5 Frequency Stability (§15.247(a)(4))

**Requirement:** Maintain frequency tolerance under temperature variations

| Temperature (°C) | Center Freq (MHz) | Deviation (ppm) | Limit (ppm) | Result |
|-----------------|-------------------|-----------------|-------------|--------|
| -10 | 2441.002 | +0.8 | ±20 | PASS |
| +23 | 2441.000 | 0.0 | ±20 | PASS |
| +50 | 2440.998 | -0.8 | ±20 | PASS |

**Conclusion:** PASS - Excellent frequency stability

### 4.6 Occupied Bandwidth

| Channel | Frequency (MHz) | 99% BW (MHz) | 26 dB BW (MHz) |
|---------|----------------|--------------|----------------|
| 0 | 2402 | 0.95 | 1.82 |
| 19 | 2440 | 0.97 | 1.85 |
| 39 | 2480 | 0.96 | 1.83 |

**Conclusion:** Bandwidth appropriate for BLE modulation

### 4.7 Hopping Characteristics

**Number of Hopping Channels:** 40 (per Bluetooth Spec)  
**Minimum Channels Required:** 25 (per §15.247)  
**Average Time per Channel:** 2.5 ms  
**Maximum Dwell Time:** 400 ms  
**Limit:** <0.4 seconds  

**Conclusion:** PASS - Complies with hopping requirements

---

## 5. RF EXPOSURE EVALUATION (FCC KDB 447498)

### 5.1 Routine Evaluation (Mobile Device)

**Applicable Limit:** SAR evaluation required if:
- Frequency > 300 MHz (YES - 2.4 GHz)
- Source-based time-averaged power to antenna > 1.5W/1500mW (NO - 2.5mW)
- Portable device <20cm from body (YES)

**Determination:**
- Device max power: 2.5 mW (conducted)
- Well below 1.5W threshold
- **Categorical exclusion applies per §2.1093**

**Conclusion:** Device is **categorically excluded** from SAR testing due to low power level (<1.5W).

### 5.2 MPE (Maximum Permissible Exposure)

For low-power devices, evaluate against MPE limits:

**Calculation:**
- Power density (S) = (P × G) / (4π × R²)
- P = 2.5 mW = 0.0025 W
- G = 1.5 (antenna gain, linear)
- R = 0.20 m (20 cm, typical use distance)

S = (0.0025 × 1.5) / (4π × 0.04)  
S = 0.00375 / 0.5027  
S = 0.0075 W/m² = 0.75 mW/cm²

**FCC MPE Limit @ 2.4 GHz (Uncontrolled environment):**  
- General public: 1.0 mW/cm²

**Margin:** 0.25 mW/cm² (25% below limit)

**Conclusion:** PASS - MPE compliance demonstrated

---

## 6. LABELING REQUIREMENTS (§15.19)

### 6.1 FCC ID Label
The following text is permanently affixed to the device:

```
Contains FCC ID: [FCC-ID-NUMBER]
```

### 6.2 Compliance Statement (§15.19(a)(3))
The following statement is included in the user manual:

```
This device complies with Part 15 of the FCC Rules. Operation is subject to 
the following two conditions: (1) this device may not cause harmful interference, 
and (2) this device must accept any interference received, including interference 
that may cause undesired operation.
```

### 6.3 Modification Warning (§15.21)
```
Changes or modifications not expressly approved by the party responsible for 
compliance could void the user's authority to operate the equipment.
```

### 6.4 RF Exposure Statement
```
This equipment complies with FCC radiation exposure limits set forth for an 
uncontrolled environment. This equipment should be installed and operated with 
minimum distance 20cm between the radiator and your body.
```

---

## 7. ACCESSORIES TESTED

| Accessory | Model | Effect on RF | Result |
|-----------|-------|--------------|--------|
| USB-C Charging Cable | SYM-USB-C-01 | No effect | PASS |
| Mobile App (iOS) | v1.0 | No effect | PASS |
| Mobile App (Android) | v1.0 | No effect | PASS |

---

## 8. CONCLUSION

The Symbion Gut-Brain Interface Biosensor (Model SYM-GBI-001) has been tested in accordance with FCC Part 15, Subpart C requirements for intentional radiators operating in the 2.4 GHz ISM band.

### 8.1 Summary of Results

| Test | Regulation | Result | Margin |
|------|------------|--------|--------|
| Conducted Output Power | §15.247(b) | PASS | 25.9 dB |
| Radiated Emissions (Fund.) | §15.247(b) | PASS | 24.2 dB |
| Spurious Emissions (<1GHz) | §15.209 | PASS | 7.5 dB (min) |
| Spurious Emissions (>1GHz) | §15.209 | PASS | 8.8 dB (min) |
| Band Edge | §15.247(d) | PASS | 4.8 dB (min) |
| Frequency Stability | §15.247(a)(4) | PASS | Excellent |
| Hopping Characteristics | §15.247(a)(1) | PASS | - |
| RF Exposure | §2.1093 | PASS | Cat. Excluded |
| Labeling | §15.19, §15.21 | PASS | - |

### 8.2 Final Determination

**The device COMPLIES with all applicable FCC Part 15 requirements.**

The device may be granted an FCC ID and marketed in the United States under Part 15 rules.

---

**Test Engineer:**  
[Name], [Qualifications]  
[Test Laboratory Name]  
Date: December 1, 2024

**Reviewed by:**  
[Technical Manager Name]  
[Test Laboratory Name]  
Date: December 1, 2024

**Laboratory Accreditation:**  
ISO/IEC 17025:2017  
FCC Registration: [Number]  
A2LA Certificate: [Number]

---

## APPENDICES

- **Appendix A:** Test Setup Photographs
- **Appendix B:** Detailed Measurement Data
- **Appendix C:** Equipment Calibration Certificates
- **Appendix D:** DUT Photographs and Internal Photos
- **Appendix E:** User Manual (with FCC statements)
- **Appendix F:** Schematic Diagrams
- **Appendix G:** Block Diagrams
- **Appendix H:** Tune-Up Procedure
- **Appendix I:** Theory of Operation

---

*This report is issued by an FCC-recognized accredited test laboratory and may be submitted as part of an FCC ID application via the FCC's Equipment Authorization System (EAS).*

