# Messaging API - CRUD Project

A simple messaging application backend using MongoDB and Express.

## Features

- User management (CRUD operations)
- Messaging system
- RESTful API design
- Swagger documentation

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- Swagger

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd crud-project
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the setup script to create your `.env` file:
   ```
   npm run setup
   ```
   Follow the prompts to configure your MongoDB connection and other settings.

   Alternatively, you can manually create a `.env` file in the root directory with the following variables:
   ```
   PORT=8080
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   NODE_ENV=development
   ```
   Replace `<username>`, `<password>`, `<cluster>`, and `<database>` with your MongoDB Atlas credentials.

## Running the Application

1. Start the server:
   ```
   npm start
   ```

2. For development with automatic restarts:
   ```
   npm run dev
   ```

3. Access the API documentation:
   ```
   http://localhost:8080/api-docs
   ```

## API Endpoints

- **Users**
  - GET `/api/users` - Get all users
  - GET `/api/users/:id` - Get user by ID
  - POST `/api/users` - Create a new user
  - PUT `/api/users/:id` - Update user
  - DELETE `/api/users/:id` - Delete user

- **Messages**
  - GET `/api/messages` - Get all messages
  - GET `/api/messages/:id` - Get message by ID
  - GET `/api/messages/between/:userId/:otherUserId` - Get messages between two users
  - POST `/api/messages` - Create a new message
  - PUT `/api/messages/:id` - Update message
  - DELETE `/api/messages/:id` - Delete message (soft delete)
  - DELETE `/api/messages/:id/permanent` - Permanently delete message

## License

ISC 