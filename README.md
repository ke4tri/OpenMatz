# OpenMats

A React Native app (Expo SDK 53, RN 0.79, React 19) for exploring open mat times at BJJ gyms.

---

## 🧰 Prerequisites

> Use **Node 20.12.2** and **npm 10.5.0** to match the project.

- **Node.js**: https://nodejs.org/en/download  
- **npx expo** (no global `expo-cli` needed)  
- **EAS CLI** for builds/updates (optional but recommended):  
  ```bash
  npm i -g eas-cli
  ```

### On your iPhone

- Install **[Expo Go](https://apps.apple.com/us/app/expo-go/id982107779)**.
- Phone and laptop must be on the **same Wi-Fi**.
- 🔥 Disable **VPN** on both devices during local dev.

---

## 🚀 Getting Started

### 1) Clone

```bash
git clone https://github.com/your-username/OpenMats.git
cd OpenMats
```

### 2) Install deps

```bash
npm install --legacy-peer-deps
```

> Expo 53 + React 19 sometimes needs `--legacy-peer-deps`.

### 3) Environment

Create `.env` in project root:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=1234567890
FIREBASE_APP_ID=1:1234567890:web:abc123
```

### 4) App config (env-aware)

`app.config.ts`:

```ts
import "dotenv/config";
import { ExpoConfig } from "expo/config";

const APP_ENV = process.env.APP_ENV ?? "development"; // development | staging | production

export default ({ config }: { config: ExpoConfig }) => ({
  ...config,
  name: "OpenMats",
  slug: "openmats",
  version: "1.0.0",
  runtimeVersion: { policy: "appVersion" },
  extra: {
    APP_ENV,
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    apiBaseUrl:
      APP_ENV === "production"
        ? "https://api.prod.example"
        : APP_ENV === "staging"
        ? "https://api.staging.example"
        : "http://localhost:3000",
  },
});
```

### 5) Run

```bash
npx expo start --clear
```

Scan the QR in **Expo Go**.

---

## 📦 Tech Stack

| Package                 | Version |
|-------------------------|---------|
| expo                    | 53.x    |
| react                   | 19.x    |
| react-native            | 0.79.x  |
| expo-router             | 5.x     |
| react-native-maps       | 1.20.x  |
| react-native-reanimated | 3.17.x  |
| typescript              | 5.8.x   |
| jest-expo               | 53.x    |

---

## ⚡ Firestore Lite (reads) + Lazy Full Firestore (writes)

**Goal:** keep consumer map fast/tiny using **Firestore Lite**; only load the full SDK on premium submit/update screens.

### `firebase/client.ts` (init once)

```ts
// firebase/client.ts
import { initializeApp, getApps } from "firebase/app";
import Constants from "expo-constants";

const firebaseConfig = Constants.expoConfig?.extra?.firebase;

export const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
```

### Read APIs use **Lite**

```ts
// data/gyms.read.ts (read-only, ship everywhere)
import { app } from "../firebase/client";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore/lite";

// NOTE: Lite import path is 'firebase/firestore/lite'
const db = getFirestore(app);

export async function getApprovedGyms() {
  const q = query(collection(db, "gyms"), where("approved", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
```

### Write APIs **lazy-load** full Firestore when needed

```ts
// data/gyms.write.ts (premium-only routes/screens)
import { app } from "../firebase/client";

async function getDbFull() {
  const mod = await import("firebase/firestore"); // full SDK
  return mod.getFirestore(app);
}

export async function submitGym(gym: any) {
  const { doc, setDoc, collection } = await import("firebase/firestore");
  const db = await getDbFull();
  const ref = doc(collection(db, "pendingGyms")); // or "gyms" if writing direct
  await setDoc(ref, gym);
  return ref.id;
}

export async function updateGym(id: string, patch: any) {
  const { doc, updateDoc } = await import("firebase/firestore");
  const db = await getDbFull();
  await updateDoc(doc(db, "gyms", id), patch);
}
```

> This keeps your default bundle small (Lite) and only pulls the heavier full SDK for premium/submit/update paths.

### Firestore Security Rules (concept)

Public reads to **approved** gyms; gate mutations:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    // Publicly readable approved gyms
    match /gyms/{gymId} {
      allow read: if resource.data.approved == true;
      allow write: if false; // edits only via verified flows
    }

    // Submissions (written by premium users)
    match /pendingGyms/{docId} {
      allow create: if request.auth != null && request.auth.token.premium == true;
      allow read, update, delete: if false;
    }
  }
}
```

Adjust for your exact auth/premium model.

---

## 🔥 Seeding Data (one-time upload)

Place JSON at `assets/gyms.json`, then use this Node script:

```js
// scripts/uploadGyms.cjs
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore"); // full SDK is fine in Node
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

(async () => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  for (const gym of gyms) {
    const id = gym.id || (global.crypto?.randomUUID?.() ?? String(Date.now() + Math.random()));
    try {
      await setDoc(doc(db, "gyms", id), { ...gym, id });
      console.log(`✅ ${gym.name} (${id})`);
    } catch (e) {
      console.error(`❌ ${gym.name} (${id})`, e);
    }
  }
})();
```

Run:
```bash
node scripts/uploadGyms.cjs
```

---

## 🧭 Branching & Releases (two-lane: `dev` and `main`)

**dev** = staging/integration  
**main** = production

```
                 feature/feat-a ──●─────── PR ─┐
                 feature/feat-b ──●─────── PR ─┼─▶
                 feature/feat-c ──●─────── PR ─┘
dev (staging)  ───────────●────●────●────●──────────────▶
                           ╲            (promote)
                            ╲ merge dev → main (tag)
main (production) ───────────●────────────●─────────────▶
                             ▲            ▲
                         hotfix/x.y.z   v1.1.0
                         (from main)    (tag)
```

### One-time setup

```bash
git checkout main && git pull --ff-only
git checkout -b dev
git push -u origin dev
# Protect both branches in repo settings (require PRs, no force-push)
git config --global pull.ff only
```

### Daily flow

```bash
# new work
git switch dev && git pull
git switch -c feat/my-feature
# ...code...
git commit -m "feat: my feature"
git push -u origin feat/my-feature
# open PR → dev

# promote to production
git switch main && git pull --ff-only
git merge --no-ff dev   # or squash via PR UI
git tag v1.0.0
git push && git push --tags
```

### Hotfix

```bash
git switch -c hotfix/1.0.1 main
# fix…
git commit -m "fix: crash on start"
git push -u origin hotfix/1.0.1
# PR → main, tag v1.0.1
# then bring it back:
git switch dev && git pull
git merge --ff-only main
```

---

## 🏗️ EAS Profiles & Channels

`eas.json`:

```json
{
  "cli": { "version": ">= 13.7.0" },
  "build": {
    "development": {
      "channel": "development",
      "developmentClient": true,
      "env": { "APP_ENV": "development" }
    },
    "preview": {
      "channel": "preview",
      "env": { "APP_ENV": "staging" }
    },
    "production": {
      "channel": "production",
      "env": { "APP_ENV": "production" }
    }
  },
  "submit": { "production": {} }
}
```

**Mapping**

- Push/merge to **`dev`** → use **preview** profile/channel for internal testing:
  ```bash
  eas build --profile preview --platform ios
  eas build --profile preview --platform android
  eas update --channel preview --auto
  ```

- Promote **`dev → main`** and tag release → use **production** profile/channel:
  ```bash
  eas build --profile production --platform ios
  eas build --profile production --platform android
  eas update --channel production --auto
  ```

---

## 🧠 Developer Notes

- If device won’t connect: confirm same Wi-Fi, VPN off, and re-run `npx expo start --clear`.
- Prefer **squash merges** for feature PRs into `dev` to keep history tidy.
- For Storage logo uploads, keep limits small (type/size) and validate on the server or via Security Rules.
- Premium-only submissions/updates can be gated via your `usePremiumStatus` hook.

---

## 🛠 Post-Setup TODOs

- ✅ Show gyms from Firestore Lite (`approved: true`) on the map.
- ✅ Gate **submit/update** behind premium; lazy-load full Firestore only there.
- 🟡 Add CI (GitHub Actions) to build on `dev` (preview) and on `main` tags (production).
- 🛠 Admin UI for reviewing/approving pending gyms.
- 💾 Optional offline cache for gym data.

---

## 📌 Version Control Quick Commit

```bash
git add .
git commit -m "docs: update README for Firestore Lite + dev/main flow"
git push origin dev
```
