# 🥋 BJJ Gym Finder (React Native)

This mobile app helps users find Brazilian Jiu-Jitsu (BJJ) gyms and open mat times by displaying gym logos on an interactive map.

Built using:
- React Native (with Expo)
- TypeScript
- React Native Maps
- AsyncStorage (for submitting new gyms)

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-org/bjj-gym-finder.git
cd bjj-gym-finder
```

---

### 2. Install dependencies

Make sure you're using **Node.js 18+** and have **npm** or **yarn** installed.

```bash
npm install
# or
yarn
```

---

### 3. Install Expo CLI (if needed)

```bash
npm install -g expo-cli
```

---

### 4. Run the app locally

```bash
npx expo start
```

- Use your Expo Go app to scan the QR code.
- Or press `i` for iOS simulator, `a` for Android emulator.

---

## 📦 Key Dependencies

Your `package.json` should include:

```json
{
  "dependencies": {
    "expo": "^50.x.x",
    "react": "18.x.x",
    "react-native": "0.73.x",
    "react-native-maps": "1.x.x",
    "@react-native-async-storage/async-storage": "^1.x.x",
    "expo-router": "^3.x.x"
  }
}
```

Install native modules via Expo:

```bash
npx expo install react-native-maps @react-native-async-storage/async-storage
```

---

## 📁 Project Structure

```
app/
├── drawer/
│   └── submit.tsx          ← Form to submit gyms
├── tabs/
│   └── map.tsx             ← Map of approved gyms

assets/
├── gyms.json               ← Static approved gyms
└── fallbacks/              ← Default belt images

types/
└── index.d.ts              ← `Gym` type definition
```

---

## ✍️ Submitting Gyms

- Users can submit new gyms via the **Submit** screen.
- Submissions are saved locally in `AsyncStorage`.
- Only gyms manually added to `gyms.json` and marked `"approved": true` will appear on the map.

---

## 🤝 Contributing

1. Fork and clone this repo.
2. Create a branch:  
   ```bash
   git checkout -b my-feature
   ```
3. Make your changes and test.
4. Commit and push:  
   ```bash
   git commit -m "feat: add my feature"
   git push origin my-feature
   ```
5. Open a Pull Request.

---

## 🧪 Testing (Optional Setup)

```bash
npm install --save-dev jest @testing-library/react-native
```

Add tests in `__tests__/` and run:

```bash
npm test
```

---

## 🧯 Troubleshooting

**White screen in Expo Go?**
- Check for logo URLs with leading spaces
- Ensure no invalid image formats

**Map not showing?**
- Make sure location permissions are granted
- Ensure `react-native-maps` is properly installed via Expo

**Gym not appearing after submission?**
- Only gyms with `"approved": true` in `gyms.json` are shown

---

## 💡 Future Improvements

- Firebase or backend sync
- Admin moderation dashboard
- Auth for gym owners
- Proximity filtering
- Map themes

---

## 📬 Contact

Maintained by Wayne and contributors.  
For questions or ideas, open an issue or pull request.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
