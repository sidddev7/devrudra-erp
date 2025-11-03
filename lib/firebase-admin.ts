import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app: App;

export function getFirebaseAdmin() {
  if (getApps().length === 0) {
    // Initialize Firebase Admin with service account
    // For development, you can use the emulator or service account key
    try {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
      // Fallback to default initialization without credentials
      // This will work if running on Google Cloud or with Application Default Credentials
      app = initializeApp();
    }
  } else {
    app = getApps()[0];
  }

  return app;
}

export function getAdminAuth() {
  const app = getFirebaseAdmin();
  return getAuth(app);
}

