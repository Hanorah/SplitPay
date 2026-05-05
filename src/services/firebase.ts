import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

const app = initializeApp({
  apiKey: firebaseConfig.apiKey || "missing",
  authDomain: firebaseConfig.authDomain || "missing.firebaseapp.com",
  projectId: firebaseConfig.projectId || "missing",
  storageBucket: firebaseConfig.storageBucket || "missing.appspot.com",
  messagingSenderId: firebaseConfig.messagingSenderId || "missing",
  appId: firebaseConfig.appId || "missing",
});

export const auth = getAuth(app);
export const db = getFirestore(app);
