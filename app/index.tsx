import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
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
      router.replace("/(tabs)/map");
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Image source={require("../assets/appLogo/Mat.png")} style={styles.textLogo} />
        <AnimatedClock />
        <Image source={require("../assets/appLogo/Times.png")} style={styles.textLogo} />
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
});

export default SplashScreen;










// Comment out the above and uncomment the below to revert back to static logo
// import { useEffect } from "react";
// import { View, Image, StyleSheet } from "react-native";
// import { useRouter } from "expo-router";

// export default function WelcomeScreen() {
//   const router = useRouter();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       console.log("✅ Redirecting to /map");
//       router.replace("/(tabs)/map");
//     }, 2500); // Show splash for 2.5 seconds

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require("../assets/appLogo/MatTime Logo Final.png")}
//         style={styles.logo}
//         resizeMode="contain"
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
//   logo: { width: 260, height: 260 },
// });
