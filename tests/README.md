# Symbion Test Suite

Comprehensive automated testing for the Symbion platform.

## Overview

The Symbion test suite includes:
- **Firmware Tests:** Unit tests for embedded C++ modules (PlatformIO + Unity)
- **Mobile App Tests:** React Native component and integration tests (Jest + React Testing Library)
- **Backend API Tests:** Node.js API endpoint and service tests (Jest + Supertest)
- **Integration Tests:** End-to-end testing across all components
- **Clinical Tests:** Validation protocols for medical device compliance

## Directory Structure

```
tests/
├── unit/               # Unit tests (component-level)
│   ├── firmware/       # Firmware unit tests
│   ├── mobile/         # Mobile app unit tests
│   └── backend/        # Backend API unit tests
├── integration/        # Integration tests (system-level)
│   ├── ble/           # BLE communication tests
│   ├── api/           # API integration tests
│   └── e2e/           # End-to-end tests
└── clinical/          # Clinical validation tests
    ├── accuracy/      # Sensor accuracy tests
    ├── safety/        # Safety validation
    └── usability/     # Usability testing protocols
```

## Running Tests

### Firmware Tests

```bash
cd firmware
pio test
```

Run specific test:
```bash
pio test -f test_sensor_manager
```

### Mobile App Tests

```bash
cd mobile-app
npm test
```

With coverage:
```bash
npm test -- --coverage
```

Watch mode:
```bash
npm run test:watch
```

### Backend API Tests

```bash
cd cloud-backend
npm test
```

Unit tests only:
```bash
npm run test:unit
```

Integration tests:
```bash
npm run test:integration
```

### All Tests

Run from project root:
```bash
./run_all_tests.sh
```

## Test Coverage Goals

| Component | Target Coverage | Current Coverage |
|-----------|----------------|------------------|
| Firmware | ≥ 80% | TBD |
| Mobile App | ≥ 75% | TBD |
| Backend API | ≥ 85% | TBD |
| Integration | ≥ 70% | TBD |

## Firmware Tests

### Test Modules

1. **test_sensor_manager.cpp**
   - Sensor initialization
   - ADC calibration
   - Self-test functionality
   - Range validation
   - Multiple readings

2. **test_signal_processing.cpp**
   - Butterworth filter
   - Kalman filter
   - Delta encoding
   - Noise reduction

3. **test_ble_comms.cpp**
   - BLE initialization
   - Advertising
   - Connection handling
   - Data transmission
   - Encryption

4. **test_power_manager.cpp**
   - Sleep modes
   - Battery monitoring
   - DVS (Dynamic Voltage Scaling)
   - Peripheral control

5. **test_aes.cpp**
   - AES-128 encryption
   - CBC mode
   - PKCS7 padding
   - Round-trip verification

### Running on Hardware

Connect J-Link debugger:
```bash
pio test --upload-port /dev/ttyUSB0
```

View serial output:
```bash
pio device monitor
```

## Mobile App Tests

### Test Files

1. **BLEService.test.js**
   - Device scanning
   - Connection management
   - Data parsing
   - Command sending

2. **deviceSlice.test.js**
   - Redux state management
   - Device discovery
   - Connection status
   - Battery monitoring

3. **sensorSlice.test.js**
   - Sensor data handling
   - History management
   - Alerts

4. **Screen tests**
   - Component rendering
   - User interactions
   - Navigation

### Mocking

BLE Manager is mocked to allow testing without hardware:
```javascript
jest.mock('react-native-ble-plx');
```

## Backend API Tests

### Test Suites

1. **auth.test.js**
   - User registration
   - Login/logout
   - Token refresh
   - Password reset

2. **analytics.test.js**
   - Summary statistics
   - Trend detection
   - Correlations
   - Anomaly detection
   - Data export

3. **device.test.js**
   - Device registration
   - Device pairing
   - Firmware updates

4. **sensor.test.js**
   - Data ingestion
   - Data retrieval
   - Filtering
   - Aggregation

### Test Database

Tests use a separate MongoDB database:
```
MONGODB_TEST_URI=mongodb://localhost:27017/symbion_test
```

