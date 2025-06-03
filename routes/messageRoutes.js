const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { validateMessage, validateId } = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management endpoints
 */

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get all messages
 *     description: Retrieve a list of all messages with pagination
 *     tags: [Messages]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of messages
 *       500:
 *         description: Server error
 */
router.get('/', messageController.getAllMessages);

/**
 * @swagger
 * /api/messages/between/{userId}/{otherUserId}:
 *   get:
 *     summary: Get messages between two users
 *     description: Retrieve messages exchanged between two users
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the first user
 *         schema:
 *           type: string
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         description: ID of the second user
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of messages between the two users
 *       400:
 *         description: Invalid user ID format
 *       500:
 *         description: Server error
 */
router.get('/between/:userId/:otherUserId', messageController.getMessagesBetweenUsers);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Get a message by ID
 *     description: Retrieve a single message by its ID
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the message to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message details
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.get('/:id', validateId, messageController.getMessageById);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Create a new message
 *     description: Send a new message from one user to another
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender
 *               - recipient
 *               - content
 *             properties:
 *               sender:
 *                 type: string
 *                 description: ID of the user sending the message
 *               recipient:
 *                 type: string
 *                 description: ID of the user receiving the message
 *               content:
 *                 type: string
 *                 description: Content of the message
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of attachment URLs
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/', validateMessage, messageController.createMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   put:
 *     summary: Update a message
 *     description: Update a message's content or status
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the message to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated content of the message
 *               isRead:
 *                 type: boolean
 *                 description: Whether the message has been read
 *               readAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the message was read
 *               status:
 *                 type: string
 *                 enum: [sent, delivered, read, failed]
 *                 description: Status of the message
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateId, messageController.updateMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     description: Soft delete a message by marking it as deleted
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the message to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', validateId, messageController.deleteMessage);

/**
 * @swagger
 * /api/messages/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a message
 *     description: Permanently remove a message from the database
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the message to delete permanently
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message permanently deleted
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/permanent', validateId, messageController.permanentlyDeleteMessage);

module.exports = router; 