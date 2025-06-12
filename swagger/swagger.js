const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Messaging API',
      version: '1.0.0',
      description: 'A simple messaging API built with Express and MongoDB',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current server (relative path)',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server (full URL)',
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password', 'firstName', 'lastName'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID (auto-generated)',
            },
            username: {
              type: 'string',
              description: 'User\'s unique username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address',
            },
            password: {
              type: 'string',
              description: 'User\'s password (hashed)',
            },
            firstName: {
              type: 'string',
              description: 'User\'s first name',
            },
            lastName: {
              type: 'string',
              description: 'User\'s last name',
            },
            profilePicture: {
              type: 'string',
              description: 'URL to user\'s profile picture',
            },
            bio: {
              type: 'string',
              description: 'User\'s biography',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user was created',
            },
            lastActive: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the user was last active',
            },
            contacts: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of user\'s contacts (User IDs)',
            },
          },
        },
        Message: {
          type: 'object',
          required: ['sender', 'recipient', 'content'],
          properties: {
            _id: {
              type: 'string',
              description: 'Message ID (auto-generated)',
            },
            sender: {
              type: 'string',
              description: 'ID of the user sending the message',
            },
            recipient: {
              type: 'string',
              description: 'ID of the user receiving the message',
            },
            content: {
              type: 'string',
              description: 'Content of the message',
            },
            attachments: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of attachment URLs',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the message was created',
            },
            isRead: {
              type: 'boolean',
              description: 'Whether the message has been read',
            },
            readAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the message was read',
            },
            status: {
              type: 'string',
              enum: ['sent', 'delivered', 'read', 'failed'],
              description: 'Status of the message',
            },
            isDeleted: {
              type: 'boolean',
              description: 'Whether the message has been deleted',
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the message was deleted',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'string',
              description: 'Error details',
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec; 