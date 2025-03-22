import React from "react";
import { View, Text, StyleSheet } from "react-native";

const GymDetailsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the Gym Details Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "bold" },
});

export default GymDetailsScreen; // ✅ Make sure this line exists!
