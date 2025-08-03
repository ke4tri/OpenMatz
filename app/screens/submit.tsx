import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  StatusBar,
  Image,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { doc, setDoc } from "firebase/firestore";
import Constants from "expo-constants";
import { db } from "../../Firebase/firebaseConfig";
import type { Gym } from "../../types";
import TimeBlockPicker, { TimeBlock } from "../../components/TimeBlockPicker";
import axios from "axios";

const SubmitScreen = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    latitude: 0,
    longitude: 0,
    email: "",
    phone: "",
    website: "",
    logo: "",
    submittedByName: "",
    membershipRequired: false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [openMatBlocks, setOpenMatBlocks] = useState<TimeBlock[]>([]);
  const [classTimeBlocks, setClassTimeBlocks] = useState<TimeBlock[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

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

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setIsLoadingLocation(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));

        const locationData = await fetchFromOpenCage(latitude, longitude);
        if (locationData) {
          setFormData((prev) => ({
            ...prev,
            city: locationData.city,
            state: locationData.state,
            zip: locationData.zip,
            country: locationData.country,
          }));
        }

        setIsLoadingLocation(false);
      } catch (err) {
        console.warn("Location error:", err);
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const id = Date.now().toString();
    const newGym: Gym = {
      ...formData,
      id,
      openMatTimes: openMatBlocks.map((b) => `${b.day}: ${b.startTime} - ${b.endTime}`),
      classTimes: classTimeBlocks.map((b) => `${b.day}: ${b.startTime} - ${b.endTime}`),
      submittedAt: new Date().toISOString(),
      submittedByIP: "local-dev",
      submittedBy: {
        name: formData.submittedByName,
        email: formData.email,
        phone: formData.phone,
      },
      approved: false,
    };

    try {
      await setDoc(doc(db, "pendingGyms", id), newGym);
      Alert.alert("Success", "Gym submitted for review.");
      router.replace("/(tabs)/map");
    } catch (err) {
      console.error("❌ Firestore write failed:", err);
      Alert.alert("Error", "Could not submit gym.");
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Submit a Gym</Text>
      {[
        "name",
        "city",
        "state",
        "zip",
        "country",
        "email",
        "phone",
        "website",
      ].map((key) => (
        <TextInput
          key={key}
          placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
          value={String(formData[key as keyof typeof formData] || "")}
          onChangeText={(text) => handleChange(key, text)}
          style={styles.input}
        />
      ))}

      <TimeBlockPicker blocks={openMatBlocks} setBlocks={setOpenMatBlocks} label="Open Mat Times" />
      <TimeBlockPicker blocks={classTimeBlocks} setBlocks={setClassTimeBlocks} label="Class Times" />

      <View style={{ marginVertical: 16, alignItems: "center" }}>
        <Text style={{ fontSize: 16, marginBottom: 6, textAlign: "center" }}>
          Membership Required?
        </Text>
        <Switch
          value={formData.membershipRequired}
          onValueChange={(val) =>
            setFormData((prev) => ({ ...prev, membershipRequired: val }))
          }
        />
      </View>

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
              coordinate={{ latitude: formData.latitude, longitude: formData.longitude }}
              onDragEnd={async (e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setFormData((prev) => ({ ...prev, latitude, longitude }));

                const locationData = await fetchFromOpenCage(latitude, longitude);
                if (locationData) {
                  setFormData((prev) => ({
                    ...prev,
                    city: locationData.city,
                    state: locationData.state,
                    zip: locationData.zip,
                    country: locationData.country,
                  }));
                }
              }}
            />
          </MapView>
          <Text style={{ textAlign: "center", marginTop: 4 }}>
            Hold the pin to adjust location
          </Text>
        </>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)/map")}> 
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8f8f8",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#aaa",
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  map: {
    height: 200,
    width: "100%",
    marginTop: 10,
  },
});

export default SubmitScreen;