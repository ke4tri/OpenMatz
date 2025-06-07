import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Gym } from "../types";
import TimeBlockPicker, { TimeBlock } from "../components/TimeBlockPicker";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../Firebase/firebaseConfig";


const pendingGymsPath = FileSystem.documentDirectory + "pending_gyms.json";
const fallbackLogo = require("../assets/fallbacks/BJJ_White_Belt.svg.png");
const shadyEmailDomains = ["tempmail", "yopmail", "mailinator", "dispostable"];
const validateEmail = (email: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
  !shadyEmailDomains.some((d) => email.toLowerCase().includes(d));
const validatePhone = (phone: string) =>
  /^\+?[0-9\s\-().]{7,}$/.test(phone.replace(/\D/g, ""));
const UpdateGymScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    city: "",
    state: "",
    logo: "",
    latitude: 0,
    longitude: 0,
    address: "",
    email: "",
    phone: "",
    website: "",
    country: "",
    approved: false,
    pendingUpdate: true,
    updatedFromId: "",
  });

  const [openMatBlocks, setOpenMatBlocks] = useState<TimeBlock[]>([]);
  const [classTimeBlocks, setClassTimeBlocks] = useState<TimeBlock[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params.existingGym) {
      try {
        const gym: Gym = JSON.parse(params.existingGym as string);
        setFormData({
          ...formData,
          ...gym,
          latitude: gym.latitude,
          longitude: gym.longitude,
          pendingUpdate: true,
          updatedFromId: gym.id,
        });

        if (Array.isArray(gym.openMatTimes)) {
          const parsedOM = gym.openMatTimes.map(parseTimeBlock);
          setOpenMatBlocks(parsedOM);
        }
        if (Array.isArray(gym.classTimes)) {
          const parsedCT = gym.classTimes.map(parseTimeBlock);
          setClassTimeBlocks(parsedCT);
        }
      } catch (e) {
        console.warn("Failed to parse existingGym", e);
      }
    }
  }, [params.existingGym]);

  const parseTimeBlock = (entry: string): TimeBlock => {
    const [dayPart, rest] = entry.split(": ");
    const [range, note] = rest?.split("(") ?? [rest, ""];
    const [startTime, endTime] = range.split("-").map((s) => s.trim());
    return {
      day: dayPart,
      startTime,
      endTime: endTime?.replace(")", "") || "",
      note: note?.replace(")", "") || "",
    };
  };

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
  
    // Update timestamp for Firestore traceability
    if (
      [
        "name", "email", "phone", "website",
        "city", "state", "zip", "country",
        "latitude", "longitude", "logo"
      ].includes(key)
    ) {
      setFormData((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
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
  
    const openMatTimes = openMatBlocks.map(b =>
      `${b.day}: ${b.startTime} - ${b.endTime}${b.note ? ` (${b.note})` : ""}`
    );
    const classTimes = classTimeBlocks.map(b =>
      `${b.day}: ${b.startTime} - ${b.endTime}${b.note ? ` (${b.note})` : ""}`
    );
  
    const newGym: Gym = {
      ...formData,
      openMatTimes,
      classTimes,
      latitude: parseFloat(formData.latitude as any),
      longitude: parseFloat(formData.longitude as any),
      approved: false,
    };
  
    try {
      await setDoc(doc(db, "pendingGyms", newGym.id), {
        ...newGym,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert("Submitted", "Your update has been submitted for review.");
      router.replace("/(tabs)/map");
    } catch (err) {
      console.error("❌ Firestore update failed:", err);
      Alert.alert("Error", "Failed to submit update.");
    }
  };

  const logoSource = formData.logo ? { uri: formData.logo } : fallbackLogo;

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.logoWrapper}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        {!formData.logo && (
          <Text style={styles.logoText}>No logo submitted</Text>
        )}
      </View>


      {["name", "city", "state", "country", "email", "phone", "website"].map((key) => (
        <View key={key}>
          <TextInput
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={String(formData[key as keyof typeof formData] || "")}
            onChangeText={(text) => handleChange(key, text)}
            style={[styles.input, validationErrors[key] ? styles.errorBorder : null]}
          />
          {validationErrors[key] ? (
            <Text style={styles.errorText}>{validationErrors[key]}</Text>
          ) : null}
        </View>
      ))}

      <TimeBlockPicker
        label="Open Mat Times"
        blocks={openMatBlocks}
        setBlocks={setOpenMatBlocks}
      />

      <TimeBlockPicker
        label="Class Times"
        blocks={classTimeBlocks}
        setBlocks={setClassTimeBlocks}
      />

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: formData.latitude || 37.78825,
          longitude: formData.longitude || -122.4324,
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

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
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
    borderColor: "black",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  errorBorder: {
    borderColor: "red",
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
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  map: {
    height: 200,
    width: "100%",
    marginTop: 10,
    marginBottom: 5,
  },
});

export default UpdateGymScreen;
