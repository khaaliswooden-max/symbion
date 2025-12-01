# FDA 510(k) Premarket Notification Summary

## Symbion Gut-Brain Interface Biosensor

**Document Version:** 1.0  
**Date:** December 1, 2024  
**Prepared by:** Symbion Medical Technologies

---

## 1. DEVICE IDENTIFICATION

### 1.1 Trade Name
Symbion Gut-Brain Interface (GBI) Biosensor System

### 1.2 Common Name
Neurotransmitter Monitoring Device

### 1.3 Classification Name
21 CFR 862.1700 - Clinical Chemistry Analyzer

### 1.4 Product Code
JJE (Analyzer, Chemistry, Clinical)

### 1.5 Regulatory Class
**Class II** - Medical Device requiring 510(k) clearance

### 1.6 Applicant Information
- **Company:** Symbion Medical Technologies
- **Address:** [Company Address]
- **Contact:** regulatory@symbion.health
- **Phone:** [Phone Number]
- **Establishment Registration Number:** [To be assigned]

---

## 2. PREDICATE DEVICE

### 2.1 Primary Predicate
**Device Name:** Abbott i-STAT System  
**510(k) Number:** K033086  
**Classification:** 21 CFR 862.1700  
**Product Code:** JJE

### 2.2 Comparison to Predicate

| Feature | Symbion GBI | Abbott i-STAT | Substantial Equivalence |
|---------|-------------|---------------|-------------------------|
| **Intended Use** | Gut neurotransmitter monitoring | Blood analyte monitoring | ✓ Similar (in vitro diagnostics) |
| **Technology** | Electrochemical biosensor | Electrochemical biosensor | ✓ Same |
| **Sample Type** | Gut fluid | Blood | △ Different but similar matrix |
| **Analytes** | Serotonin, Dopamine, GABA | Electrolytes, glucose | △ Different but similar measurement |
| **Power Source** | Li-Po battery | 9V battery | ✓ Similar |
| **Connectivity** | Bluetooth Low Energy | IR/Bluetooth | ✓ Similar |
| **User Interface** | Mobile app | Handheld display | ✓ Similar digital interface |

**Conclusion:** The Symbion GBI device is substantially equivalent to the predicate device in terms of intended use (in vitro diagnostic monitoring), technological characteristics (electrochemical sensing), and performance.

---

## 3. DEVICE DESCRIPTION

### 3.1 Intended Use
The Symbion Gut-Brain Interface (GBI) Biosensor is an in vitro diagnostic device intended for the quantitative measurement of neurotransmitter levels (serotonin, dopamine, GABA) and gut health biomarkers (pH, temperature, calprotectin) in human gut fluid samples.

The device is intended for use by healthcare professionals and patients under medical supervision for:
- Monitoring gut-brain axis function
- Tracking neurotransmitter levels over time
- Assessing gut health status
- Supporting clinical decision-making for GI and neurological conditions

### 3.2 Indications for Use
The Symbion GBI Biosensor is indicated for:
- Adult patients (18 years and older)
- Monitoring of gut neurotransmitter levels
- Assessment of gastrointestinal inflammation
- Longitudinal tracking of gut-brain axis biomarkers

**Contraindications:**
- Patients with active GI bleeding
- Patients with severe swallowing disorders
- Children under 18 years of age
- Pregnant women (safety not established)

### 3.3 Device Components

#### Hardware
- **Biosensor Unit:** nRF52832-based wearable device (45mm x 35mm x 8mm)
- **Electrochemical Sensors:** 6-channel biosensor array
- **Power:** 500mAh Li-Po battery (rechargeable)
- **Connectivity:** Bluetooth Low Energy 5.0
- **Enclosure:** Biocompatible, IP67-rated housing

#### Software
- **Mobile Application:** iOS/Android app for data display and control
- **Cloud Backend:** Secure data storage and analytics platform
- **Firmware:** Embedded software for sensor control and data processing

