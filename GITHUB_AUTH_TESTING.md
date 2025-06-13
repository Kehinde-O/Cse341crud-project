# GitHub OAuth Authentication Testing Guide

## Issues Fixed

### 1. ✅ LastName Validation Error
- **Problem**: GitHub OAuth was failing due to required `lastName` field
- **Solution**: 
  - Made `lastName` optional in user model with default empty string
  - Updated validation middleware to not require `lastName`
  - Added intelligent name parsing from GitHub profile data

### 2. ✅ Session-Based Authentication
- **Problem**: Need persistent session authentication after GitHub login
- **Solution**:
  - Updated authentication middleware to check both JWT tokens and sessions
  - Implemented proper session handling for OAuth users
  - Added authentication status endpoint

### 3. ✅ Hybrid Authentication System
- **Authentication Methods Supported**:
  - JWT Bearer tokens (for API access)
  - Session-based authentication (for OAuth users)
  - Optional authentication (for public endpoints with user context)

## Testing GitHub OAuth

### Step 1: Set Up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: Your App Name
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables

Add to your `.env` file:
```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

### Step 3: Test GitHub OAuth Flow

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Initiate GitHub OAuth**:
   ```bash
   # This will redirect to GitHub for authentication
   curl -v http://localhost:3001/api/auth/github
   ```
   
   Or open in browser: http://localhost:3001/api/auth/github

3. **After GitHub authentication**, the callback will:
   - Create/login user with GitHub profile data
   - Establish a session
   - Return user info and optional JWT tokens

### Step 4: Test Session Authentication

After successful GitHub login, test protected endpoints:

```bash
# Check authentication status
curl -b cookies.txt http://localhost:3001/api/auth/status

# Access protected endpoints using session
curl -b cookies.txt http://localhost:3001/api/messages
curl -b cookies.txt http://localhost:3001/api/auth/profile
```

### Step 5: Test API Access with JWT

If you have JWT tokens from the OAuth callback:

```bash
# Use Bearer token for API access
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/api/messages
```

## Authentication Flow Examples

### 1. Email/Password Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com", 
    "password": "password123",
    "firstName": "John"
  }'
```

### 2. Email/Password Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. GitHub OAuth Login
```bash
# Browser-based flow
open http://localhost:3001/api/auth/github
```

### 4. Using Protected Endpoints

#### With JWT Token:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/messages
```

#### With Session (after OAuth login):
```bash
curl -b cookies.txt http://localhost:3001/api/messages
```

## API Endpoints Summary

### Authentication Endpoints
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password  
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/status` - Check authentication status
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/logout` - Logout (requires auth)
- `POST /api/auth/refresh` - Refresh JWT token

### Protected Endpoints (Require Authentication)
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `GET /api/users` - Get users
- `PUT /api/users/:id` - Update user (own profile only)
- `DELETE /api/users/:id` - Delete user (own account only)

## Troubleshooting

### GitHub OAuth Not Working
1. Check environment variables are set correctly
2. Verify callback URL in GitHub app settings
3. Ensure GitHub app is not in development mode restriction

### Session Issues
1. Check if cookies are being set/sent
2. Verify session secret is configured
3. Ensure session middleware is properly configured

### JWT Token Issues
1. Check if token is properly formatted (Bearer TOKEN)
2. Verify JWT_SECRET environment variable
3. Check token expiration

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Session-based authentication
- ✅ Rate limiting on auth endpoints
- ✅ Secure headers with Helmet
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Environment-based configuration

## Next Steps

1. Set up your GitHub OAuth app
2. Configure environment variables
3. Test the OAuth flow
4. Integrate with your frontend application
5. Consider adding email verification
6. Implement password reset functionality 