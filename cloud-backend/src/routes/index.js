// src/routes/index.js
// Main router - combines all route modules

import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import deviceRoutes from './device.routes.js';
import sensorRoutes from './sensor.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = express.Router();

// Route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);
router.use('/sensors', sensorRoutes);
router.use('/analytics', analyticsRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'Symbion Gut-Brain Interface API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      devices: '/api/v1/devices',
      sensors: '/api/v1/sensors',
      analytics: '/api/v1/analytics',
      docs: '/api-docs',
    },
  });
});

export default router;

