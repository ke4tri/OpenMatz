import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function SubmitScreen() {
  const [gymName, setGymName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [openMatTimes, setOpenMatTimes] = useState("");

  const handleSubmit = () => {
    const newGym = {
      name: gymName.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      logo: logoUrl.trim(),
      openMatTimes: [openMatTimes.trim()],
    };

    console.log("Submitted Gym:", newGym);
    // Eventually this will POST to Firebase or store it locally
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submit a Gym</Text>

      <Text style={styles.label}>Gym Name</Text>
      <TextInput
        value={gymName}
        onChangeText={setGymName}
        placeholder="ENTER GYM NAME"
        placeholderTextColor="#d4d4aa"
        style={styles.input}
      />

      <Text style={styles.label}>Latitude</Text>
      <TextInput
        value={latitude}
        onChangeText={setLatitude}
        placeholder="ENTER LATITUDE"
        placeholderTextColor="#d4d4aa"
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Longitude</Text>
      <TextInput
        value={longitude}
        onChangeText={setLongitude}
        placeholder="ENTER LONGITUDE"
        placeholderTextColor="#d4d4aa"
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Logo URL</Text>
      <TextInput
        value={logoUrl}
        onChangeText={setLogoUrl}
        placeholder="ENTER LOGO IMAGE URL"
        placeholderTextColor="#d4d4aa"
        style={styles.input}
      />

      <Text style={styles.label}>Open Mat Times</Text>
      <TextInput
        value={openMatTimes}
        onChangeText={setOpenMatTimes}
        placeholder="e.g. Monday 6:00 - 7:00"
        placeholderTextColor="#d4d4aa"
        style={styles.input}
      />
      <Text style={styles.hintText}>Format: Monday hh:mm - hh:mm</Text>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Gym</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f0f0",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    color: "#000",
  },
  hintText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 15,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
