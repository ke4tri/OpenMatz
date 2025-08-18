// app/index.tsx
import React, { useEffect } from "react";
import { View, Image, StyleSheet, Text, Linking, Pressable, Dimensions } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useLocation } from "../components/LocationContext";
import * as Location from "expo-location";
import { useAccess } from "../hooks/useAccess";

const screenWidth = Dimensions.get("window").width;

export default function SplashScreen() {
  const router = useRouter();
  const { setLocation } = useLocation();

  // 🔑 read entitlements here (inside the component)
  const { loading: accessLoading, hasAnyAccess } = useAccess();

  // 1) Get location (unchanged from your version)
  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const cachedLoc = await Location.getLastKnownPositionAsync({});
        if (cachedLoc) {
          setLocation({
            latitude: cachedLoc.coords.latitude,
            longitude: cachedLoc.coords.longitude,
          });
          console.log("✅ Using cached location");
        } else {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          console.log("✅ Using fresh location");
        }
      }
    };
    fetchLocation();
  }, [setLocation]);

  // 2) After 3s, navigate based on entitlements
  useEffect(() => {
    // wait until we know access status
    if (accessLoading) return;

    const timeout = setTimeout(() => {
      if (hasAnyAccess) {
        router.replace("/map");
      } else {
        router.replace("/screens/subscribe");
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [accessLoading, hasAnyAccess, router]);

  return (
    <View style={styles.container}>
      {/* Hide the default header for this route */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.logoRow}>
        <Image
          source={require("../assets/appLogo/MATTIME_ForWBackG.png")}
          style={styles.textLogo}
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
