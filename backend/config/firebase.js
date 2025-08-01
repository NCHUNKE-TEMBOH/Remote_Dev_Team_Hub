import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Admin SDK configuration
const firebaseConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: `https://www.googleapis.com/oauth2/v1/certs`,
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  if (!admin.apps.length) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    firebaseApp = admin.app();
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error);
  // In development, we might not have Firebase configured yet
  if (process.env.NODE_ENV !== 'development') {
    throw error;
  }
}

// Firebase Auth instance
export const auth = admin.auth();

// Verify Firebase ID token
export const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('❌ Error verifying Firebase ID token:', error);
    throw new Error('Invalid token');
  }
};

// Get user by UID
export const getUserByUid = async (uid) => {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('❌ Error getting user by UID:', error);
    throw error;
  }
};

// Create custom token
export const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const customToken = await auth.createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    console.error('❌ Error creating custom token:', error);
    throw error;
  }
};

export default firebaseApp;
