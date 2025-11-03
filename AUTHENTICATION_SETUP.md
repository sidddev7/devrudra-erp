# Authentication Setup with Next.js Middleware

This document explains the authentication system implemented using Next.js middleware and Firebase Admin SDK.

## Overview

The application now uses **server-side authentication** with Next.js middleware to verify user sessions via HTTP-only cookies. This is more secure than client-side only authentication and prevents infinite redirect loops.

## Architecture

### Components

1. **Firebase Admin SDK** (`lib/firebase-admin.ts`)
   - Server-side Firebase initialization
   - Used to verify ID tokens and create session cookies

2. **Middleware** (`middleware.ts`)
   - Runs on every request in Edge Runtime (lightweight and fast)
   - Checks for presence of session cookie
   - Handles redirects based on authentication state
   - Protects routes that require authentication
   - Note: Cookie verification happens in API routes/server components, not in middleware

3. **Session API** (`app/api/auth/session/route.ts`)
   - POST: Creates session cookie from Firebase ID token
   - DELETE: Clears session cookie on logout

4. **Client-side Auth** (Firebase Client SDK)
   - Firebase client SDK handles authentication state automatically
   - Used for login, logout, and Firestore operations
   - No custom provider wrapper needed

## How It Works

### Login Flow

1. User submits login credentials
2. Firebase client authenticates with email/password
3. Client gets ID token from Firebase
4. Client sends ID token to `/api/auth/session` (POST)
5. Server verifies ID token with Firebase Admin
6. Server creates session cookie (expires in 5 days)
7. Server sets HTTP-only cookie
8. Client redirects to dashboard
9. Middleware verifies cookie on subsequent requests

### Logout Flow

1. User clicks logout
2. Client calls `/api/auth/session` (DELETE)
3. Server clears session cookie
4. Client signs out from Firebase
5. Client redirects to login
6. Middleware redirects unauthenticated users to login

### Protected Routes

The middleware automatically protects these routes:
- `/dashboard` - Dashboard home with statistics
- `/agents` - Agent management
- `/policies` - Policy management
- `/users` - User management
- `/vehicle-classes` - Vehicle class management
- `/insurance-providers` - Insurance provider management
- `/expiring-policies` - Expiring policies view

### Public Routes (Auth Routes)

These routes redirect to dashboard if user is already authenticated:
- `/login` - Login page
- `/forgot-password` - Password reset page

### Redirect Logic

| Current Route | Authenticated | Action |
|--------------|---------------|--------|
| `/` | Yes | Redirect to `/dashboard` |
| `/` | No | Redirect to `/login` |
| Protected routes | No | Redirect to `/login` |
| Auth routes | Yes | Redirect to `/dashboard` |

## Security Features

1. **HTTP-only Cookies**: Session tokens cannot be accessed by JavaScript, preventing XSS attacks
2. **Server-side Verification**: All authentication checks happen on the server
3. **Secure Cookies**: Cookies are marked as secure in production (HTTPS only)
4. **SameSite Policy**: Cookies use `lax` SameSite policy for CSRF protection
5. **Token Expiration**: Session cookies expire after 5 days
6. **Automatic Token Refresh**: Client-side token refresh for API calls

## Files Modified

### New Files
- `lib/firebase-admin.ts` - Firebase Admin SDK configuration
- `middleware.ts` - Next.js middleware for authentication
- `app/api/auth/session/route.ts` - Session management API
- `app/dashboard/page.tsx` - Dashboard home page
- `ENV_SETUP.md` - Environment variables documentation

### Modified Files
- `app/(auth)/login/page.tsx` - Updated to create session cookie on login, removed FirebaseAuthProvider wrapper
- `app/(auth)/forgot-password/page.tsx` - Removed FirebaseAuthProvider wrapper
- `app/(dashboard)/layout.tsx` - Updated to clear session cookie on logout, removed FirebaseAuthProvider wrapper
- `app/page.tsx` - Simplified (middleware handles redirect)
- `package.json` - Added `firebase-admin` dependency

### Deleted Files
- `app/(dashboard)/page.tsx` - Moved to `app/dashboard/page.tsx`
- `client/components/FirebaseAuthProvider.tsx` - Completely removed (no longer needed)

## Environment Variables Required

See `ENV_SETUP.md` for detailed instructions on setting up environment variables.

**Required:**
- `NEXT_PUBLIC_API_KEY` - Firebase client API key
- `NEXT_PUBLIC_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_MEASUREMENT_ID` - Firebase measurement ID
- `FIREBASE_PROJECT_ID` - Firebase project ID (for admin)
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key

## Benefits Over Previous Implementation

### Before (Client-side Only)
- ❌ Infinite redirect loops between `/` and `/login`
- ❌ Authentication state checked only on client
- ❌ Redirect logic scattered across components
- ❌ Race conditions between Firebase auth state and redirects
- ❌ Session tokens stored in localStorage (accessible to JavaScript)
- ❌ Complex FirebaseAuthProvider wrapper needed on every page

### After (Middleware + Server-side)
- ✅ No redirect loops - middleware handles all redirects
- ✅ Authentication verified on server for every request
- ✅ Centralized redirect logic in middleware
- ✅ Single source of truth for authentication state
- ✅ Secure HTTP-only cookies for session management
- ✅ Automatic protection for all routes
- ✅ Better security posture
- ✅ No custom provider wrappers needed - cleaner code
- ✅ Firebase client SDK handles its own auth state

## Testing

To test the authentication flow:

1. Start the development server: `bun run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to `/login`
4. Log in with valid credentials
5. You should be redirected to `/dashboard`
6. Try accessing `/login` - should redirect back to `/dashboard`
7. Click logout - should redirect to `/login`
8. Try accessing `/dashboard` - should redirect to `/login`

## Troubleshooting

### "Cannot find module 'firebase-admin'"
- Run `bun install` to install dependencies

### "Failed to create session"
- Check that Firebase Admin environment variables are set correctly
- Verify that the Firebase service account has proper permissions

### Still seeing redirect loops
- Clear browser cookies and local storage
- Check browser console for errors
- Verify middleware is running (check terminal output)

### Middleware not running
- Ensure `middleware.ts` is in the root directory
- Check that the `matcher` config doesn't exclude your route
- Restart the development server

## Additional Resources

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

