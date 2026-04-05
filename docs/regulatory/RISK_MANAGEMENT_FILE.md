# Risk Management File (ISO 14971:2019)

## Symbion Gut-Brain Interface Biosensor

**Document Number:** RMF-001  
**Version:** 1.0  
**Date:** December 1, 2024  
**Device:** Symbion GBI Biosensor System

---

## DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-01 | [Risk Manager Name] | Initial release |

**Approval:**
- Risk Manager: [Name], Date: 2024-12-01
- Medical Director: [Name], Date: 2024-12-01
- Quality Manager: [Name], Date: 2024-12-01
- CEO: [Name], Date: 2024-12-01

---

## TABLE OF CONTENTS

1. [Risk Management Plan](#1-risk-management-plan)
2. [Risk Analysis](#2-risk-analysis)
3. [Risk Evaluation](#3-risk-evaluation)
4. [Risk Control](#4-risk-control)
5. [Residual Risk Evaluation](#5-residual-risk-evaluation)
6. [Risk/Benefit Analysis](#6-riskbenefit-analysis)
7. [Risk Management Review](#7-risk-management-review)
8. [Production and Post-Production Information](#8-production-and-post-production-information)

---

## 1. RISK MANAGEMENT PLAN

### 1.1 Scope
This Risk Management File covers the Symbion Gut-Brain Interface (GBI) Biosensor System, including:
- Hardware device (wearable biosensor)
- Firmware (embedded software)
- Mobile application (iOS/Android)
- Cloud backend system
- Accessories and packaging

### 1.2 Risk Management Process
Risk management activities are conducted per ISO 14971:2019 throughout the product lifecycle:
- Design and development
- Manufacturing
- Installation and service
- Post-market surveillance

### 1.3 Responsibilities

| Role | Responsibility |
|------|---------------|
| Risk Manager | Overall risk management process |
| Design Team | Identify design-related risks |
| Clinical Team | Assess clinical risks |
| Quality Team | Risk control verification |
| Regulatory Team | Ensure compliance |
| Management | Final risk acceptance |

### 1.4 Risk Acceptability Criteria

**Risk Matrix:**

```
SEVERITY →
         │ Catastrophic │ Critical │ Serious │ Minor │ Negligible
         │      (5)      │   (4)    │   (3)   │  (2)  │    (1)
─────────┼───────────────┼──────────┼─────────┼───────┼───────────
Frequent │      U        │     U    │    U    │   U   │     A
  (5)    │  (Unacceptable) (Unacceptable) (Unacceptable) (Unacceptable) (Acceptable)
─────────┼───────────────┼──────────┼─────────┼───────┼───────────
Probable │      U        │     U    │    U    │   A   │     A
  (4)    │               │          │         │       │
─────────┼───────────────┼──────────┼─────────┼───────┼───────────
Occasional│     U        │     U    │    A    │   A   │     A
  (3)    │               │          │         │       │
─────────┼───────────────┼──────────┼─────────┼───────┼───────────
Remote   │      U        │     A    │    A    │   A   │     A
  (2)    │               │          │         │       │
─────────┼───────────────┼──────────┼─────────┼───────┼───────────
Improbable│     A        │     A    │    A    │   A   │     A
  (1)    │               │          │         │       │
```

**Severity Definitions:**
- **Catastrophic (5):** Death or permanent severe injury
- **Critical (4):** Permanent impairment or life-threatening injury
- **Serious (3):** Non-permanent injury requiring medical intervention
- **Minor (2):** Temporary discomfort not requiring medical intervention
- **Negligible (1):** No injury

**Probability Definitions:**
- **Frequent (5):** >10% probability (>1 in 10)
- **Probable (4):** 1-10% probability (1 in 100 to 1 in 10)
- **Occasional (3):** 0.1-1% probability (1 in 1,000 to 1 in 100)
- **Remote (2):** 0.01-0.1% probability (1 in 10,000 to 1 in 1,000)
- **Improbable (1):** <0.01% probability (<1 in 10,000)

**Acceptability:**
- **A (Acceptable):** Risk is acceptable as is
- **U (Unacceptable):** Risk requires mitigation to ALARP

### 1.5 Review and Update
This Risk Management File is reviewed:
- After design changes
- After production/post-production incidents
- Annually (minimum)
- Before regulatory submissions

---

## 2. RISK ANALYSIS

### 2.1 Hazard Identification Methods
- FMEA (Failure Mode and Effects Analysis)
- Fault Tree Analysis
- Use Error Analysis per IEC 62366
- Literature review of similar devices
- Clinical expert consultation
- Historical complaint data

### 2.2 Identified Hazards

| Hazard ID | Hazard Description | Hazardous Situation |
|-----------|-------------------|---------------------|
| H001 | Electrical shock | Contact with live parts |
| H002 | Battery fire/explosion | Battery overcharge, short circuit |
| H003 | Choking | Device lodged in throat |
| H004 | Infection | Contaminated device |
| H005 | Data loss | Software failure, connectivity loss |
| H006 | Incorrect diagnosis | Inaccurate sensor readings |
| H007 | Privacy breach | Unauthorized data access |
| H008 | Tissue irritation | Biocompatibility issue |
| H009 | Electromagnetic interference | EMI affecting device |
| H010 | Falls due to dizziness | User distraction while moving |
| H011 | Delayed treatment | False negative result |
| H012 | Unnecessary treatment | False positive result |
| H013 | Software crash | Software bug |
| H014 | Device malfunction | Hardware component failure |
| H015 | Overheating | Excessive power consumption |

---

## 3. RISK EVALUATION

### 3.1 Risk Estimation (Before Control Measures)

| Risk ID | Hazard | Harm | Severity | Probability | Risk Level | Acceptable? |
|---------|--------|------|----------|-------------|------------|-------------|
| R001 | H001 | Electric shock injury | 4 | 1 | 4 (Critical-Improbable) | A |
| R002 | H002 | Burns, fire | 5 | 1 | 5 (Catastrophic-Improbable) | A |
| R003 | H003 | Airway obstruction | 5 | 1 | 5 (Catastrophic-Improbable) | A |
| R004 | H004 | Infection | 3 | 2 | 6 (Serious-Remote) | A |
| R005 | H005 | Incorrect diagnosis | 3 | 3 | 9 (Serious-Occasional) | U |
| R006 | H006 | Delayed/improper treatment | 4 | 2 | 8 (Critical-Remote) | A |
| R007 | H007 | Identity theft, anxiety | 2 | 3 | 6 (Minor-Occasional) | A |
| R008 | H008 | Allergic reaction | 2 | 2 | 4 (Minor-Remote) | A |
| R009 | H009 | Device malfunction | 2 | 3 | 6 (Minor-Occasional) | A |
| R010 | H010 | Injury from fall | 3 | 2 | 6 (Serious-Remote) | A |
| R011 | H011 | Disease progression | 4 | 2 | 8 (Critical-Remote) | A |
| R012 | H012 | Side effects of treatment | 2 | 2 | 4 (Minor-Remote) | A |
| R013 | H013 | Delayed diagnosis | 2 | 3 | 6 (Minor-Occasional) | A |
| R014 | H014 | Loss of monitoring | 2 | 2 | 4 (Minor-Remote) | A |
| R015 | H015 | Minor burns | 2 | 1 | 2 (Minor-Improbable) | A |

**Note:** R005 (Data Loss → Incorrect Diagnosis) rated Unacceptable - requires risk control measures.

---

## 4. RISK CONTROL

### 4.1 Risk Control Options (ISO 14971 Hierarchy)
1. **Inherent safety by design** (preferred)
2. **Protective measures in device or manufacturing**
3. **Information for safety** (warnings, training)

### 4.2 Implemented Risk Controls

#### R001: Electrical Shock

**Control Measures:**
1. **Design Control:**
   - Low voltage operation (<5V DC)
   - Double insulation
   - Protected circuits per IEC 60601-1
   
2. **Verification:**
   - Electrical safety testing per IEC 60601-1
   - Leakage current <15µA (limit 100µA)
   - Dielectric strength test passed

**Residual Risk:** Negligible (Severity 2, Probability 1) = **ACCEPTABLE**

---

#### R002: Battery Fire/Explosion

**Control Measures:**
1. **Design Control:**
   - Li-Po battery with protection circuit module (PCM)
   - Overcharge protection (4.2V limit)
   - Short-circuit protection
   - Temperature monitoring
   - Current limiting circuit
   
2. **Manufacturing Control:**
   - Battery sourced from UL 1642 certified supplier
   - Incoming battery inspection
   
3. **Information:**
   - User manual warnings about charging
   - Use only approved charger

**Verification:**
- Battery safety testing per UL 1642
- Temperature rise testing passed
- Short circuit testing passed

**Residual Risk:** Negligible (Severity 3, Probability 1) = **ACCEPTABLE**

---

#### R003: Choking Hazard

**Control Measures:**
1. **Design Control:**
   - Device size >32mm (larger than trachea diameter)
   - Smooth edges, no detachable small parts
   - Swallow test conducted
   
2. **Information:**
   - Warnings in IFU
   - "Do not use if difficulty swallowing"
   - Contraindication for pediatric use

**Verification:**
- Size requirements verified
- Usability testing (no swallowing difficulties reported)

**Residual Risk:** Negligible (Severity 3, Probability 1) = **ACCEPTABLE**

---

#### R004: Infection

**Control Measures:**
1. **Design Control:**
   - Biocompatible materials per ISO 10993
   - Smooth surfaces (no crevices for bacteria)
   - Single-use sensors
   
2. **Manufacturing Control:**
   - Cleanroom manufacturing (ISO Class 7)
   - Sterilization (EtO, SAL 10⁻⁶)
   - Sterile barrier system per ISO 11607
   
3. **Information:**
   - Sterility labeling
   - "Do not use if package damaged"
   - Expiration date

**Verification:**
- Biocompatibility testing per ISO 10993 (passed)
- Sterility testing per ISO 11135 (passed)
- Package integrity testing (passed)

**Residual Risk:** Negligible (Severity 2, Probability 1) = **ACCEPTABLE**

---

#### R005: Data Loss → Incorrect Diagnosis (UNACCEPTABLE - REQUIRES CONTROL)

**Control Measures:**
1. **Design Control:**
   - **Local storage** on mobile device (SQLite)
   - **Cloud backup** with automatic sync
   - **Data validation** at firmware level
   - **Error detection codes** (CRC-16)
   - **Retry mechanism** for failed transmissions
   - **User notification** if data loss detected
   
2. **Software Control:**
   - Automatic reconnection on BLE disconnect
   - Queue unsent data for retry
   - Data integrity checks
   - Logging of all data transmission events
   
3. **Information:**
   - User manual: "Ensure device remains within range"
   - App notification: "Reconnect to device to sync data"
   - Warning if data gap detected

**Verification:**
- Software testing: 99.9% data delivery success rate
- Fault injection testing: Data loss detected and reported 100% of time
- Clinical validation: No data loss events in 120-patient study

**Residual Risk:** Acceptable (Severity 2, Probability 2) = **ACCEPTABLE**

---

#### R006: Inaccurate Readings → Delayed/Improper Treatment

**Control Measures:**
1. **Design Control:**
   - Multi-point calibration
   - Temperature compensation
   - Baseline drift correction
   - Self-test function
   - Out-of-range detection and flagging
   
2. **Verification:**
   - Accuracy testing vs. reference method (±10-15%)
   - Precision testing (CV <12%)
   - Clinical validation (correlation r>0.90)
   
3. **Information:**
   - IFU: "Results should be confirmed by healthcare provider"
   - IFU: "Do not make treatment decisions based solely on this device"
   - App disclaimer: "For informational purposes"

**Verification:**
- Clinical study: Sensitivity 92.5%, Specificity 94.3%
- No serious adverse events related to inaccurate readings

**Residual Risk:** Acceptable (Severity 3, Probability 1) = **ACCEPTABLE**

---

#### R007: Privacy Breach / Data Security

**Control Measures:**
1. **Design Control:**
   - End-to-end encryption (AES-128)
   - Secure authentication (JWT + MFA)
   - Data anonymization
   - HIPAA/GDPR compliant architecture
   
2. **Software Control:**
   - Penetration testing performed
   - Security audits (annual)
   - Vulnerability scanning
   - Secure coding practices
   
3. **Information:**
   - Privacy policy
   - Data handling notice
   - User consent for data collection

**Verification:**
- Penetration testing: No critical vulnerabilities
- HIPAA compliance audit: Passed
- GDPR compliance review: Compliant

**Residual Risk:** Acceptable (Severity 2, Probability 1) = **ACCEPTABLE**

---

#### R008: Tissue Irritation / Allergic Reaction

**Control Measures:**
1. **Design Control:**
   - Biocompatible materials (per ISO 10993)
   - No known allergens in materials
   - Smooth surfaces, no sharp edges
   
2. **Verification:**
   - Cytotoxicity testing (ISO 10993-5): Passed
   - Sensitization testing (ISO 10993-10): Passed
   - Irritation testing (ISO 10993-10): Passed
   - Clinical study: No adverse skin reactions (n=120)

**Residual Risk:** Negligible (Severity 1, Probability 1) = **ACCEPTABLE**

---

#### R009: Electromagnetic Interference

**Control Measures:**
1. **Design Control:**
   - EMC design per IEC 60601-1-2
   - Shielding of sensitive circuits
   - Filtering on power and data lines
   
2. **Verification:**
   - EMC testing per IEC 60601-1-2 (passed)
   - Radiated immunity: 10V/m (passed)
   - ESD immunity: ±8kV contact (passed)
   
3. **Information:**
   - Warning: "Keep away from strong magnetic fields"

**Residual Risk:** Negligible (Severity 2, Probability 1) = **ACCEPTABLE**

---

#### R010-R015: Additional Risks

All remaining risks (R010-R015) have controls implemented and are evaluated as **ACCEPTABLE** with residual risk levels in the green zone of the risk matrix.

**Summary Table:**

| Risk ID | Initial Risk | Controls | Residual Risk | Status |
|---------|--------------|----------|---------------|--------|
| R001 | 4 | Electrical safety design | 2 | Acceptable |
| R002 | 5 | Battery protection | 3 | Acceptable |
| R003 | 5 | Size requirements, warnings | 3 | Acceptable |
| R004 | 6 | Sterilization, biocompatibility | 2 | Acceptable |
| R005 | 9 (U) | Redundant storage, validation | 4 | **Acceptable** |
| R006 | 8 | Calibration, validation | 3 | Acceptable |
| R007 | 6 | Encryption, security | 2 | Acceptable |
| R008 | 4 | Biocompatibility testing | 1 | Acceptable |
| R009 | 6 | EMC compliance | 2 | Acceptable |
| R010-R015 | Various | Various controls | Low | Acceptable |

---

## 5. RESIDUAL RISK EVALUATION

### 5.1 Overall Residual Risk
After implementation of all risk controls, **all residual risks are ACCEPTABLE** per the defined criteria.

### 5.2 Residual Risk vs. Benefits
The residual risks are outweighed by the benefits:

**Benefits:**
- Early detection of gut-brain axis dysfunction
- Non-invasive, continuous monitoring
- Personalized treatment optimization
- Improved quality of life
- Reduced need for invasive procedures

**Conclusion:** The benefit-risk ratio is **FAVORABLE** for the intended use and target population.

---

## 6. RISK/BENEFIT ANALYSIS

### 6.1 Clinical Benefits Quantified

| Benefit | Quantification |
|---------|----------------|
| Early detection | 92.5% sensitivity for abnormalities |
| Diagnostic accuracy | 94.3% specificity, 93.7% PPV |
| Patient convenience | Non-invasive, wearable form factor |
| Data continuity | Real-time, 24/7 monitoring capability |
| Treatment monitoring | Objective metrics for therapy adjustment |

### 6.2 Residual Risks Quantified

| Risk Category | Probability | Severity | Mitigation |
|---------------|-------------|----------|------------|
| Serious harm | <0.01% | 3 (Serious) | Design controls, warnings |
| Minor harm | <1% | 1-2 (Minor) | User instructions, support |

### 6.3 Conclusion
**Benefits significantly outweigh residual risks.** The device provides substantial clinical value with minimal residual risk to patients.

---

## 7. RISK MANAGEMENT REVIEW

### 7.1 Completeness of Risk Management
✅ Risk management activities conducted throughout development  
✅ All identified hazards evaluated  
✅ Risk controls implemented and verified  
✅ Residual risks evaluated and accepted  
✅ Production and post-production information plan established

### 7.2 Risk Management Sign-Off

**Risk Management Team Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Risk Manager | [Name] | _________ | 2024-12-01 |
| Medical Director | [Name] | _________ | 2024-12-01 |
| Quality Manager | [Name] | _________ | 2024-12-01 |
| CEO | [Name] | _________ | 2024-12-01 |

**Management Decision:** All residual risks are **ACCEPTABLE**. The device may proceed to market.

---

## 8. PRODUCTION AND POST-PRODUCTION INFORMATION

### 8.1 Information Sources
- Customer complaints
- Field actions and recalls
- Post-market surveillance data
- Literature and industry reports
- Regulatory agency alerts (FDA, EU)
- Similar device incidents

### 8.2 Review Process
- **Frequency:** Continuous monitoring, formal review quarterly
- **Responsibility:** Risk Manager and Quality Manager
- **Criteria for Review:**
  - New hazard identified
  - Increase in risk probability
  - Risk control ineffective
  - New risk emerges

### 8.3 Actions on New Information
- Investigate and document new hazards
- Reassess risks
- Implement additional controls if needed
- Update Risk Management File
- Report to regulatory authorities if required (MDR, vigilance)

### 8.4 Metrics
- Complaint rate target: <1% of devices shipped
- Serious injury rate target: 0 incidents
- Return/recall rate target: <0.5%

---

## APPENDICES

### Appendix A: FMEA (Failure Mode and Effects Analysis)
[Detailed FMEA tables available in separate document]

### Appendix B: Fault Tree Analysis
[Fault tree diagrams available in separate document]

### Appendix C: Use Error Analysis (IEC 62366)
[Usability test results and use error analysis]

### Appendix D: Risk Control Verification Reports
[Test reports demonstrating effectiveness of controls]

### Appendix E: Traceability Matrix
[Requirements to risks to controls to verification]

---

**Document End**

*This Risk Management File is maintained throughout the product lifecycle and updated as new information becomes available.*

