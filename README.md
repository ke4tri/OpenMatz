# OpenMat

A React Native app for exploring open mat times at BJJ gyms. Built with [Expo SDK 53](https://blog.expo.dev/expo-sdk-53-ccb8302e0f6c), React Native 0.79, and React 19.

---

## 🧰 Prerequisites

> This guide assumes you're setting up on a **new machine** or recovering your dev environment.

### On your **laptop** (Windows/macOS):

- **Node.js**: v20.12.2  
  https://nodejs.org/en/download
- **npm**: v10.5.0  
  Comes with Node.js
- **Expo CLI** (install globally):
  ```bash
  npm install -g expo-cli
  ```

### On your **iPhone**:

- **[Expo Go](https://apps.apple.com/us/app/expo-go/id982107779)** from the App Store
- Must be on **same Wi-Fi network** as your dev machine
- 🔥 **VPN must be disabled on both the iPhone and laptop**, or the phone won’t connect to the Metro bundler server

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

### 3. Start the development server

```bash
npx expo start --clear
```

- A QR code will open in your browser or terminal
- Scan it using **Expo Go** on your phone
- The app should load automatically

---

## 📦 Key Tech Stack

| Package                          | Version    |
|----------------------------------|------------|
| expo                             | 53.0.8     |
| react                            | 19.0.0     |
| react-native                     | 0.79.2     |
| expo-router                      | 5.0.6      |
| react-native-maps                | 1.20.1     |
| react-native-reanimated          | 3.17.5     |
| typescript                       | 5.8.3      |
| jest-expo                        | 53.0.5     |

---

## 💡 Notes

- If Expo CLI asks to install missing dependencies like `exp@57.x`, let it — or cancel and rerun `npm install --legacy-peer-deps`
- If your app fails to load on a device, check:
  - Device and dev machine are on the same Wi-Fi
  - VPN is **off on both** devices
  - You haven’t locked your Metro server in the background
  - Cached builds (use `--clear` when running Expo)

---

## 🧱 Structure (if using nested dirs)

If the repo root is something like `OpenMatzClean/OpenMatz`, be sure to `cd` into the actual app folder before running commands:
```bash
cd OpenMatzClean/OpenMatz
```

---

## 🛠 Future To-Dos

- Re-add any lost features or components from previous dev snapshots
- Add Firebase, backend logic, or authentication
- Improve dev onboarding with a shell script or Docker (optional)

---

## 📌 Version Control Tip

Once stable:
```bash
git add package.json package-lock.json README.md
git commit -m "Add working Expo SDK 53 setup and install instructions"
git push origin main
```
