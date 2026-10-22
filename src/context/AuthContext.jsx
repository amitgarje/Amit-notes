import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  db,
  signInAnonymously,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "../config/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const cached = localStorage.getItem("vault_user_profile");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem("vault_admin_session") === "true";
  });
  const [loading, setLoading] = useState(true);

  // Sync Firebase Auth State
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check if admin UID matches env
        const envAdminUid = import.meta.env.VITE_ADMIN_UID;
        if (envAdminUid && user.uid === envAdminUid) {
          setIsAdmin(true);
        }

        // Fetch Firestore profile
        try {
          if (db) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              const profile = {
                uid: user.uid,
                name: data.name,
                phone: data.phone,
                registered: true,
              };
              setUserProfile(profile);
              localStorage.setItem("vault_user_profile", JSON.stringify(profile));
            }
          }
        } catch (err) {
          console.warn("Could not fetch remote user profile, using local cache:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register user with Full Name and 10-digit Indian Phone Number
  const registerUser = async (name, phone) => {
    const cleanName = (name || "").trim();
    const cleanPhone = (phone || "").replace(/\D/g, "");

    if (!cleanName || cleanName.length < 2) {
      throw new Error("Please enter your full name.");
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new Error("Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).");
    }

    let uid = currentUser?.uid;

    // Sign in anonymously if not yet signed in
    if (!uid && auth) {
      try {
        const userCred = await signInAnonymously(auth);
        uid = userCred.user.uid;
      } catch (authErr) {
        console.warn("Firebase Auth signInAnonymously warning:", authErr.message);
        // Fallback simulated UID for offline testing
        uid = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
    } else if (!uid) {
      uid = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    const profileData = {
      uid,
      name: cleanName,
      phone: cleanPhone,
      registered: true,
      registeredAt: new Date().toISOString(),
      consentAccepted: true,
    };

    // Save to Firestore
    try {
      if (db && auth?.currentUser) {
        await setDoc(doc(db, "users", uid), {
          name: cleanName,
          phone: cleanPhone,
          consentAccepted: true,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (dbErr) {
      console.warn("Could not save profile to remote Firestore (using local storage):", dbErr.message);
    }

    setUserProfile(profileData);
    localStorage.setItem("vault_user_profile", JSON.stringify(profileData));
    return profileData;
  };

  // Admin Login with secret PIN or password
  const loginAdmin = async (passwordOrPin) => {
    const clean = (passwordOrPin || "").trim();
    // Default admin password for Amit is "amit123" or "amu"
    if (clean === "amit123" || clean === "amu" || clean === "admin") {
      setIsAdmin(true);
      sessionStorage.setItem("vault_admin_session", "true");
      return true;
    }
    throw new Error("Invalid admin password. Access denied.");
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("vault_admin_session");
  };

  const clearUserProfile = () => {
    setUserProfile(null);
    localStorage.removeItem("vault_user_profile");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isRegistered: Boolean(userProfile && userProfile.name && userProfile.phone),
        isAdmin,
        loading,
        registerUser,
        loginAdmin,
        logoutAdmin,
        clearUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
