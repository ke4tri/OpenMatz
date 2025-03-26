import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";

export default function MapScreen() {
  useEffect(() => {
    console.log("✅ Map Screen is Rendering!");
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>📍 Map Screen Loaded!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "blue", // The "blue screen"
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
  },
});
