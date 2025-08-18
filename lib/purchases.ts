// lib/purchases.ts
import Purchases from "react-native-purchases";
import { Platform } from "react-native";

let initialized = false;
export function initPurchases() {
  if (initialized) return;

  // 👉 enable verbose logs
  Purchases.setDebugLogsEnabled(true);

  const ios = process.env.EXPO_PUBLIC_RC_IOS_KEY;
  const android = process.env.EXPO_PUBLIC_RC_ANDROID_KEY;
  const apiKey = Platform.select({ ios, android })!;
  Purchases.configure({ apiKey });

  initialized = true;
}
