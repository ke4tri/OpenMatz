import "dotenv/config";

export default {
  expo: {
    name: "OpenMats",
    slug: "openmats",
    scheme: "openmats",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.ke4tri.openmats",
      buildNumber: "13",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription: "This app uses your location to show nearby BJJ gyms.",
        NSCameraUsageDescription: "This app uses your camera to allow photo uploads for gyms.",
        NSPhotoLibraryUsageDescription: "This app needs access to your photo library to select gym logos.",
        NSPhotoLibraryAddUsageDescription: "This app may save logos or images to your photo library."
      }
    },
    android: {
      package: "com.ke4tri.openmats"
    },
    extra: {
      opencageApiKey: process.env.OPENCAGE_API_KEY,
      REVENUECAT_PUBLIC_KEY: process.env.REVENUECAT_PUBLIC_KEY,
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      eas: {
        projectId: "d3c311b2-1e00-4c9c-9e25-bf98c379e1b1"
      },
    revenuecat: {
      iosKey: process.env.EXPO_PUBLIC_RC_IOS_KEY,
      androidKey: process.env.EXPO_PUBLIC_RC_ANDROID_KEY,
      entitlementStandard: process.env.EXPO_PUBLIC_RC_ENTITLEMENT_STANDARD || "standard_access",
      entitlementPremium: process.env.EXPO_PUBLIC_RC_ENTITLEMENT_PREMIUM || "premium_access",
      offeringDefault: process.env.EXPO_PUBLIC_RC_OFFERING_DEFAULT || "default",           // onboarding: show Standard + Premium
      offeringUpgrade: process.env.EXPO_PUBLIC_RC_OFFERING_UPGRADE || "premium_upgrade",   // upgrade screen: Premium only
    }

    }
  }
};
