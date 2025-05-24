import React, { useEffect, useState } from "react";
import { Text, ScrollView, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";

const pendingGymsPath = FileSystem.documentDirectory + "pending_gyms.json";

export default function ViewPendingGyms() {
  const [contents, setContents] = useState("");

  useEffect(() => {
    FileSystem.readAsStringAsync(pendingGymsPath)
      .then((data) => setContents(data))
      .catch((err) => {
        console.warn("❌ File read error:", err);
        setContents("Failed to read file.");
      });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text selectable>{contents || "No data found yet."}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
