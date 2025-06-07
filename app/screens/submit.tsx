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
  Platform
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Gym } from "../../types";
import TimeBlockPicker, { TimeBlock } from "../../components/TimeBlockPicker";
import { useRouter } from "expo-router";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import Constants from "expo-constants";

//FIREBASE
import { signInAnonymously } from "firebase/auth";
// import { auth } from "../../Firebase/firebaseConfig"; // adjust path if needed
import { collection, addDoc,setDoc, doc } from "firebase/firestore";
import { db } from "../../Firebase/firebaseConfig";


const OPENCAGE_API_KEY = Constants.expoConfig?.extra?.opencageApiKey;
console.log("🔐 OpenCage API Key:", OPENCAGE_API_KEY);

const shadyEmailDomains = ["tempmail", "yopmail", "mailinator", "dispostable"];
const fallbackLogo = require("../../assets/fallbacks/BJJ_White_Belt.svg.png");
const pendingGymsPath = FileSystem.documentDirectory + "pending_gyms.json";

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

  const fetchFromOpenCage = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          key: OPENCAGE_API_KEY,
          q: `${latitude},${longitude}`,
          no_annotations: 1,
        },
      });
  
      const result = response.data?.results?.[0];
      const components = result?.components || {};
  
      return {
        city: components.city || components.town || components.village || "",
        state: components.state || "",
        zip: components.postcode || "",
        country: components.country || "",
      };
    } catch (error) {
      console.warn("OpenCage fallback failed", error);
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
  
        if (status !== "granted") {
          console.warn("Location permission not granted");
          setIsLoadingLocation(false);
          return;
        }
  
        const loc = await Location.getCurrentPositionAsync({});
        if (!loc || !loc.coords) {
          console.warn("Location not available");
          setIsLoadingLocation(false);
          return;
        }
  
        const { latitude, longitude } = loc.coords;
  
        console.log("🛰 Initial location loaded", latitude, longitude);
  
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
  
        await updateAddressFromCoords(latitude, longitude);
      } catch (e) {
        console.warn("❌ Location error", e);
      } finally {
        setIsLoadingLocation(false);
      }
    }
  )();
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

  const updateAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
  
      if (result && result.length > 0) {
        const info = result[0];
        setFormData((prev) => ({
          ...prev,
          city: info.city || "",
          state: info.region || "",
          zip: info.postalCode || "",
          country: info.country || "",
          address: `${info.name || ""} ${info.street || ""} ${info.city || ""}, ${info.region || ""} ${info.postalCode || ""}`,
        }));
        return;
      }
    } catch (err) {
      console.warn("Expo reverse geocoding failed, trying OpenCage...", err);
    }
  
    const fallback = await fetchFromOpenCage(latitude, longitude);
    if (fallback) {
      setFormData((prev) => ({
        ...prev,
        city: fallback.city,
        state: fallback.state,
        zip: fallback.zip,
        country: fallback.country,
        address: `${fallback.city}, ${fallback.state} ${fallback.zip}, ${fallback.country}`,
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
  
    const openMatTimes = openMatBlocks.map(
      (b) => `${b.day}: ${b.startTime} - ${b.endTime}${b.note ? ` (${b.note})` : ""}`
    );
    const classTimes = classTimeBlocks.map(
      (b) => `${b.day}: ${b.startTime} - ${b.endTime}${b.note ? ` (${b.note})` : ""}`
    );
  
    const fetchIP = async (): Promise<string> => {
      try {
        const res = await fetch("https://corsproxy.io/?https://api.ipify.org?format=json");
        const data = await res.json();
        return data.ip;
      } catch (err) {
        console.warn("❌ Failed to fetch IP:", err);
        return "Unknown";
      }
    };
    
  
    const ip = await fetchIP();
  
    const baseGymData = {
      ...formData,
      openMatTimes,
      classTimes,
      approved: false,
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      submittedByIP: ip,
      submittedBy: {
        name: formData.submittedByName || "", // Add to form if desired
        email: formData.email,
        phone: formData.phone,
      },
    };
  
    try {
      const docRef = await addDoc(collection(db, "pendingGyms"), baseGymData);
  
      await setDoc(doc(db, "pendingGyms", docRef.id), {
        ...baseGymData,
        id: docRef.id,
      });
  
      Alert.alert("Success", "Gym has been submitted for review.");
      router.replace("/(tabs)/map");
    } catch (e) {
      console.error("❌ Firestore write failed:", e);
      Alert.alert("Error", "Failed to save the submission.");
    }
  };
  
  const logoSource = formData.logo ? { uri: formData.logo } : fallbackLogo;


  return (
<KeyboardAwareFlatList
  data={[1]} // dummy item to trigger rendering
  keyExtractor={() => "form"}
  contentContainerStyle={styles.container}
  renderItem={() => (
    <>
      {[
        "name",
        "logo",
        "city",
        "state",
        "zip",
        "country",
        "email",
        "phone",
        "website",
      ].map((key) => (
        <View key={key}>
          <TextInput
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={String(formData[key as keyof typeof formData] || "")}
            onChangeText={(text) => handleChange(key, text)}
            style={[
              styles.input,
              validationErrors[key] ? styles.errorBorder : null,
            ]}
            placeholderTextColor="#999"
          />
          {validationErrors[key] ? (
            <Text style={styles.errorText}>{validationErrors[key]}</Text>
          ) : null}
        </View>
      ))}

      <Text style={styles.sectionHeader}>Open Mat Times</Text>
      <TimeBlockPicker blocks={openMatBlocks} setBlocks={setOpenMatBlocks} label={""} />

      <Text style={styles.sectionHeader}>Class Times</Text>
      <TimeBlockPicker blocks={classTimeBlocks} setBlocks={setClassTimeBlocks} label={""} />

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
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;

                setFormData((prev) => ({
                  ...prev,
                  latitude,
                  longitude,
                }));

                updateAddressFromCoords(latitude, longitude);
              }}
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
          Object.values(validationErrors).some(Boolean) && {
            backgroundColor: "#aaa",
          },
        ]}
        onPress={handleSubmit}
        disabled={Object.values(validationErrors).some(Boolean)}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/(tabs)/map")}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </>
  )}
/>

)}

const styles = StyleSheet.create({
  container: { 
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 12,
    width: 95
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  
});


// import { View, Text } from "react-native";

// export default function SubmitScreen() {
//   return (
//     <View>
//       <Text>Submit screen works!</Text>
//     </View>
//   );
// }
