import React, { useEffect } from "react";
import { View, Image, StyleSheet, Text, Linking, Pressable } from "react-native";
import AnimatedClock from "../components/AnimatedClock";
import { useRouter } from "expo-router";
import { useLocation } from "../components/LocationContext";
import * as Location from "expo-location";

const SplashScreen = () => {
  const router = useRouter();
  const { setLocation } = useLocation();

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

    const timeout = setTimeout(() => {
      router.replace("/map");
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Image source={require("../assets/appLogo/Mat.png")} style={styles.textLogo} />
        <AnimatedClock />
        <Image source={require("../assets/appLogo/Times2.png")} style={styles.textLogo} />
      </View>

      {/* ➕ Added Branding */}
      <View style={styles.branding}>
        <Text style={styles.byText}>By Port13ET</Text>
        <Pressable onPress={() => Linking.openURL("https://www.Port13ET.com")}>
          <Text style={styles.url}>www.Port13ET.com</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  textLogo: {
    width: 120,
    height: 60,
    resizeMode: "contain",
    marginHorizontal: 8,
  },
  branding: {
    marginTop: 30,
    alignItems: "center",
  },
  byText: {
    color: "#ccc",
    fontSize: 16,
    fontWeight: "600",
  },
  url: {
    color: "#00BFFF",
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: 4,
  },
});

export default SplashScreen;
