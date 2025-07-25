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
  Platform,
  StatusBar,
  Switch
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import uuid from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";


//FIREBASE
import { signInAnonymously } from "firebase/auth";
// import { auth } from "../../Firebase/firebaseConfig"; // adjust path if needed
import { collection, addDoc,setDoc, doc } from "firebase/firestore";
import { db } from "../../Firebase/firebaseConfig";
import { currentTier } from "../../constants/tiers"; // 🔐 your tier system
import UpgradePrompt from "../../components/UpgradePrompt"; // 🛑 fallback prompt
import { storage } from "../../Firebase/firebaseConfig";

const OPENCAGE_API_KEY = Constants.expoConfig?.extra?.opencageApiKey;

const shadyEmailDomains = ["tempmail", "yopmail", "mailinator", "dispostable"];
const fallbackLogo = require("../../assets/fallbacks/BJJ_White_Belt.svg.png");
const pendingGymsPath = FileSystem.documentDirectory + "pending_gyms.json";

const validateEmail = (email: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
  !shadyEmailDomains.some((d) => email.toLowerCase().includes(d));

const validatePhone = (phone: string) =>
  /^\+?[0-9\s\-().]{7,}$/.test(phone.replace(/\D/g, ""));

// 🧠 Add this somewhere in your file (before you call it)

const uploadImage = async (fileUri: string): Promise<string> => {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
  const id = uuid.v4() as string;
  const fileRef = ref(storage, `logos/${id}.png`);

  console.log("🚀 Uploading to:", fileRef.fullPath);

  await uploadBytes(fileRef, bytes);
  const downloadURL = await getDownloadURL(fileRef);

  console.log("🌐 Firebase URL:", downloadURL);

  return downloadURL;
};


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
    submittedByName: "",  // ✅ add this
    membershipRequired: false,
  });
  
  
  

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [openMatBlocks, setOpenMatBlocks] = useState<TimeBlock[]>([]);
  const [classTimeBlocks, setClassTimeBlocks] = useState<TimeBlock[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);


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

    const handleImagePick = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    alert("Permission to access media library is required!");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.5,
    allowsEditing: true,
    aspect: [4, 3],
    base64: false,
  });

  console.log("📸 Picker result:", result);

  if (!result.canceled && result.assets.length > 0) {
    const image = result.assets[0];
    const fileUri = image.uri;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      alert("File not found.");
      return;
    }

    if (fileInfo.size && fileInfo.size > 300 * 1024) {
      alert("Please choose an image under 300KB.");
      return;
    }

    try {
      const downloadURL = await uploadImage(fileUri);

      setFormData((prev) => ({
        ...prev,
        logo: downloadURL,
      }));

      console.log("🖼️ Logo URL saved:", downloadURL);
      setUploadSuccess(true);
      alert("✅ Logo uploaded successfully.");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Upload failed. Check logs.");
    }
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

  let logoUrl = formData.logo;

  // Upload image if it's a local file URI
  if (formData.logo.startsWith("file://")) {
    try {
      logoUrl = await uploadImage(formData.logo);
    } catch (e) {
      console.error("❌ Image upload failed:", e);
      Alert.alert("Error", "Failed to upload logo.");
      return;
    }
  }

  const newGym: Gym = {
    ...formData,
    id: Date.now().toString(),
    address: formData.address,
    latitude: formData.latitude,
    longitude: formData.longitude,
    logo: logoUrl,
    openMatTimes,
    classTimes,
    submittedAt: new Date().toISOString(),
    submittedByIP: ip,
    submittedBy: {
      name: formData.submittedByName,
      email: formData.email,
      phone: formData.phone,
    },
    approved: false,
  };

  try {
    const existing = await AsyncStorage.getItem("customGyms");
    const parsed = existing ? JSON.parse(existing) : [];
    parsed.push(newGym);
    await AsyncStorage.setItem("customGyms", JSON.stringify(parsed));

    Alert.alert("Success", "Gym has been submitted for review.");
    router.replace("/(tabs)/map");
  } catch (err) {
    console.error("❌ Failed to save gym:", err);
    Alert.alert("Error", "Could not save your gym submission.");
  }
};


  const logoSource = formData.logo ? { uri: formData.logo } : fallbackLogo;
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

return (
  <>
    <StatusBar barStyle="dark-content" />
    <KeyboardAwareFlatList
      data={[1]} // dummy item to trigger rendering
      keyExtractor={() => "form"}
      contentContainerStyle={[styles.container, { backgroundColor: "#f8f8f8" }]}
      renderItem={() => (
        <>
{["name", "city", "state", "zip", "country", "email", "phone", "website"].map((key) => (
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

{/* 🖼️ Upload Button + Preview */}
<View style={{ marginBottom: 20, alignItems: "center" }}>
  <TouchableOpacity
    style={{
      backgroundColor: "#007AFF",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    }}
    onPress={handleImagePick}
  >
    <Text style={{ color: "white", fontWeight: "600" }}>Upload Gym Logo</Text>
  </TouchableOpacity>

  {formData.logo ? (
    <>
      <Text style={{ color: "green", marginBottom: 6 }}>✅ Logo uploaded!</Text>
      <Image
        source={{ uri: formData.logo }}
        style={{
          width: 120,
          height: 60,
          resizeMode: "contain",
          borderRadius: 6,
          backgroundColor: "#eee",
        }}
      />
      <TouchableOpacity
        onPress={() => {
          setFormData((prev) => ({ ...prev, logo: "" }));
          setUploadSuccess(false);
        }}
      >
        <Text style={{ color: "#007AFF", marginTop: 4 }}>Remove Image</Text>
      </TouchableOpacity>
    </>
  ) : uploadSuccess ? (
    <Text style={{ color: "red" }}>⚠️ Upload failed or missing URL</Text>
  ) : null}
</View>


          <Text style={styles.sectionHeader}>Open Mat Times</Text>
          <TimeBlockPicker blocks={openMatBlocks} setBlocks={setOpenMatBlocks} label={""} />

          <View style={{ marginVertical: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 16, marginBottom: 6, textAlign: "center" }}>
              Membership Required for Drop Ins and Open Mat?
            </Text>
            <Switch
              value={formData.membershipRequired}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, membershipRequired: val }))
              }
            />
          </View>

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
  </>
);

}