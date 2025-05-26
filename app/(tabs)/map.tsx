import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Text, Alert } from "react-native";
import MapView, { Region } from "react-native-maps";
import GymMarker from "../../components/GymMarker";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";
import type {Gym} from "../../types"
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Firebase/firebaseConfig";

console.log("🔐 Firebase Project ID:", Constants.expoConfig?.extra?.firebaseProjectId);

type MarkerRef = { hideCallout: () => void; showCallout: () => void };

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 36.1627,
    longitude: -86.7816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const [gyms, setGyms] = useState<Gym[]>([]);

  const markerRefs = useRef<{ [id: string]: MarkerRef | null }>({});
  const router = useRouter();

  const pendingGymsPath = FileSystem.documentDirectory + "pending_gyms.json";

  const onRegionChangeComplete = useCallback((r: Region) => {
    setRegion(r);
  }, []);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const snapshot = await getDocs(collection(db, "gyms"));
        const approvedGyms = snapshot.docs
          .map((doc) => doc.data() as Gym)
          .filter((gym) => gym.approved);
  
        setGyms(approvedGyms);
  
        // 👇 Tiny region adjustment to force re-render
        setRegion((prev) => ({
          ...prev,
          latitudeDelta: prev.latitudeDelta + 0.0001,
        }));
  
        setTimeout(() => {
          setRegion((prev) => ({
            ...prev,
            latitudeDelta: prev.latitudeDelta - 0.0001,
          }));
        }, 50);
      } catch (err) {
        console.error("❌ Failed to fetch gyms from Firestore:", err);
      }
    };
  
    fetchGyms();
  }, []);
  

  const markers = useMemo(
    () =>
      gyms
        .map((gym) => {
          if (typeof gym !== "object" || !gym.latitude || !gym.longitude) {
            console.error("🚨 Invalid gym data:", gym);
            return null;
          }

          const refCb = (ref: MarkerRef | null) => {
            markerRefs.current[gym.id] = ref;
          };

          const handlePress = () => {
            Object.values(markerRefs.current).forEach((r) => r?.hideCallout());
            markerRefs.current[gym.id]?.showCallout();
          };

          return (
            <GymMarker
              key={gym.id}
              gym={gym}
              markerRef={refCb}
              onPress={handlePress}
            />
          );
        })
        .filter(Boolean),
    [gyms]
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {markers}
      </MapView>

      {/* Floating Logo - unchanged from your working version */}
      <View style={styles.logoWrapper}>
        <Image
          source={require("../../assets/appLogo/OpenMats_Color.png")}
          style={styles.logo}
        />
      </View>

      {/* Floating Submit Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/screens/submit")}
      >
        <Text style={styles.floatingButtonText}>+ Submit a Gym</Text>
      </TouchableOpacity>

      {/* View Pending / Clear (optional) */}
      {/* 
      <TouchableOpacity
        style={[styles.floatingButton, { bottom: 90, backgroundColor: "#4CAF50" }]}
        onPress={() => router.push("/view-pending")}
      >
        <Text style={styles.floatingButtonText}>View Pending</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: "red", bottom: 150 }]}
        onPress={async () => {
          await FileSystem.writeAsStringAsync(pendingGymsPath, "[]");
          Alert.alert("Cleared", "pending_gyms.json has been emptied.");
        }}
      >
        <Text style={styles.floatingButtonText}>Clear Pending Gyms</Text>
      </TouchableOpacity>
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  logoWrapper: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  logo: {
    width: 640,
    height: 160,
    resizeMode: "contain",
  },
  floatingButtonsWrapper: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "flex-end",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    elevation: 5,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
