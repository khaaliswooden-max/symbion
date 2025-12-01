/**
 * k6 Load Test Script for Symbion API
 * 
 * To run: k6 run --vus 50 --duration 5m load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // Start with 10 virtual users
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be below 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function () {
  // Health check endpoint
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // TODO: Add more realistic load test scenarios when API is deployed
  // - User authentication
  // - Sensor data submission
  // - Data retrieval
  // - Analytics queries
}

export function handleSummary(data) {
  return {
    'results/summary.json': JSON.stringify(data),
  };
}

