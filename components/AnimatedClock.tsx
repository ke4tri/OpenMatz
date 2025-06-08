import React, { useEffect, useRef } from "react";
import { View, Image, Animated, StyleSheet, Easing } from "react-native";
import { Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;

const ClockComponent = () => {
  const purpleAnim = useRef(new Animated.Value(0)).current;
  const brownAnim = useRef(new Animated.Value(0)).current;
  const blueAnim = useRef(new Animated.Value(0)).current;
  const centerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    };

    spin(purpleAnim, 60000); // 60 sec rotation
    spin(brownAnim, 30000);  // 30 sec rotation
    spin(blueAnim, 10000);  // 30 sec rotation
    spin(centerAnim, 20000); // 90 sec (slow spin for center)
  }, []);

  const rotate = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

  return (
    <View style={styles.wrapper}>
      {/* Center base image */}
      <Animated.Image
        source={require("../assets/appLogo/Center.png")}
        style={[styles.base, { transform: [{ rotate: rotate(centerAnim) }] }]}
      />

      {/* Purple hand */}
      <View style={styles.handWrapper}>
        <Animated.Image
          source={require("../assets/appLogo/Purple.png")}
          style={[styles.hand, { transform: [{ rotate: rotate(purpleAnim) }] }]}
        />
      </View>

      {/* Brown hand */}
      <View style={styles.handWrapper}>
        <Animated.Image
          source={require("../assets/appLogo/Brown.png")}
          style={[styles.hand, { transform: [{ rotate: rotate(brownAnim) }] }]}
        />
      </View>
            {/* Blue hand */}
            <View style={styles.handWrapper}>
        <Animated.Image
          source={require("../assets/appLogo/Blue.png")}
          style={[styles.hand, { transform: [{ rotate: rotate(blueAnim) }] }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    wrapper: {
      width: screenWidth * 0.1,  // adjust size proportionally
      height: screenWidth * 0.1,
      alignItems: "center",
      justifyContent: "center",
    },
    base: {
      position: "absolute",
      width: screenWidth * 0.1,
      height: screenWidth * 0.1,
    },
    handWrapper: {
      position: "absolute",
      width: screenWidth * 0.1,
      height: screenWidth * 0.1,
      alignItems: "center",
      justifyContent: "center",
    },
    hand: {
      width: screenWidth * 0.01,
      height: screenWidth * 0.05,
      transform: [{ translateY: -(screenWidth * 0.025) }],
    },
  });
  
  

// const styles = StyleSheet.create({
//   wrapper: {
//     position: "absolute",
//     top: 100,
//     right: 20,
//     width: 100,
//     height: 100,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   base: {
//     position: "absolute",
//     width: 100,
//     height: 100,
//   },
//   handWrapper: {
//     position: "absolute",
//     width: 100,
//     height: 100,
//     alignItems: "center",
//     justifyContent: "center", // centers rotation point
//   },
//   hand: {
//     width: 10,
//     height: 50,
//     transform: [
//       { translateY: -25 }, // move up by half height to simulate rotation from bottom
//     ],
//   },
// });

export default ClockComponent;
