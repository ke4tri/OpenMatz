import React, { useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable
} from "react-native";
import gymsData from "../../assets/gyms.json";
import type { Gym, GymForm } from "../types";
import { useRouter } from "expo-router";

const shadyEmailDomains = ["tempmail", "yopmail", "mailinator", "dispostable"];
const validateEmail = (email: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
  !shadyEmailDomains.some((d) => email.toLowerCase().includes(d));
const validatePhone = (phone: string) =>
  /^\+?[0-9\s\-().]{7,}$/.test(phone.replace(/\D/g, ""));

export default function SubmitScreen() {
  const [gyms, setGyms] = useState<Gym[]>(gymsData as Gym[]);
  const router = useRouter();

  const [formData, setFormData] = useState<GymForm & {
    street?: string;
    zip?: string;
    country?: string;
  }>({
    id: "",
    name: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    logo: "",
    openMatTimes: [],
    address: "", // dynamically filled
    email: "",
    phone: "",
    approved: false,
    street: "",
    zip: "",
    country: "USA",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const refs = {
    name: useRef<TextInput>(null),
    latitude: useRef<TextInput>(null),
    longitude: useRef<TextInput>(null),
    logo: useRef<TextInput>(null),
    openMatTimes: useRef<TextInput>(null),
    city: useRef<TextInput>(null),
    state: useRef<TextInput>(null),
    email: useRef<TextInput>(null),
    phone: useRef<TextInput>(null),
    street: useRef<TextInput>(null),
    zip: useRef<TextInput>(null),
    country: useRef<TextInput>(null),
  };

  const handleChange = (key: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (typeof value === "string") {
      if (key === "email") {
        setValidationErrors((prev) => ({
          ...prev,
          email: validateEmail(value) ? "" : "Invalid email format or domain",
        }));
      }
      if (key === "phone") {
        setValidationErrors((prev) => ({
          ...prev,
          phone: validatePhone(value) ? "" : "Invalid phone number",
        }));
      }
    }
  };

  const handleSubmit = async () => {
    const openMatStrings =
      typeof formData.openMatTimes === "string"
        ? formData.openMatTimes.split(",").map((t) => t.trim())
        : formData.openMatTimes;

    const errors: string[] = [];
    const dayRegex = /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/i;
    const formatRegex = /^\w+:\s*\d{1,2}(am|pm)\s*-\s*\d{1,2}(am|pm)$/i;

    for (const time of openMatStrings) {
      if (!dayRegex.test(time)) errors.push(`Invalid day in: "${time}"`);
      if (!time.includes(":")) errors.push(`Missing colon after day in: "${time}"`);
      if (!/(\d{1,2}(am|pm))\s*-\s*(\d{1,2}(am|pm))/.test(time))
        errors.push(`Missing or incorrect AM/PM format in: "${time}"`);
      if (!formatRegex.test(time))
        errors.push(`Incorrect format in: "${time}" (should be like 'Monday: 9am - 10am')`);
    }

    if (errors.length > 0) {
      Alert.alert("Open Mat Time Format Error", errors.join("\n"));
      return;
    }

    if (!formData.name || !formData.latitude || !formData.longitude) {
      Alert.alert("Missing Required Fields", "Name, Latitude, and Longitude are required.");
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!validatePhone(formData.phone)) {
      Alert.alert("Invalid Phone Number", "Phone number must be at least 7 digits.");
      return;
    }

    const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`.trim();

    const newGym: Gym = {
      id: Date.now().toString(),
      name: formData.name,
      city: formData.city,
      state: formData.state,
      latitude: Number(formData.latitude) || 0,
      longitude: Number(formData.longitude) || 0,
      logo: formData.logo,
      openMatTimes: openMatStrings,
      address: fullAddress,
      email: formData.email,
      phone: formData.phone,
      approved: false,
    };

    const updatedGyms = [...gyms, newGym];
    setGyms(updatedGyms);
    await AsyncStorage.setItem("customGyms", JSON.stringify(updatedGyms));
    Alert.alert("Success", "Gym has been added!");

    setFormData({
      id: "",
      name: "",
      city: "",
      state: "",
      latitude: "",
      longitude: "",
      logo: "",
      openMatTimes: [],
      address: "",
      email: "",
      phone: "",
      approved: false,
      street: "",
      zip: "",
      country: "USA"
    });

    refs.name.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text style={styles.title}>Submit a Gym</Text>

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back to Map</Text>
        </Pressable>

        {["name", "logo", "latitude", "longitude", "openMatTimes", "email", "phone", "street", "city", "state", "zip", "country"].map((field) => (
          <TextInput
            key={field}
            ref={refs[field as keyof typeof refs]}
            style={[styles.input, validationErrors[field] ? { borderColor: "red" } : null]}
            value={formData[field as keyof typeof formData] as string}
            onChangeText={(text) => handleChange(field as keyof typeof formData, text)}
            placeholder={field}
            placeholderTextColor="#999"
          />
        ))}

        {validationErrors.email ? <Text style={{ color: "red" }}>{validationErrors.email}</Text> : null}
        {validationErrors.phone ? <Text style={{ color: "red" }}>{validationErrors.phone}</Text> : null}

        <TouchableOpacity
          style={[styles.button, Object.values(validationErrors).some(Boolean) && { backgroundColor: "#aaa" }]}
          onPress={handleSubmit}
          disabled={Object.values(validationErrors).some(Boolean)}
        >
          <Text style={styles.buttonText}>Submit Gym</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backButton: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 6,
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
