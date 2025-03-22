import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MapScreen() {
  useEffect(() => {
    console.log("✅ Map Screen is Loading!");
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ Map Screen Loaded</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red", // 🔴 Make sure we can see it
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
