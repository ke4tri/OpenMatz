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
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../Firebase/firebaseConfig";
import * as Location from "expo-location";
import { currentTier } from "../constants/tiers";
import UpgradePrompt from "../components/UpgradePrompt";
import axios from "axios";
import Constants from "expo-constants";



//Proximity to Gym
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(meters: number): string {
  const feet = meters * 3.28084;
  if (feet < 1000) {
    return `${Math.round(feet)} feet`;
  } else {
    const miles = feet / 5280;
    return `${miles.toFixed(2)} miles`;
  }
}




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

const [formData, setFormData] = useState<{
  membershipRequired: boolean;
  id: string;
  name: string;
  city: string;
  state: string;
  logo: string;
  latitude: number;
  longitude: number;
  address: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  approved: boolean;
  pendingUpdate: boolean;
  updatedFromId: string;
  submittedByName: string;
  locationVerified: boolean;
  distanceFromGym: number | null;
}>(/* initial value below */ {
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
  submittedByName: "",
  locationVerified: false,
  distanceFromGym: null,
  membershipRequired: false,
});


  const [openMatBlocks, setOpenMatBlocks] = useState<TimeBlock[]>([]);
  const [classTimeBlocks, setClassTimeBlocks] = useState<TimeBlock[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
const [deleteReason, setDeleteReason] = useState("");
const [showDeleteReason, setShowDeleteReason] = useState(false);


  const fetchFromOpenCage = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          key: Constants.expoConfig?.extra?.opencageApiKey,
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

const handleSuggestDelete = async () => {
  try {
    const ip = await fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => data.ip)
      .catch(() => "unknown");

const deleteRequest = {
  isDeleteRequest: true,
  gymId: formData.id,
  name: formData.name,
  address: formData.address,
  submittedAt: new Date().toISOString(),
  submittedByIP: ip,
  submittedBy: {
    name: formData.submittedByName || "",
    email: formData.email || "",
    phone: formData.phone || "",
  },
  reason: deleteReason.trim(), // ✅ Here’s where you inject it
};


    await addDoc(collection(db, "deleteRequests"), deleteRequest);

    Alert.alert("Submitted", "Delete request has been sent.");
    router.replace("/(tabs)/map");
  } catch (err) {
    console.error("❌ Delete request failed:", err);
    Alert.alert("Error", "Could not submit delete request.");
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
  
useEffect(() => {
  if (params.existingGym) {
    try {
      const gym: Gym = JSON.parse(params.existingGym as string);

      // ✅ Load gym into form state
      setFormData((prev) => ({
        ...prev,
        ...gym,
        latitude: gym.latitude,
        longitude: gym.longitude,
        pendingUpdate: true,
        updatedFromId: gym.id,
        membershipRequired: gym.membershipRequired ?? false,
      }));

      // ✅ Parse open mat and class times if present
      if (Array.isArray(gym.openMatTimes)) {
        const parsedOM = gym.openMatTimes
          .filter(t => t !== "None Listed")
          .map(parseTimeBlock);
        setOpenMatBlocks(parsedOM);
      }
      if (Array.isArray(gym.classTimes)) {
        const parsedCT = gym.classTimes
          .filter(t => t !== "None Listed")
          .map(parseTimeBlock);
        setClassTimeBlocks(parsedCT);
      }

      // ✅ Fetch current location and compare distance to gym
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: 3 });
          const distance = getDistanceInMeters(
            loc.coords.latitude,
            loc.coords.longitude,
            gym.latitude,
            gym.longitude
          );

          setFormData((prev) => ({
            ...prev,
            locationVerified: distance < 400, // meters (~0.25 miles)
            distanceFromGym: Math.round(distance),
          }));
        } else {
          console.warn("Location permission not granted");
        }
      })();
    } catch (e) {
      console.warn("Failed to parse existingGym", e);
    }
  }
}, [params.existingGym]);


