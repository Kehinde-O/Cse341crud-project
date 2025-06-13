const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateUser } = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         profilePicture:
 *           type: string
 *         bio:
 *           type: string
 *         authProvider:
 *           type: string
 *           enum: [local, google]
 *         isEmailVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         lastActive:
 *           type: string
 *           format: date-time
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 7
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         profilePicture:
 *           type: string
 *         bio:
 *           type: string
 *           maxLength: 200
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input data or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post('/register', authLimiter, validateUser, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', authLimiter, authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user and invalidate refresh token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Logout user from all devices by invalidating all refresh tokens
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *       401:
 *         description: Unauthorized
 */
router.post('/logout-all', authenticateToken, authController.logoutAll);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Refresh token required
 *       403:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', authController.refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Get the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *                 maxLength: 200
 *               profilePicture:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: No valid updates provided
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticateToken, authController.updateProfile);

// GitHub OAuth routes (only if GitHub OAuth is configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  /**
   * @swagger
   * /api/auth/github:
   *   get:
   *     summary: GitHub OAuth login
   *     description: Initiate GitHub OAuth authentication
   *     tags: [Authentication]
   *     responses:
   *       302:
   *         description: Redirect to GitHub OAuth
   */
  router.get('/github', 
    passport.authenticate('github', { scope: ['user:email'] })
  );

  /**
   * @swagger
   * /api/auth/github/callback:
   *   get:
   *     summary: GitHub OAuth callback
   *     description: Handle GitHub OAuth callback and complete authentication
   *     tags: [Authentication]
   *     responses:
   *       302:
   *         description: Redirect to frontend with authentication tokens
   *       401:
   *         description: Authentication failed
   */
  router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    authController.googleCallback // Reuse the same callback handler
  );
} else {
  // Provide informational endpoints when GitHub OAuth is not configured
  router.get('/github', (req, res) => {
    res.status(501).json({
      message: 'GitHub OAuth not configured',
      error: 'Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables to enable GitHub authentication.'
    });
  });
  
  router.get('/github/callback', (req, res) => {
    res.status(501).json({
      message: 'GitHub OAuth not configured',
      error: 'Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables to enable GitHub authentication.'
    });
  });
}

module.exports = router; 