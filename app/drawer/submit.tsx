import React, { useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable
} from "react-native";
import gymsData from "../../assets/gyms.json";
import type { Gym, GymForm } from "../types";
import { useRouter } from "expo-router";

export default function SubmitScreen() {
  const [gyms, setGyms] = useState<Gym[]>(gymsData as Gym[]);

const router = useRouter();

  const [formData, setFormData] = useState<GymForm>({
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
  });

  const refs = {
    name: useRef<TextInput>(null),
    latitude: useRef<TextInput>(null),
    longitude: useRef<TextInput>(null),
    logo: useRef<TextInput>(null),
    openMatTimes: useRef<TextInput>(null),
    city: useRef<TextInput>(null),
    state: useRef<TextInput>(null),
    address: useRef<TextInput>(null),
    email: useRef<TextInput>(null),
    phone: useRef<TextInput>(null),
  };

  const handleChange = (key: keyof GymForm, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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

    const newGym: Gym = {
      id: Date.now().toString(),
      name: formData.name,
      city: formData.city,
      state: formData.state,
      latitude: Number(formData.latitude) || 0,
      longitude: Number(formData.longitude) || 0,
      logo: formData.logo,
      openMatTimes: openMatStrings,
      address: formData.address,
      email: formData.email,
      phone: formData.phone,
      approved: formData.approved,
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


        <TextInput
          ref={refs.name}
          value={formData.name}
          onChangeText={(text) => handleChange("name", text)}
          placeholder="Gym Name"
          returnKeyType="next"
          onSubmitEditing={() => refs.latitude.current?.focus()}
          blurOnSubmit={false}
          placeholderTextColor="#999"
          style={styles.input}
        />
        <TextInput
          ref={refs.latitude}
          value={formData.latitude}
          onChangeText={(text) => handleChange("latitude", text)}
          placeholder="Latitude"
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={() => refs.longitude.current?.focus()}
          blurOnSubmit={false}
          placeholderTextColor="#999"
          style={styles.input}
        />
        <TextInput
          ref={refs.longitude}
          value={formData.longitude}
          onChangeText={(text) => handleChange("longitude", text)}
          placeholder="Longitude"
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={() => refs.logo.current?.focus()}
          blurOnSubmit={false}
          placeholderTextColor="#999"
          style={styles.input}
        />
        <TextInput
          ref={refs.logo}
          value={formData.logo}
          onChangeText={(text) => handleChange("logo", text)}
          placeholder="Logo URL"
          returnKeyType="next"
          onSubmitEditing={() => refs.openMatTimes.current?.focus()}
          blurOnSubmit={false}
          placeholderTextColor="#999"
          style={styles.input}
        />
        <TextInput
          ref={refs.openMatTimes}
          value={
            typeof formData.openMatTimes === "string"
              ? formData.openMatTimes
              : formData.openMatTimes.join(", ")
          }
          onChangeText={(text) => handleChange("openMatTimes", text)}
          placeholder="Monday: 9am - 10am (comma separated)"
          returnKeyType="next"
          onSubmitEditing={() => refs.city.current?.focus()}
          blurOnSubmit={false}
          placeholderTextColor="#999"
          style={styles.input}
        />
        <Text style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>
          Format: Monday: 9am - 10am (comma separated)
        </Text>

        <TextInput
          ref={refs.city}
          value={formData.city}
          onChangeText={(text) => handleChange("city", text)}
          placeholder="City"
          returnKeyType="next"
          onSubmitEditing={() => refs.state.current?.focus()}
          blurOnSubmit={false}
          placeholderTextColor="#999"
          style={styles.input}
        />
        <TextInput
          ref={refs.state}
          value={formData.state}
          onChangeText={(text) => handleChange("state", text)}
          placeholder="State"
          returnKeyType="next"
          onSubmitEditing={() => refs.address.current?.focus()}
          blurOnSubmit={false}
          placeholderTextColor="#999"
          style={styles.input}
        />
        <TextInput
          ref={refs.address}
          value={formData.address}
          onChangeText={(text) => handleChange("address", text)}
          placeholder="Address"
          returnKeyType="next"
          onSubmitEditing={() => refs.email.current?.focus()}
          blurOnSubmit={false}
          placeholderTextColor="#999"
          style={styles.input}
        />
        <TextInput
          ref={refs.email}
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          placeholder="Email"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => refs.phone.current?.focus()}
          blurOnSubmit={false}
          placeholderTextColor="#999"
          style={styles.input}
        />
        <TextInput
          ref={refs.phone}
          value={formData.phone}
          onChangeText={(text) => handleChange("phone", text)}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          placeholderTextColor="#999"
          style={styles.input}
        />

        <View style={styles.switchRow}>
          <Text>Approved</Text>
          <Switch
            value={formData.approved}
            onValueChange={(val) => handleChange("approved", val)}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
