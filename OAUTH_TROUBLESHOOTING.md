# OAuth Authentication Troubleshooting Guide

## Common OAuth Errors and Solutions

### Error 1: "Failed to obtain access token"

This error typically indicates a GitHub OAuth configuration issue.

**Possible Causes:**
1. Incorrect GitHub Client ID or Client Secret
2. Wrong Callback URL in GitHub OAuth App settings
3. Missing or incorrect environment variables

**Solutions:**

#### 1. Verify GitHub OAuth App Configuration

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App
3. Check these settings:
   - **Client ID**: Copy this to your environment variables
   - **Client Secret**: Generate a new one if needed
   - **Authorization callback URL**: Must match your deployed URL

#### 2. Set Correct Environment Variables

For **local development**:
```bash
# In your .env file
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

For **production** (Render.com example):
```bash
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/github/callback
```

#### 3. Verify Callback URL Format

The callback URL in your GitHub OAuth App must EXACTLY match:
- Local: `http://localhost:3001/api/auth/github/callback`
- Production: `https://your-deployed-domain.com/api/auth/github/callback`

### Error 2: "secretOrPrivateKey must have a value"

This error occurs when JWT secrets are not configured.

**Solution:**

Add these environment variables:

```bash
# Required for JWT token generation
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-different-from-jwt-secret

# Optional: Token expiration times
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
```

**Note**: OAuth users can still use session-based authentication even without JWT secrets. JWT tokens are optional for API access.

## Environment Variable Checklist

### Required for GitHub OAuth:
- ✅ `GITHUB_CLIENT_ID`
- ✅ `GITHUB_CLIENT_SECRET`
- ✅ `GITHUB_CALLBACK_URL`

### Required for JWT tokens (optional for OAuth users):
- ✅ `JWT_SECRET`
- ✅ `JWT_REFRESH_SECRET`

### Other important variables:
- ✅ `SESSION_SECRET` (for session management)
- ✅ `MONGODB_URI` (for database connection)
- ✅ `NODE_ENV` (production/development)

## Testing OAuth Authentication

### 1. Test OAuth Initiation

```bash
# This should redirect to GitHub
curl -v http://localhost:3001/api/auth/github
```

### 2. Check Server Logs

Look for these log messages:
- 🔧 Configuring GitHub OAuth with callback URL: [your-callback-url]
- 🚀 Initiating GitHub OAuth...
- ✅ OAuth login successful for user: [username]

### 3. Test with Browser

1. Navigate to: `http://localhost:3001/api/auth/github`
2. Complete GitHub OAuth flow
3. Should return JSON with user data and authentication status

## Common Deployment Issues

### Render.com Specific

1. **Environment Variables**: Set in Render dashboard, not in code
2. **HTTPS Required**: Production callback URL must use HTTPS
3. **Domain**: Use your actual Render domain in callback URL

### Vercel Specific

1. **Environment Variables**: Set in Vercel dashboard
2. **Serverless**: Make sure OAuth routes are properly configured for serverless

## Debugging Steps

1. **Check Environment Variables**:
   ```javascript
   console.log('GitHub Client ID:', process.env.GITHUB_CLIENT_ID ? 'Set' : 'Missing');
   console.log('GitHub Secret:', process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Missing');
   console.log('Callback URL:', process.env.GITHUB_CALLBACK_URL);
   ```

2. **Verify GitHub App Settings**:
   - Client ID matches environment variable
   - Callback URL exactly matches your endpoint
   - App is active and not suspended

3. **Test Session-Based Authentication**:
   OAuth users don't need JWT tokens - they can use sessions instead

4. **Check Network Logs**:
   Use browser developer tools to see the exact error responses

## Alternative Authentication Methods

If GitHub OAuth continues to fail, users can still:

1. **Register with email/password**:
   ```bash
   POST /api/auth/register
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "securepassword123",
     "firstName": "Test",
     "lastName": "User"
   }
   ```

2. **Login with email/password**:
   ```bash
   POST /api/auth/login
   {
     "email": "test@example.com",
     "password": "securepassword123"
   }
   ```

## Support Commands

### Check Authentication Status
```bash
curl http://localhost:3001/api/auth/status
```

### Test Protected Route
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/api/messages
```

## Need Help?

If these solutions don't resolve your issue:

1. Check the server logs for detailed error messages
2. Verify all environment variables are correctly set
3. Test with a fresh GitHub OAuth app
4. Try the email/password authentication method as an alternative

The application supports multiple authentication methods, so GitHub OAuth is not required for basic functionality. 