const parseTimeBlock = (entry: string): TimeBlock => {
  let day = "";
  let startTime = "";
  let endTime = "";
  let note = "";

  try {
    const hasDash = entry.includes("-");
    const isClosed = entry.toLowerCase().includes("closed");

    if (isClosed) {
      console.warn("❌ Closed day, skipping:", entry);
      return {
        day: entry.split(":")[0].trim() || "Unknown",
        startTime: "",
        endTime: "",
        note: "Closed",
      };
    }

    if (hasDash && entry.includes(":")) {
      // ✅ Colon format: split ONLY on the first colon
      const colonIndex = entry.indexOf(":");
      const dayRaw = entry.slice(0, colonIndex).trim();
      const rest = entry.slice(colonIndex + 1).trim();

      const [timeRange, notePart] = rest.split("(");
      const [start, end] = timeRange.split("-").map(s => s.trim());

      day = dayRaw;
      startTime = start;
      endTime = end;
      note = notePart?.replace(")", "").trim() || "";

    } else if (hasDash) {
      // ✅ Fallback space format
      const match = entry.match(/^(\w+)\s+([0-9:APMapm]+)\s*-\s*([0-9:APMapm]+)/);
      if (match) {
        day = match[1].trim();
        startTime = match[2].trim();
        endTime = match[3].trim();
        note = "";
      }
    } else {
      console.warn("❌ Unrecognized open mat time format:", entry);
    }
  } catch (e) {
    console.warn("🚨 Failed to parse time block:", entry, e);
  }

  return {
    day,
    startTime,
    endTime,
    note,
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

  // const saveToPendingJson = async (newGym: Gym) => {
  //   try {
  //     const existingData = await FileSystem.readAsStringAsync(pendingGymsPath).catch(() => "[]");
  //     const parsed = JSON.parse(existingData);
  //     parsed.push(newGym);
  //     await FileSystem.writeAsStringAsync(pendingGymsPath, JSON.stringify(parsed, null, 2));
  //   } catch (e) {
  //     console.error("Failed to save to pending gyms:", e);
  //     Alert.alert("Error", "Failed to save the submission.");
  //   }
  // };

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

const handleSubmit = async () => {
  try {
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

    const openMatTimes = openMatBlocks
      .filter(b => b.day && b.startTime && b.endTime)
      .map(b =>
        `${b.day}: ${b.startTime} - ${b.endTime}${b.note ? ` (${b.note})` : ""}`
      );

    const classTimes = classTimeBlocks
      .filter(b => b.day && b.startTime && b.endTime)
      .map(b =>
        `${b.day}: ${b.startTime} - ${b.endTime}${b.note ? ` (${b.note})` : ""}`
      );

    const ip = await fetchIP();

    const newGym: Gym = {
      ...formData,
      openMatTimes,
      classTimes,
      latitude: parseFloat(formData.latitude as any),
      longitude: parseFloat(formData.longitude as any),
      approved: false,
      submittedAt: new Date().toISOString(),
      submittedByIP: ip,
      submittedBy: {
        name: formData.submittedByName || "",
        email: formData.email,
        phone: formData.phone,
      },
      locationVerified: formData.locationVerified,
      distanceFromGym: formData.distanceFromGym,
      membershipRequired: formData.membershipRequired ?? false,
    };

    console.log("🟡 Attempting to write to Firestore...");
console.log("🧪 newGym.id:", newGym.id);
console.log("📦 Data:", {
  ...newGym,
  updatedAt: new Date().toISOString()
});

try {
  await setDoc(doc(db, "pendingGyms", newGym.id), {
    ...newGym,
    updatedAt: new Date().toISOString(),
  });
  console.log("✅ Firestore write successful.");
} catch (err) {
  console.error("❌ Firestore write failed:", err);
  Alert.alert("Error", "Could not save to Firestore.");
  return;
}


    // await setDoc(doc(db, "pendingGyms", newGym.id), {
    //   ...newGym,
    //   updatedAt: new Date().toISOString(),
    // });

    Alert.alert("Submitted", "Your update has been submitted for review.");
    router.replace("/(tabs)/map");

  } catch (err) {
    console.error("❌ Unexpected error in handleSubmit:", err);
    Alert.alert("Unexpected Error", "Something went wrong. Please try again.");
  }
};

  const logoSource = formData.logo ? { uri: formData.logo } : fallbackLogo;

  //Uncomment the below inorder to lock feature
  // if (currentTier === "free") {
  //   return <UpgradePrompt onBack={() => router.back()} />;
  // }
  
  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.logoWrapper}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        {!formData.logo && (
          <Text style={styles.logoText}>Logo Upload Coming Soon!</Text>
        )}
      </View>


      {["name", "city", "state", "country", "email", "phone", "website"].map((key) => (
        <View key={key}>
          <TextInput
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={String(formData[key as keyof typeof formData] || "")}
            onChangeText={(text) => handleChange(key, text)}
            placeholderTextColor="#000" // ← Add this line
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

      <TimeBlockPicker
        label="Class Times"
        blocks={classTimeBlocks}
        setBlocks={setClassTimeBlocks}
      />

     {formData.distanceFromGym !== null && (
  <Text style={{
    textAlign: "center",
    marginVertical: 6,
    fontWeight: "600",
    color: formData.locationVerified ? "green" : "orange"
  }}>
    {formData.locationVerified
      ? `✅ Location Verified (${formatDistance(formData.distanceFromGym)})`
      : `⚠️ You are ${formatDistance(formData.distanceFromGym)} from the gym.\nYour update can still be submitted, but for faster vetting times, please submit from the gym location.`}
  </Text>
)}


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


<TouchableOpacity
  style={[styles.submitButton, { backgroundColor: "tomato" }]}
  onPress={() => setShowDeleteReason(true)}
>
  <Text style={styles.submitButtonText}>Suggest Delete</Text>
</TouchableOpacity>

{showDeleteReason && (
  <View style={{ marginTop: 16 }}>
    <Text style={styles.sectionHeader}>Why should this gym be deleted?</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter reason..."
      value={deleteReason}
      onChangeText={setDeleteReason}
      multiline
    />
    <TouchableOpacity
      style={[styles.submitButton, { backgroundColor: "red" }]}
      onPress={handleSuggestDelete}
    >
      <Text style={styles.submitButtonText}>Delete</Text>
    </TouchableOpacity>
  </View>
)}




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
    width: 120
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
    width: 120
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
  fontSize: 18,
  fontWeight: "bold",
  marginTop: 20,
  marginBottom: 10,
  color: "#333",
},

  map: {
    height: 200,
    width: "100%",
    marginTop: 10,
    marginBottom: 5,
  },
});

export default UpdateGymScreen;
