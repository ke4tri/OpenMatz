// Full updated update-gym.tsx

import React, { useState, useEffect } from "react";
import {
  View, TextInput, StyleSheet, ScrollView, Text, Alert,
  TouchableOpacity, Image, Dimensions
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Gym } from "./types";

const pendingGymsPath = FileSystem.documentDirectory + "pending_gyms.json";
const fallbackLogo = require("../assets/fallbacks/BJJ_White_Belt.svg.png");

const validateEmail = (email: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
const validatePhone = (phone: string) =>
  /^\+?[0-9\s\-().]{7,}$/.test(phone.replace(/\D/g, ""));

const UpdateGymScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [formData, setFormData] = useState<Gym & {
    street?: string;
    zip?: string;
    country?: string;
  }>({
    id: "",
    name: "",
    logo: "",
    latitude: 0,
    longitude: 0,
    openMatTimes: [],
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    approved: false,
    street: "",
    zip: "",
    country: "USA",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [locationLoaded, setLocationLoaded] = useState(false);

  useEffect(() => {
    if (params.existingGym) {
      try {
        const parsed = JSON.parse(params.existingGym as string);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          zip: parsed.zip || "",
          country: parsed.country || "USA",
          approved: false,
        }));
        setLocationLoaded(true);
      } catch (e) {
        console.warn("Failed to parse gym:", e);
      }
    } else {
      Location.requestForegroundPermissionsAsync().then(({ status }) => {
        if (status === "granted") {
          Location.getCurrentPositionAsync().then((loc) => {
            setFormData((prev) => ({
              ...prev,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            }));
            setLocationLoaded(true);
          });
        }
      });
    }
  }, []);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (key === "email") {
      setValidationErrors((prev) => ({
        ...prev,
        email: validateEmail(value) ? "" : "Invalid email",
      }));
    }
    if (key === "phone") {
      setValidationErrors((prev) => ({
        ...prev,
        phone: validatePhone(value) ? "" : "Invalid phone",
      }));
    }
  };

  const handleMarkerDrag = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setFormData((prev) => ({ ...prev, latitude, longitude }));
  };

  const saveToPendingJson = async (gym: Gym) => {
    try {
      const existingData = await FileSystem.readAsStringAsync(pendingGymsPath).catch(() => "[]");
      const parsed = JSON.parse(existingData);
      parsed.push(gym);
      await FileSystem.writeAsStringAsync(pendingGymsPath, JSON.stringify(parsed, null, 2));
    } catch (e) {
      Alert.alert("Error saving submission.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.latitude || !formData.longitude) {
      Alert.alert("Missing Info", "Name, latitude, and longitude required.");
      return;
    }
    if (!validateEmail(formData.email)) {
      Alert.alert("Invalid Email");
      return;
    }
    if (!validatePhone(formData.phone)) {
      Alert.alert("Invalid Phone");
      return;
    }

    const combinedAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`.trim();

    const gymToSave: Gym = {
      ...formData,
      address: combinedAddress,
      approved: false,
    };

    await saveToPendingJson(gymToSave);
    Alert.alert("Update submitted and pending approval!");
    router.back();
  };

  const logoSource = formData.logo ? { uri: formData.logo } : fallbackLogo;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoWrapper}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        {!formData.logo && <Text style={styles.logoText}>No logo submitted</Text>}
      </View>

      {["name", "logo", "email", "phone", "openMatTimes", "street", "city", "state", "zip", "country"].map((field) => (
        <View key={field} style={{ marginBottom: 12 }}>
          <Text style={styles.label}>{field.toUpperCase()}</Text>
          <TextInput
            placeholder={field}
            value={formData[field as keyof typeof formData] as string}
            onChangeText={(text) => handleChange(field as keyof typeof formData, text)}
            style={[styles.input, validationErrors[field] ? styles.errorBorder : null]}
          />
          {validationErrors[field] ? (
            <Text style={styles.errorText}>{validationErrors[field]}</Text>
          ) : null}
        </View>
      ))}

      {locationLoaded && (
        <>
          <Text style={styles.mapNote}>Hold red pin to adjust location</Text>
          <MapView
            style={styles.map}
            region={{
              latitude: formData.latitude,
              longitude: formData.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: formData.latitude, longitude: formData.longitude }}
              draggable
              pinColor="red"
              onDragEnd={handleMarkerDrag}
            />
          </MapView>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>SUBMIT UPDATE</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>BACK</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9f9f9" },
  logoWrapper: { alignItems: "center", marginBottom: 20 },
  logo: { width: 200, height: 100 },
  logoText: { marginTop: 5, fontStyle: "italic", color: "#888" },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, backgroundColor: "#fff",
  },
  mapNote: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  map: {
    height: 200,
    width: Dimensions.get("window").width - 40,
    alignSelf: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  backButton: {
    marginTop: 10,
    padding: 10,
    alignSelf: "center",
  },
  backButtonText: { fontSize: 16, fontWeight: "600", color: "#007AFF" },
  errorText: { color: "red", fontSize: 12, marginTop: 4 },
  errorBorder: { borderColor: "red" },
});

export default UpdateGymScreen;