Database is automatically cleaned between tests.

## Integration Tests

### BLE Integration

Tests communication between firmware and mobile app:
```
firmware <--BLE--> mobile-app
```

Requirements:
- nRF52832 device or simulator
- Mobile device/emulator with BLE

### API Integration

Tests communication between mobile app and backend:
```
mobile-app <--HTTPS--> cloud-backend <---> MongoDB
```

### End-to-End

Complete workflow testing:
```
firmware -> BLE -> mobile-app -> API -> backend -> database
```

## Clinical Validation Tests

### Accuracy Testing

Verify biosensor accuracy against reference standards:
- Serotonin: ±10% of reference
- Dopamine: ±12% of reference
- GABA: ±15% of reference
- pH: ±0.2 units
- Temperature: ±0.5°C

### Safety Testing

- Electrical safety (IEC 60601-1)
- Biocompatibility (ISO 10993)
- EMC compliance (IEC 60601-1-2)
- Battery safety (UL 1642)

### Usability Testing

- User task completion rate: ≥95%
- User satisfaction score: ≥4.0/5.0
- Setup time: <5 minutes
- Training time: <15 minutes

## Continuous Integration

Tests run automatically on:
- Every push to `develop` branch
- Every pull request to `main` branch
- Nightly builds

### GitHub Actions

See `.github/workflows/` for CI/CD configuration:
- `firmware-tests.yml`
- `mobile-tests.yml`
- `backend-tests.yml`
- `integration-tests.yml`

## Test Reports

Test results are published to:
- Console output
- JUnit XML (for CI integration)
- HTML coverage reports
- Slack notifications (on failure)

### Viewing Reports

After running tests:
```bash
# Mobile app coverage
open mobile-app/coverage/lcov-report/index.html

# Backend coverage
open cloud-backend/coverage/lcov-report/index.html
```

## Writing New Tests

### Firmware Tests (Unity)

```cpp
void test_my_feature(void) {
    // Arrange
    int expected = 42;
    
    // Act
    int actual = myFunction();
    
    // Assert
    TEST_ASSERT_EQUAL(expected, actual);
}
```

### Mobile Tests (Jest)

```javascript
describe('MyComponent', () => {
    it('should render correctly', () => {
        const { getByText } = render(<MyComponent />);
        expect(getByText('Hello')).toBeTruthy();
    });
});
```

### Backend Tests (Jest + Supertest)

```javascript
describe('GET /api/endpoint', () => {
    it('should return data', async () => {
        const res = await request(app)
            .get('/api/endpoint')
            .expect(200);
        
        expect(res.body).toHaveProperty('data');
    });
});
```

## Troubleshooting

### Firmware Tests Fail

- Check hardware connections
- Verify serial port
- Update PlatformIO
- Check power supply

### Mobile Tests Fail

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm test -- --clearCache`
- Check React Native version compatibility

### Backend Tests Fail

- Ensure MongoDB is running
- Check environment variables
- Clear test database
- Verify Node.js version

### CI/CD Failures

- Check GitHub Actions logs
- Verify secrets are set
- Check dependency versions
- Review recent commits

## Performance Benchmarks

| Test Suite | Target Time | Actual Time |
|------------|-------------|-------------|
| Firmware Unit | <2 min | TBD |
| Mobile Unit | <30 sec | TBD |
| Backend Unit | <10 sec | TBD |
| Integration | <5 min | TBD |
| Full Suite | <10 min | TBD |

## Quality Gates

All tests must pass before:
- Merging to `main` branch
- Creating a release
- Deploying to production

### Minimum Requirements

- ✅ All unit tests pass
- ✅ Code coverage meets thresholds
- ✅ No critical linter errors
- ✅ Integration tests pass
- ✅ Performance benchmarks met

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure tests pass locally
3. Maintain or improve coverage
4. Update this documentation

## Resources

- [Unity Test Framework](http://www.throwtheswitch.org/unity)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
- [PlatformIO Testing](https://docs.platformio.org/en/latest/plus/unit-testing.html)

---

Last Updated: 2024-12-01

