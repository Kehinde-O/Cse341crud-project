# Render Deployment Guide

## Required Environment Variables

Set these environment variables in your Render dashboard:

### Essential Variables
```bash
NODE_ENV=production
PORT=10000
SESSION_SECRET=your-super-secret-session-key-here-make-it-long-and-random
MONGODB_URI=your-mongodb-connection-string
```

### GitHub OAuth Configuration
```bash
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/github/callback
```

### Optional Variables
```bash
ALLOWED_ORIGINS=https://your-app-name.onrender.com
```

## Important Notes

### 1. Session Secret
- **CRITICAL**: Set a strong `SESSION_SECRET` in production
- Use a long, random string (at least 32 characters)
- Example: `SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

### 2. GitHub OAuth Setup
- In your GitHub OAuth app settings, set the callback URL to:
  `https://your-app-name.onrender.com/api/auth/github/callback`
- Replace `your-app-name` with your actual Render app name

### 3. MongoDB Session Store
- The app automatically uses MongoDB for session storage in production
- Ensure your `MONGODB_URI` is correctly set
- Sessions will persist across server restarts

### 4. Cookie Settings
- Production uses secure cookies with `sameSite: 'none'`
- This allows cross-origin authentication to work properly

## Troubleshooting Session Issues

### If login shows success but UI shows "not logged in":

1. **Check Environment Variables**
   - Ensure `NODE_ENV=production` is set
   - Verify `SESSION_SECRET` is configured
   - Confirm `MONGODB_URI` is working

2. **Check Logs**
   - Look for session save errors in Render logs
   - Check for MongoDB connection issues
   - Verify OAuth callback debugging output

3. **Test Session Persistence**
   - After login, check the debug info on the home page
   - Verify session ID is present
   - Check if cookies are being set

### Debug Information
The home page now shows debug information including:
- Session ID
- User ID (when logged in)
- Environment
- Cookie presence

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add production session configuration"
   git push origin main
   ```

2. **Configure Render**
   - Set all required environment variables
   - Ensure build command: `npm install`
   - Ensure start command: `npm start`

3. **Test OAuth Flow**
   - Visit your deployed app
   - Click "Login with GitHub"
   - Complete OAuth flow
   - Verify you're logged in on return

## Common Issues and Solutions

### Issue: "Session save error"
**Solution**: Check MongoDB connection and ensure `connect-mongo` is installed

### Issue: Cookies not persisting
**Solution**: Verify `trust proxy` is set and `sameSite` is configured correctly

### Issue: CORS errors during OAuth
**Solution**: Set `ALLOWED_ORIGINS` to your Render app URL

### Issue: GitHub OAuth callback fails
**Solution**: Verify GitHub app callback URL matches your Render app URL exactly 