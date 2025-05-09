import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Switch,
  Text,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Gym } from "../types";

const pendingGymsPath = FileSystem.documentDirectory + "pending_gyms.json";

const AddGymScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  let existingGym: Partial<Gym> | null = null;
  try {
    if (params.existingGym) {
      existingGym = JSON.parse(params.existingGym as string);
    }
  } catch (e) {
    console.warn("Failed to parse existingGym:", e);
  }

  if (!existingGym || typeof existingGym.latitude !== "number") {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: "red" }}>
          Missing or invalid gym data passed.
        </Text>
      </View>
    );
  }

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    city: "",
    state: "",
    logo: "",
    latitude: "",
    longitude: "",
    openMatTimes: "",
    address: "",
    email: "",
    phone: "",
    approved: false,
    pendingUpdate: false,
    updatedFromId: "",
  });

  useEffect(() => {
    if (existingGym) {
      setFormData(prev => ({
        ...prev,
        ...existingGym,
        latitude: existingGym.latitude?.toString() || "",
        longitude: existingGym.longitude?.toString() || "",
        openMatTimes: (existingGym.openMatTimes || []).join(", "),
        approved: false,
        pendingUpdate: !!existingGym.id,
        updatedFromId: existingGym.id || "",
      }));
    }
  }, [existingGym]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const saveToPendingJson = async (newGym: Gym) => {
    try {
      const existingData = await FileSystem.readAsStringAsync(pendingGymsPath).catch(() => "[]");
      const parsed = JSON.parse(existingData);
      parsed.push(newGym);
      await FileSystem.writeAsStringAsync(pendingGymsPath, JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.error("Failed to save to pending gyms:", e);
      Alert.alert("Error", "Failed to save the submission.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.latitude || !formData.longitude) {
      Alert.alert("Missing required fields", "Name, latitude, and longitude are required.");
      return;
    }

    const newGym: Gym = {
      ...formData,
      id: formData.id || Date.now().toString(),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      openMatTimes: formData.openMatTimes
        ? formData.openMatTimes.split(",").map(str => str.trim())
        : [],
      approved: false,
    };

    await saveToPendingJson(newGym);
    Alert.alert("Success", "Gym submitted and pending approval!");
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Object.entries(formData).map(([key, val]) => {
        if (["approved", "pendingUpdate", "updatedFromId", "id"].includes(key)) return null;
        return (
          <TextInput
            key={key}
            placeholder={key}
            value={String(val)}
            onChangeText={(text) => handleChange(key, text)}
            style={styles.input}
          />
        );
      })}

      <View style={styles.switchRow}>
        <Text>Approved</Text>
        <Switch
          value={formData.approved}
          onValueChange={(value) =>
            setFormData(prev => ({ ...prev, approved: value }))
          }
          disabled={true}
        />
      </View>

      <Button title="Submit Gym" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
});

export default AddGymScreen;
