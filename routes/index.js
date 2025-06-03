const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const messageRoutes = require('./messageRoutes');

// Define API routes
router.use('/users', userRoutes);
router.use('/messages', messageRoutes);

/**
 * @swagger
 * tags:
 *   name: General
 *   description: Base API endpoints
 */

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API welcome message
 *     description: Returns a welcome message and available endpoints
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message with available endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to the Messaging API
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: string
 *                       example: /api/users
 *                     messages:
 *                       type: string
 *                       example: /api/messages
 */
// Define base route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Messaging API',
    endpoints: {
      users: '/api/users',
      messages: '/api/messages'
    }
  });
});

module.exports = router; 