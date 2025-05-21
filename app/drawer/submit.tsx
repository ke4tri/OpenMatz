import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Gym } from "../types";
import TimeBlockPicker, { TimeBlock } from "../../components/TimeBlockPicker";
import { useRouter } from "expo-router";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";


const shadyEmailDomains = ["tempmail", "yopmail", "mailinator", "dispostable"];
const fallbackLogo = require("../../assets/fallbacks/BJJ_White_Belt.svg.png");

const validateEmail = (email: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
  !shadyEmailDomains.some((d) => email.toLowerCase().includes(d));

const validatePhone = (phone: string) =>
  /^\+?[0-9\s\-().]{7,}$/.test(phone.replace(/\D/g, ""));

export default function SubmitScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    logo: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    address: "",
    latitude: 0,
    longitude: 0,
    email: "",
    phone: "",
    website: "",
    approved: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [openMatBlocks, setOpenMatBlocks] = useState<TimeBlock[]>([]);
  const [classTimeBlocks, setClassTimeBlocks] = useState<TimeBlock[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setFormData((prev) => ({
          ...prev,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
      }
      setIsLoadingLocation(false);
    })();
  }, []);

  const handleChange = (key: string, value: string) => {
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

  const handleSubmit = async () => {
    const errors: string[] = [];
    if (!formData.name || !formData.latitude || !formData.longitude) {
      errors.push("Name, latitude, and longitude are required.");
    }
    if (!validateEmail(formData.email)) {
      errors.push("Invalid email address.");
    }
    if (!validatePhone(formData.phone)) {
      errors.push("Invalid phone number.");
    }

    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n"));
      return;
    }

    const address = `${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`.trim();

    const openMatTimes = openMatBlocks.map(
      (b) =>
        `${b.day}: ${b.startTime} - ${b.endTime}${b.note ? ` (${b.note})` : ""}`
    );
    const classTimes = classTimeBlocks.map(
      (b) =>
        `${b.day}: ${b.startTime} - ${b.endTime}${b.note ? ` (${b.note})` : ""}`
    );

    const newGym: Gym = {
      ...formData,
      id: Date.now().toString(),
      latitude: formData.latitude,
      longitude: formData.longitude,
      address,
      openMatTimes,
      classTimes,
    };

    const existing = await AsyncStorage.getItem("customGyms");
    const parsed = existing ? JSON.parse(existing) : [];
    parsed.push(newGym);
    await AsyncStorage.setItem("customGyms", JSON.stringify(parsed));

    Alert.alert("Success", "Gym has been submitted for review.");
    router.back();
  };

  const logoSource = formData.logo ? { uri: formData.logo } : fallbackLogo;

  return (
<KeyboardAwareFlatList
  data={[1]} // dummy item to trigger rendering
  keyExtractor={() => "form"}
  contentContainerStyle={styles.container}
  renderItem={() => (
    <>
      <View style={styles.logoWrapper}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        {!formData.logo && <Text style={styles.logoText}>No logo submitted</Text>}
      </View>

      {["name", "logo", "city", "state", "zip", "country", "email", "phone", "website"].map((key) => (
        <View key={key}>
          <TextInput
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={String(formData[key as keyof typeof formData] || "")}
            onChangeText={(text) => handleChange(key, text)}
            style={[styles.input, validationErrors[key] ? styles.errorBorder : null]}
            placeholderTextColor="#999"
          />
          {validationErrors[key] ? (
            <Text style={styles.errorText}>{validationErrors[key]}</Text>
          ) : null}
        </View>
      ))}

      <TimeBlockPicker label="Open Mat Times" blocks={openMatBlocks} setBlocks={setOpenMatBlocks} />
      <TimeBlockPicker label="Class Times" blocks={classTimeBlocks} setBlocks={setClassTimeBlocks} />

      {!isLoadingLocation && (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: formData.latitude,
              longitude: formData.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              draggable
              coordinate={{
                latitude: formData.latitude,
                longitude: formData.longitude,
              }}
              onDragEnd={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                }))
              }
            />
          </MapView>
          <Text style={{ textAlign: "center", marginVertical: 5 }}>
            Hold down red pin to adjust location
          </Text>
        </>
      )}

      <TouchableOpacity
        style={[
          styles.submitButton,
          Object.values(validationErrors).some(Boolean) && { backgroundColor: "#aaa" },
        ]}
        onPress={handleSubmit}
        disabled={Object.values(validationErrors).some(Boolean)}
      >
        <Text style={styles.submitButtonText}>Submit Gym</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </>
  )}
/>

  );
}

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
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  errorBorder: {
    borderColor: "red",
  },
  map: {
    height: 200,
    width: "100%",
    marginTop: 10,
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 12,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
