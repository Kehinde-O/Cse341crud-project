# Authentication Setup Guide

This document explains how to set up authentication for your messaging application.

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
USER_DB_CONNECTION_STRING=mongodb://localhost:27017/messaging_users
MESSAGE_DB_CONNECTION_STRING=mongodb://localhost:27017/messaging_messages

# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRE=7d

# Session Configuration (REQUIRED)
SESSION_SECRET=your-session-secret-change-this-in-production

# Google OAuth Configuration (OPTIONAL)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Email Configuration (for future email verification)
EMAIL_FROM=noreply@yourapp.com
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Required Environment Variables

⚠️ **IMPORTANT**: You must set these environment variables before starting the server:

1. **JWT_SECRET**: A strong secret key for signing JWT tokens
2. **JWT_REFRESH_SECRET**: A different strong secret key for refresh tokens
3. **SESSION_SECRET**: A secret key for session management

Generate strong secrets using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Google OAuth Setup (Optional)

If you want to enable Google OAuth login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add your callback URL: `http://localhost:3000/api/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout (requires authentication)
- `POST /api/auth/logout-all` - Logout from all devices (requires authentication)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile (requires authentication)
- `PUT /api/auth/profile` - Update user profile (requires authentication)
- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Protected Endpoints

All message endpoints now require authentication:
- `GET /api/messages` - Get all messages (requires authentication)
- `POST /api/messages` - Send a message (requires authentication)
- `GET /api/messages/:id` - Get specific message (requires authentication)
- `PUT /api/messages/:id` - Update message (requires authentication)
- `DELETE /api/messages/:id` - Delete message (requires authentication)

## Authentication Flow

### Register/Login Flow

1. **Register**: `POST /api/auth/register`
   ```json
   {
     "username": "johndoe",
     "email": "john@example.com",
     "password": "password123",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```

2. **Login**: `POST /api/auth/login`
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Response** (for both register and login):
   ```json
   {
     "message": "Login successful",
     "user": { /* user data */ },
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

### Using Protected Endpoints

Include the access token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Sending Messages

Now when sending messages, you only need to provide the recipient and content:

```json
{
  "recipient": "user_id_here",
  "content": "Hello, this is a message!",
  "attachments": ["optional_attachment_url"]
}
```

The sender is automatically set to the authenticated user.

### Token Refresh

When your access token expires, use the refresh token to get a new one:

```json
POST /api/auth/refresh
{
  "refreshToken": "your_refresh_token_here"
}
```

## Testing with Swagger

1. Start your server: `npm start`
2. Open http://localhost:3000/api-docs
3. Use the "Authorize" button to set your Bearer token
4. Test the protected endpoints

## Security Features Implemented

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on authentication endpoints
- ✅ Security headers with Helmet
- ✅ Session management
- ✅ Google OAuth integration
- ✅ Protected message endpoints
- ✅ Refresh token system
- ✅ Input validation and sanitization

## Troubleshooting

### Common Issues

1. **"JWT_SECRET is not defined"**
   - Make sure you have created a `.env` file with all required variables

2. **"Invalid token"**
   - Check that you're including the Bearer token in the Authorization header
   - Ensure the token hasn't expired

3. **Google OAuth not working**
   - Verify your Google OAuth credentials in the `.env` file
   - Check that your callback URL is correctly configured in Google Cloud Console

4. **Rate limiting errors**
   - Wait for the rate limit window to reset (15 minutes)
   - Reduce the frequency of requests

## Next Steps

Consider implementing these additional features:
- Email verification for new accounts
- Password reset functionality
- User roles and permissions
- Account lockout after failed login attempts
- Activity logging and audit trails 