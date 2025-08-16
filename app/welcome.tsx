// app/services/welcome.tsx
import React, { useEffect } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";


const screenWidth = Dimensions.get("window").width;

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    // const go = async () => {
    //   await showInitialPaywall();
    //   router.replace("/(tabs)/map");  // or wherever you route after splash
    // };
    // const t = setTimeout(go, 2500);
    // return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/appLogo/MATTIME_ForWBackG.png")} style={styles.textLogo} />
      {/* <Image
        source={require("../assets/appLogo/OpenMats_Color.png")}
        style={styles.logo}
        resizeMode="contain"
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  logo: { width: 260, height: 260 },
    textLogo: {   width: screenWidth * 0.8, // 80% of screen width
  aspectRatio: 2,           // 2:1 (same as 120x60)
  resizeMode: "contain",
  marginHorizontal: 8,
 },
});
