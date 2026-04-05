// src/routes/device.routes.js
// Device management routes

import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import * as deviceController from '../controllers/device.controller.js';

const router = express.Router();

// All device routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Get user's devices
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of devices
 */
router.get('/', deviceController.getDevices);

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Register new device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - name
 *             properties:
 *               deviceId:
 *                 type: string
 *               name:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device registered
 */
router.post(
  '/',
  [
    body('deviceId').notEmpty(),
    body('name').trim().notEmpty(),
  ],
  deviceController.registerDevice
);

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Get device details
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device details
 */
router.get('/:id', deviceController.getDeviceById);

/**
 * @swagger
 * /devices/{id}:
 *   put:
 *     summary: Update device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Device updated
 */
router.put('/:id', deviceController.updateDevice);

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Delete device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device deleted
 */
router.delete('/:id', deviceController.deleteDevice);

/**
 * @swagger
 * /devices/{id}/status:
 *   post:
 *     summary: Update device status
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batteryLevel:
 *                 type: number
 *               firmwareVersion:
 *                 type: string
 *               lastSync:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Status updated
 */
router.post('/:id/status', deviceController.updateDeviceStatus);

export default router;

