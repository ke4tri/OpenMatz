// import { initializeApp } from "firebase/app";
// import { getAuth, signInAnonymously } from "firebase/auth";

// import Constants from "expo-constants";

// const firebaseConfig = {
//   apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
//   authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
//   projectId: Constants.expoConfig?.extra?.firebaseProjectId,
//   storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
//   messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
//   appId: Constants.expoConfig?.extra?.firebaseAppId,
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app); // ✅ Do NOT use initializeAuth()

// export { auth, signInAnonymously };
import { initializeApp } from "firebase/app";
//import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
};

const app = initializeApp(firebaseConfig);

//const auth = getAuth(app);
const db = getFirestore(app);

//export { auth, db };
export { db };
