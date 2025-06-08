import React from "react";
import { View, Image, StyleSheet } from "react-native";
import ClockComponent from "./AnimatedClock";

const HeaderLogo = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/appLogo/Mat.png")}
        style={styles.sideImage}
        resizeMode="contain"
      />
      <ClockComponent />
      <Image
        source={require("../assets/appLogo/Times.png")}
        style={styles.sideImage}
        resizeMode="contain"
      />
    </View>
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
});

export default HeaderLogo;
