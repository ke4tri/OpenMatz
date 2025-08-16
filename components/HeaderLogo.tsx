import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import ClockComponent from "./AnimatedClock";


const screenWidth = Dimensions.get("window").width;

const HeaderLogo = () => {
  return (
      <Image source={require("../assets/appLogo/MATTIME_ForWBackG.png")} style={styles.textLogo} />
    // <View style={styles.container}>
    //   <Image
    //     source={require("../assets/appLogo/Mat.png")}
    //     style={styles.sideImage}
    //     resizeMode="contain"
    //   />
    //   <ClockComponent />
    //   <Image
    //     source={require("../assets/appLogo/Times.png")}
    //     style={styles.sideImage}
    //     resizeMode="contain"
    //   />
    // </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  sideImage: {
    width: 80,
    height: 40,
    marginHorizontal: 5,
  },
    textLogo: {   width: screenWidth * 0.8, // 80% of screen width
  aspectRatio: 2,           // 2:1 (same as 120x60)
  resizeMode: "contain",
  marginHorizontal: 8,
 }
});

export default HeaderLogo;
