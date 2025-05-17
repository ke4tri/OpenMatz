// Full updated code for app/add-gym.tsx with logo rendering at top of form

import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  Text,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Gym } from "./types";

const pendingGymsPath = FileSystem.documentDirectory + "pending_gyms.json";
const fallbackLogo = require("../assets/fallbacks/BJJ_White_Belt.svg.png");

const shadyEmailDomains = ["tempmail", "yopmail", "mailinator", "dispostable"];

const validateEmail = (email: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
  !shadyEmailDomains.some((d) => email.toLowerCase().includes(d));

const validatePhone = (phone: string) =>
  /^\+?[0-9\s\-().]{7,}$/.test(phone.replace(/\D/g, ""));

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

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingGym && !formData.id) {
      setFormData(prev => ({
        ...prev,
        ...existingGym,
        latitude: existingGym.latitude?.toString() || "",
        longitude: existingGym.longitude?.toString() || "",
        openMatTimes: (existingGym.openMatTimes || []).join(", "),
        approved: false,
        pendingUpdate: true,
        updatedFromId: existingGym.id ?? "",
      }));
    }
  }, [existingGym]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));

    if (key === "email") {
      setValidationErrors(prev => ({
        ...prev,
        email: validateEmail(value) ? "" : "Invalid email",
      }));
    }
    if (key === "phone") {
      setValidationErrors(prev => ({
        ...prev,
        phone: validatePhone(value) ? "" : "Invalid phone number",
      }));
    }
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
    if (!validateEmail(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!validatePhone(formData.phone)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
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

  const logoSource = formData.logo ? { uri: formData.logo } : fallbackLogo;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoWrapper}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        {!formData.logo && <Text style={styles.logoText}>No logo submitted</Text>}
      </View>

      {Object.entries(formData).map(([key, val]) => {
        if (["approved", "pendingUpdate", "updatedFromId", "id"].includes(key)) return null;
        return (
          <View key={key}>
            <TextInput
              placeholder={key}
              value={String(val)}
              onChangeText={(text) => handleChange(key, text)}
              style={[styles.input, validationErrors[key] ? styles.errorBorder : null]}
            />
            {validationErrors[key] ? (
              <Text style={styles.errorText}>{validationErrors[key]}</Text>
            ) : null}
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.submitButton, Object.values(validationErrors).some(Boolean) && { backgroundColor: "#aaa" }]}
        onPress={handleSubmit}
        disabled={Object.values(validationErrors).some(Boolean)}
      >
        <Text style={styles.submitButtonText}>SUBMIT</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>BACK</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 100,
  },
  logoText: {
    marginTop: 5,
    fontStyle: "italic",
    color: "#888",
  },
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
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  errorBorder: {
    borderColor: 'red',
  },
});

export default AddGymScreen;
