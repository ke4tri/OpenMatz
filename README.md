# OpenMat

A React Native app for exploring open mat times at BJJ gyms. Built with [Expo SDK 53](https://blog.expo.dev/expo-sdk-53-ccb8302e0f6c), React Native 0.79, and React 19.

---

## 🧰 Prerequisites

> This guide assumes you're setting up on a **new machine** or recovering your dev environment.

### On your **laptop** (Windows/macOS):

* **Node.js**: v20.12.2
  [https://nodejs.org/en/download](https://nodejs.org/en/download)
* **npm**: v10.5.0
  Comes with Node.js
* **Expo CLI** (install globally):

  ```bash
  npm install -g expo-cli
  ```

### On your **iPhone**:

* **[Expo Go](https://apps.apple.com/us/app/expo-go/id982107779)** from the App Store
* Must be on **same Wi-Fi network** as your dev machine
* 🔥 **VPN must be disabled on both the iPhone and laptop**, or the phone won’t connect to the Metro bundler server

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/OpenMatz.git
cd OpenMatz
```

> Make sure you're in the correct subdirectory (e.g. `OpenMatzClean/OpenMatz` if that's how the repo is structured)

### 2. Install dependencies (resolving peer deps)

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is important due to Expo SDK 53’s use of React 19.

### 3. Create `.env` file at the root:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=1234567890
FIREBASE_APP_ID=1:1234567890:web:abc123
```

### 4. Update `app.config.ts` to use env variables:

```ts
import 'dotenv/config';

export default {
  expo: {
    name: "OpenMats",
    slug: "openmats",
    version: "1.0.0",
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
};
```

### 5. Start the development server

```bash
npx expo start --clear
```

* A QR code will open in your browser or terminal
* Scan it using **Expo Go** on your phone
* The app should load automatically

---

## 📦 Key Tech Stack

| Package                 | Version |
| ----------------------- | ------- |
| expo                    | 53.0.8  |
| react                   | 19.0.0  |
| react-native            | 0.79.2  |
| expo-router             | 5.0.6   |
| react-native-maps       | 1.20.1  |
| react-native-reanimated | 3.17.5  |
| typescript              | 5.8.3   |
| jest-expo               | 53.0.5  |

---

## 🔥 Uploading Gym Data to Firestore

### One-time Upload with `.cjs` Script

1. Place your updated gyms JSON file at:

```
/assets/gyms.json
```

2. Use this script:

```js
// scripts/uploadGyms.cjs
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");
const gyms = require("../assets/gyms.json");
require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  for (const gym of gyms) {
    try {
      await setDoc(doc(db, "gyms", gym.id), gym);
      console.log(`✅ Uploaded: ${gym.name} (${gym.id})`);
    } catch (err) {
      console.error(`❌ Failed to upload: ${gym.name} (${gym.id})`, err);
    }
  }
})();
```

3. Run the script:

```bash
node scripts/uploadGyms.cjs
```

✅ This uploads all gyms to the `gyms` Firestore collection using `id` as the document ID.

---

## 🧠 Developer Notes

* If Expo CLI asks to install missing dependencies like `exp@57.x`, let it — or cancel and rerun `npm install --legacy-peer-deps`
* If your app fails to load on a device, check:

  * Device and dev machine are on the same Wi-Fi
  * VPN is **off on both** devices
  * You haven’t locked your Metro server in the background
  * Cached builds (use `--clear` when running Expo)

---

## 🧱 Structure (if using nested dirs)

If the repo root is something like `OpenMatzClean/OpenMatz`, be sure to `cd` into the actual app folder before running commands:

```bash
cd OpenMatzClean/OpenMatz
```

---

## 🛠 Post-Setup TODOs

* ✅ Replace local `gyms.json` usage with Firestore query
* ✅ Filter gyms by `approved: true`
* 🟡 Optionally use `onSnapshot()` for live updates
* 🛠 Build admin tools for reviewing and approving pending gyms
* 💾 Optionally cache Firestore data locally (for offline UX)

---

## 📌 Version Control Tip

Once stable:

```bash
git add package.json package-lock.json README.md .env
git commit -m "Add working Expo SDK 53 setup, Firebase config, and Firestore upload support"
git push origin main
```

---

This guide ensures the app can be reinstalled, configured, and seeded from scratch. Let us know if any part needs clarification!
