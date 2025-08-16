import { initializeApp } from "firebase/app";
// ⬇️ use LITE
import { getFirestore } from "firebase/firestore/lite";
// (keep storage import if you actually need storage right now; if not, comment it temporarily)
import { getStorage } from "firebase/storage";
import Constants from "expo-constants";

const app = initializeApp({
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
});

export const db = getFirestore(app);     // ✅ lite = no native module
export const storage = getStorage(app);  // or comment out for now
