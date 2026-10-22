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
// Cloud Functions removed — requires paid Blaze plan. Watermarking is done client-side.
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCy2e6CWriU_AKUNcNI_uwLQNjBvroi3Is",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "amit-notes-vault.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "amit-notes-vault",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "amit-notes-vault.firebasestorage.app",
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
let storage;


try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

} catch (error) {
  console.warn("Firebase initialization warning (using local fallback mode):", error.message);
}

export {
  app,
  auth,
  db,
  storage,

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
  ref,
  uploadBytes,
  getDownloadURL,

};
