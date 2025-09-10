// app/index.tsx
import { useEffect } from "react";
import { View, Image, StyleSheet, Text, Pressable, Linking, Dimensions } from "react-native";
import { Stack, useRouter } from "expo-router";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const MAP_PATH = "/(tabs)/map";       // ← change to "/map" if that's your route
const SUBSCRIBE_PATH = "screens/subscribe";
const MIN_SPLASH_MS = 3000;
const screenWidth = Dimensions.get("window").width;

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function checkAccess(): Promise<boolean> {
      try {
        // Keep RC quiet & consistent during startup
        Purchases.setLogLevel(LOG_LEVEL.WARN);

        // Avoid stale cache while testing
        await Purchases.invalidateCustomerInfoCache();

        const info = await Purchases.getCustomerInfo();
        const active = info.entitlements?.active ?? {};
        const hasStd = !!active["standard"];
        const hasPremium = !!active["premium"];
        const hasAccess = hasStd || hasPremium;

        console.log("[SplashGate] active:", Object.keys(active));
        console.log("[SplashGate] hasStd:", hasStd, "hasPremium:", hasPremium, "hasAccess:", hasAccess);

        return hasAccess;
      } catch (e) {
        console.log("[SplashGate] RC error → treating as no access:", e);
        return false;
      }
    }

    (async () => {
      const [hasAccess] = await Promise.all([checkAccess(), sleep(MIN_SPLASH_MS)]);
      if (!cancelled) router.replace(hasAccess ? MAP_PATH : SUBSCRIBE_PATH);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Hide the default header for this route */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.logoRow}>
        <Image
          source={require("../assets/appLogo/MATTIME_ForWBackG.png")}
          style={styles.textLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.branding}>
        <Text style={styles.byText}>By Port13ET</Text>
        <Pressable onPress={() => Linking.openURL("https://www.Port13ET.com")}>
          <Text style={styles.url}>www.Port13ET.com</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  logoRow: { flexDirection: "row", alignItems: "center" },
  textLogo: {
    width: screenWidth * 0.8,
    aspectRatio: 1,
    resizeMode: "contain",
    marginHorizontal: 8,
  },
  branding: { marginTop: 30, alignItems: "center" },
  byText: { color: "#ccc", fontSize: 16, fontWeight: "600" },
  url: { color: "#00BFFF", fontSize: 14, textDecorationLine: "underline", marginTop: 4 },
});
