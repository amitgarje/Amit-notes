// =========================================================
// AMIT'S NOTES VAULT - FIREBASE CLIENT CONFIGURATION
// =========================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
// Firebase Storage and Cloud Functions completely terminated to ensure 100% Free forever (Google Drive used for PDF storage)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCy2e6CWriU_AKUNcNI_uwLQNjBvroi3Is",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "amit-notes-vault.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "amit-notes-vault",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "785092501568",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:785092501568:web:b967df911989c5443cbfa5",
};

// Check if current config is the demo/dummy placeholder
export const isDemoConfig =
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY.includes("DemoDummy");

// Initialize Firebase App singleton
let app;
let auth;
let db;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization warning (using local fallback mode):", error.message);
}

export {
  app,
  auth,
  db,

  signInAnonymously,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  deleteDoc,
};
