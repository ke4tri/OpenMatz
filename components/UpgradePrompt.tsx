import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";

type Props = {
  onBack?: () => void;
};

export default function UpgradePrompt({ onBack }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkText]}>
        🚫 Feature Locked
      </Text>

      <Text style={[styles.message, isDark && styles.darkText]}>
        Submitting or updating gyms is only available to paid OpenMatsX members.
      </Text>

      <TouchableOpacity style={styles.button} onPress={onBack}>
        <Text style={styles.buttonText}>Back to Map</Text>
      </TouchableOpacity>
      <TouchableOpacity
  style={[styles.button, styles.upgradeButton]}
  onPress={() => alert("Upgrade flow coming soon!")}
>
  <Text style={styles.buttonText}>Upgrade Now</Text>
</TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f0f4f7",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
    textAlign: "center",
  },
  upgradeButton: {
    marginTop: 12,
    backgroundColor: "#34C759", // nice green color
  },  
  message: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  darkText: {
    color: "#eee",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 30,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
