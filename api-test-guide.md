# Complete API Testing Guide

## Overview

This guide covers all available APIs in the CRUD messaging project, including authentication methods, endpoint testing, and usage examples for both browser and API clients (like Postman).

## Authentication Methods

### 1. GitHub OAuth (Browser-Based)
- **Best for**: Web browser usage
- **Authentication**: Session-based (cookies)
- **Persistence**: Automatic session management

### 2. Email/Password with JWT (API Clients)
- **Best for**: API clients (Postman, mobile apps, etc.)
- **Authentication**: JWT Bearer tokens
- **Persistence**: Manual token management

## Base URLs

- **Local Development**: `http://localhost:3001`
- **Production**: `https://your-app.onrender.com`

---

## 🔐 Authentication Endpoints

### 1. GitHub OAuth Authentication (Browser)

#### Initiate GitHub OAuth
```http
GET /api/auth/github
```

**Usage in Browser:**
1. Navigate to: `http://localhost:3001/api/auth/github`
2. Complete GitHub OAuth flow
3. Session automatically established
4. Use browser for subsequent API calls

**Response:** Redirects to GitHub OAuth

#### GitHub OAuth Callback
```http
GET /api/auth/github/callback?code=GITHUB_CODE
```

**Automatic Response:**
```json
{
  "message": "OAuth login successful",
  "user": {
    "id": "user_id",
    "username": "github_username",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "authProvider": "github"
  },
  "sessionActive": true,
  "note": "Session authentication active. Set JWT_SECRET for API token access."
}
```

### 2. Email/Password Authentication (API Clients)

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login with Email/Password
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Token Management

#### Refresh Access Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

#### Logout (Single Device)
```http
POST /api/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Logout All Devices
```http
POST /api/auth/logout-all
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 4. Profile Management

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "firstName": "Updated Name",
  "lastName": "Updated Last",
  "bio": "Updated bio"
}
```

#### Check Authentication Status
```http
GET /api/auth/status
```

---

## 💬 Message Endpoints (Protected)

All message endpoints require authentication (session or JWT token).

### 1. Get All Messages

#### Browser (with session):
```http
GET /api/messages
```

#### API Client (with JWT):
```http
GET /api/messages
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "messages": [
    {
      "_id": "message_id",
      "content": "Hello world!",
      "author": {
        "_id": "user_id",
        "username": "testuser",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

### 2. Create New Message

#### Browser (with session):
```http
POST /api/messages
Content-Type: application/json

{
  "content": "This is my new message!"
}
```

#### API Client (with JWT):
```http
POST /api/messages
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "content": "This is my new message!"
}
```

### 3. Get Single Message

```http
GET /api/messages/{message_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 4. Update Message (Author Only)

```http
PUT /api/messages/{message_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "content": "Updated message content"
}
```

### 5. Delete Message (Author Only)

```http
DELETE /api/messages/{message_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 👥 User Endpoints (Protected)

### 1. Get All Users

```http
GET /api/users
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 2. Get Single User

```http
GET /api/users/{user_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 3. Update User (Self Only)

```http
PUT /api/users/{user_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name",
  "bio": "New bio"
}
```

### 4. Delete User (Self Only)

```http
DELETE /api/users/{user_id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🧪 Testing Scenarios

### Scenario 1: Browser-Based Testing (GitHub OAuth)

1. **Authenticate via GitHub:**
   ```
   Navigate to: http://localhost:3001/api/auth/github
   Complete OAuth flow
   ```

2. **Test session persistence:**
   ```http
   GET /api/auth/status
   # Should show authenticated: true
   ```

3. **Create a message (no auth header needed):**
   ```http
   POST /api/messages
   Content-Type: application/json
   
   {
     "content": "Testing with session auth!"
   }
   ```

4. **Get messages (no auth header needed):**
   ```http
   GET /api/messages
   ```

### Scenario 2: API Client Testing (Postman)

1. **Register or Login:**
   ```http
   POST /api/auth/login
   Content-Type: application/json
   
   {
     "email": "test@example.com",
     "password": "securepassword123"
   }
   ```

2. **Copy access token from response**

3. **Set Authorization header for all requests:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Test protected endpoints:**
   ```http
   GET /api/messages
   Authorization: Bearer YOUR_TOKEN
   ```

### Scenario 3: Mixed Authentication Testing

1. **Login via GitHub OAuth in browser**
2. **Get JWT token via email/password in Postman**
3. **Test that both authentication methods work for the same user**

---

## 🔧 Environment Setup

### Required Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/crud-project

# Session Management
SESSION_SECRET=your-super-secret-session-key

# JWT Tokens (optional for OAuth users)
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# Server
PORT=3001
NODE_ENV=development
```

---

## 📋 Postman Collection Setup

### 1. Create Environment Variables

```json
{
  "baseUrl": "http://localhost:3001",
  "accessToken": "",
  "refreshToken": "",
  "userId": ""
}
```

### 2. Pre-request Script for Token Management

```javascript
// Auto-set authorization header if token exists
if (pm.environment.get("accessToken")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("accessToken")
    });
}
```

### 3. Test Script for Login Endpoints

```javascript
// Save tokens from login response
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.accessToken) {
        pm.environment.set("accessToken", response.accessToken);
    }
    if (response.refreshToken) {
        pm.environment.set("refreshToken", response.refreshToken);
    }
    if (response.user && response.user.id) {
        pm.environment.set("userId", response.user.id);
    }
}
```

---

## 🐛 Troubleshooting

### Common Issues

1. **"Access token or login session required"**
   - **Browser**: Complete GitHub OAuth first
   - **API Client**: Include `Authorization: Bearer TOKEN` header

2. **"Invalid token"**
   - Token may be expired, use refresh token
   - Ensure JWT_SECRET is configured

3. **"GitHub OAuth not configured"**
   - Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
   - Verify callback URL in GitHub app settings

4. **Session not persisting in browser**
   - Ensure cookies are enabled
   - Check SESSION_SECRET is configured

### Debug Commands

```bash
# Check authentication status
curl http://localhost:3001/api/auth/status

# Test with JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/messages

# Test session-based (after OAuth in browser)
curl -b cookies.txt http://localhost:3001/api/messages
```

---

## 📚 API Documentation

For interactive API documentation, visit:
- **Local**: http://localhost:3001/api-docs
- **Production**: https://your-app.onrender.com/api-docs

The Swagger documentation includes:
- All endpoint details
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

---

## 🔒 Security Notes

1. **JWT Tokens**: Store securely, don't expose in client-side code
2. **Sessions**: Automatically managed by browser cookies
3. **HTTPS**: Required for production OAuth callbacks
4. **Rate Limiting**: 10 requests/15min for auth endpoints
5. **CORS**: Configured for cross-origin requests

---

## 📞 Support

If you encounter issues:

1. Check server logs for detailed error messages
2. Verify environment variables are correctly set
3. Test authentication status endpoint
4. Use browser developer tools to inspect network requests
5. Try alternative authentication method (OAuth vs JWT)

The application supports multiple authentication methods to ensure flexibility for different use cases. 