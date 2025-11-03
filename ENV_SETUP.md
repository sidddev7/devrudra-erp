# Environment Variables Setup

This document describes the environment variables needed for the application.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Firebase Client Configuration (Public)
These are safe to expose to the client and should be prefixed with `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_API_KEY=your_firebase_api_key
NEXT_PUBLIC_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_APP_ID=your_app_id
NEXT_PUBLIC_MEASUREMENT_ID=your_measurement_id
```

### Firebase Admin Configuration (Private - Server Only)
These are private keys that should NEVER be exposed to the client:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

## How to Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Extract the following values from the JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n` characters)

## Important Notes

- Make sure to keep `FIREBASE_PRIVATE_KEY` in quotes
- Preserve the `\n` characters in the private key
- Never commit `.env.local` to version control
- Add `.env.local` to your `.gitignore` file

## Example `.env.local` File

```env
# Firebase Client (Public)
NEXT_PUBLIC_API_KEY=AIzaSyD...
NEXT_PUBLIC_AUTH_DOMAIN=myproject.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=myproject
NEXT_PUBLIC_STORAGE_BUCKET=myproject.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin (Private)
FIREBASE_PROJECT_ID=myproject
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@myproject.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

