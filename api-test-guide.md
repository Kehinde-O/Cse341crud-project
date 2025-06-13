# CRUD Project API Testing Guide (GitHub OAuth Only)

## Overview
This CRUD project now uses **GitHub OAuth ONLY** for authentication. All email/password registration and login have been removed.

## Authentication System
- **Read Operations**: Public access (no authentication required)
- **Write Operations**: Require GitHub OAuth authentication
- **Session-based**: Users stay logged in via browser sessions

## How to Test

### 1. Check Authentication Status
**Root Endpoint**: `http://localhost:3000/`
- Shows login status in browser
- Displays "Logged in as [username]" or "You are not logged in"
- Provides navigation links

### 2. GitHub OAuth Login
**Browser Login**: Navigate to `http://localhost:3000/api/auth/github`
- Redirects to GitHub for authentication
- After successful login, redirects back to home page
- Session is automatically established

### 3. API Endpoints

#### Public Read Operations (No Auth Required)
```bash
# Get all users
curl http://localhost:3000/api/users

# Get specific user
curl http://localhost:3000/api/users/USER_ID

# Get all messages
curl http://localhost:3000/api/messages

# Get specific message
curl http://localhost:3000/api/messages/MESSAGE_ID

# Get messages between users
curl http://localhost:3000/api/messages/between/USER1_ID/USER2_ID
```

#### Protected Write Operations (Require Auth)
```bash
# Create message (requires authentication)
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"recipient":"USER_ID","content":"Hello!"}'

# Update message (requires authentication)
curl -X PUT http://localhost:3000/api/messages/MESSAGE_ID \
  -H "Content-Type: application/json" \
  -d '{"content":"Updated content"}'

# Delete message (requires authentication)
curl -X DELETE http://localhost:3000/api/messages/MESSAGE_ID

# Update user profile (requires authentication)
curl -X PUT http://localhost:3000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Updated Name"}'

# Delete user (requires authentication)
curl -X DELETE http://localhost:3000/api/users/USER_ID
```

### 4. Authentication Endpoints
```bash
# Check authentication status
curl http://localhost:3000/api/auth/status

# Get user profile (if authenticated)
curl http://localhost:3000/api/auth/profile

# Logout (browser)
Navigate to: http://localhost:3000/api/auth/logout
```

## Expected Behavior

### When Not Logged In:
- ✅ Can view all users and messages (read operations)
- ❌ Cannot create, update, or delete content (write operations)
- Root page shows "You are not logged in"

### When Logged In via GitHub:
- ✅ Can view all content (read operations)
- ✅ Can create, update, delete content (write operations)
- ✅ Session persists across browser requests
- Root page shows "Logged in as [GitHub username]"

## Testing Sequence

1. **Start Fresh**: Visit `http://localhost:3000/` (should show "not logged in")
2. **Test Read Access**: Try `curl http://localhost:3000/api/users` (should work)
3. **Test Write Access**: Try creating a message without auth (should fail)
4. **Login**: Click "Login with GitHub" or visit `/api/auth/github`
5. **Verify Login**: Visit root page (should show "logged in as...")
6. **Test Write Access**: Try creating a message (should work)
7. **Logout**: Visit `/api/auth/logout`
8. **Verify Logout**: Visit root page (should show "not logged in")

## Key Features Implemented

✅ GitHub OAuth authentication only  
✅ Session-based authentication for browsers  
✅ Public read access without authentication  
✅ Protected write operations  
✅ Clean, simple user interface  
✅ Comprehensive API documentation at `/api-docs`  
✅ No email/password registration  
✅ Automatic session management 