### 3.4 Operating Principle
The device uses electrochemical detection methods to measure neurotransmitter concentrations:
1. **Sample Collection:** Gut fluid contacts sensor array
2. **Electrochemical Detection:** Analytes undergo oxidation/reduction at electrode surface
3. **Signal Processing:** Current signals converted to concentration values
4. **Data Transmission:** Results transmitted via BLE to mobile device
5. **Display:** Data visualized in mobile app with trend analysis

---

## 4. PERFORMANCE DATA

### 4.1 Bench Testing

#### Accuracy
| Analyte | Reference Range | Accuracy | Precision (CV%) |
|---------|----------------|----------|-----------------|
| Serotonin | 10-10,000 nM | ±10% | <8% |
| Dopamine | 50-5,000 nM | ±12% | <10% |
| GABA | 100-50,000 nM | ±15% | <12% |
| pH | 5.0-8.0 | ±0.2 units | <5% |
| Temperature | 35-40°C | ±0.5°C | <3% |

#### Linearity
- All analytes demonstrate linear response across clinically relevant ranges
- R² > 0.99 for all calibration curves

#### Repeatability
- Within-run CV: <5%
- Between-run CV: <8%

#### Stability
- Sensor stable for 30 days after activation
- Calibration stable for 7 days

### 4.2 Biocompatibility Testing (ISO 10993)

| Test | Standard | Result |
|------|----------|--------|
| Cytotoxicity | ISO 10993-5 | Pass (No cytotoxic response) |
| Sensitization | ISO 10993-10 | Pass (No sensitization) |
| Irritation | ISO 10993-10 | Pass (No irritation) |
| Acute Systemic Toxicity | ISO 10993-11 | Pass (No toxic effects) |
| Hemocompatibility | ISO 10993-4 | Pass (Non-hemolytic) |

**Conclusion:** Device materials are biocompatible for intended use (limited contact <24 hours).

### 4.3 Electrical Safety (IEC 60601-1)

| Test | Requirement | Result |
|------|-------------|--------|
| Leakage Current | <100µA | Pass (15µA measured) |
| Dielectric Strength | 1500V AC | Pass |
| Protective Earth | <0.2Ω | Pass (0.08Ω) |
| Temperature Rise | <10°C | Pass (5.2°C) |

### 4.4 EMC Testing (IEC 60601-1-2)

| Test | Standard | Result |
|------|----------|--------|
| Radiated Emissions | CISPR 11 | Pass (Class B) |
| Conducted Emissions | CISPR 11 | Pass |
| ESD Immunity | IEC 61000-4-2 | Pass (±8kV contact) |
| Radiated Immunity | IEC 61000-4-3 | Pass (10V/m) |
| Burst Immunity | IEC 61000-4-4 | Pass |

### 4.5 Clinical Performance

#### Study Design
- **Protocol:** Prospective, multi-center study
- **Subjects:** 120 adult patients
- **Duration:** 30 days per subject
- **Comparison:** Laboratory reference methods (HPLC, ELISA)

#### Results
| Analyte | Correlation (r) | Agreement | Bias |
|---------|----------------|-----------|------|
| Serotonin | 0.94 | 95.2% | +2.3% |
| Dopamine | 0.92 | 93.8% | -1.7% |
| GABA | 0.90 | 91.5% | +3.1% |

**Clinical Sensitivity:** 92.5%  
**Clinical Specificity:** 94.3%  
**Positive Predictive Value:** 93.7%  
**Negative Predictive Value:** 93.2%

### 4.6 Software Validation (FDA Guidance)

| Level of Concern | Classification | Documentation |
|------------------|----------------|---------------|
| Mobile App | Moderate | Level of Concern Justified |
| Firmware | Moderate | IEC 62304 Compliant |
| Cloud Backend | Minor | 21 CFR Part 11 Compliant |

**Cybersecurity:**
- Data encryption: AES-128 CBC
- Authentication: Multi-factor
- HIPAA compliant
- FDA Cybersecurity Guidance compliant

---

## 5. SUBSTANTIAL EQUIVALENCE DISCUSSION

### 5.1 Technological Characteristics
The Symbion GBI device employs the same fundamental electrochemical sensing technology as the predicate device (Abbott i-STAT), utilizing amperometric detection to quantify analyte concentrations.

### 5.2 Intended Use
Both devices are intended for in vitro diagnostic monitoring of biological analytes, though applied to different sample types (gut fluid vs. blood). The monitoring purpose and clinical utility are substantially equivalent.

### 5.3 Performance
The Symbion GBI device demonstrates equivalent or superior performance compared to the predicate:
- Accuracy: ±10-15% (similar to predicate ±10%)
- Precision: CV <12% (similar to predicate CV <10%)
- Range: Clinically relevant (appropriate for analytes measured)

### 5.4 Safety Profile
The device presents no new safety concerns compared to the predicate:
- Similar electrical safety profile
- Biocompatible materials
- EMC compliant
- Battery-powered (low voltage)

### 5.5 Conclusion
The Symbion GBI Biosensor is substantially equivalent to the predicate device (Abbott i-STAT) and has the same intended use. Differences in analytes measured and sample type do not raise new questions of safety and effectiveness.

---

## 6. STERILIZATION AND SHELF LIFE

### 6.1 Sterilization Method
- **Method:** Ethylene Oxide (EtO) sterilization
- **Standard:** ISO 11135
- **Validation:** Sterility Assurance Level (SAL) 10⁻⁶

### 6.2 Shelf Life
- **Device:** 24 months from date of manufacture
- **Sensors:** 18 months from date of manufacture
- **Stability Studies:** Ongoing real-time and accelerated studies per ASTM F1980

---

## 7. LABELING

The device labeling complies with 21 CFR 801 and 21 CFR 809.10, including:
- Intended use statement
- Indications and contraindications
- Warnings and precautions
- Operating instructions
- Performance characteristics
- Quality control procedures
- Rx only (prescription use)

**Labels include:**
- Product name and model number
- Manufacturer information
- Lot number and expiration date
- UDI (Unique Device Identifier)
- Storage conditions
- Sterilization indicator (if applicable)

---

## 8. CONCLUSIONS

The Symbion Gut-Brain Interface (GBI) Biosensor is **substantially equivalent** to the predicate device (Abbott i-STAT System, K033086) based on:

1. **Same intended use:** In vitro diagnostic monitoring
2. **Same technology:** Electrochemical biosensor
3. **Equivalent performance:** Accuracy, precision, and reliability
4. **Equivalent safety:** Biocompatible, electrically safe, EMC compliant
5. **No new questions of safety or effectiveness**

The performance data demonstrates that the device is safe and effective for its intended use. Therefore, Symbion Medical Technologies requests **510(k) clearance** for the Symbion GBI Biosensor System.

---

## APPENDICES

- Appendix A: Detailed Bench Test Reports
- Appendix B: Biocompatibility Test Reports (ISO 10993)
- Appendix C: Electrical Safety Test Reports (IEC 60601-1)
- Appendix D: EMC Test Reports (IEC 60601-1-2)
- Appendix E: Clinical Study Protocol and Report
- Appendix F: Software Documentation (IEC 62304)
- Appendix G: Risk Management File (ISO 14971)
- Appendix H: Labeling and Instructions for Use
- Appendix I: Shelf Life and Stability Data
- Appendix J: Manufacturing and Quality System Information

---

**Prepared by:**  
[Regulatory Affairs Manager Name]  
Symbion Medical Technologies  
Date: December 1, 2024

**Reviewed by:**  
[Quality Assurance Manager Name]  
[Medical Director Name]

---

*This is a template 510(k) summary. Actual submission requires complete data, proper formatting, and eCopy submission via FDA's eSTAR system.*

