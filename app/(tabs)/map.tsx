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
import AnimatedClock from "../../components/AnimatedClock"; // adjust path if needed
import HeaderLogo from "../../components/HeaderLogo"; // adjust path if needed
import { Dimensions } from "react-native";

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
  const mapRef = useRef<MapView>(null);
 
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
            // Object.values(markerRefs.current).forEach((r) => r?.hideCallout());
            // markerRefs.current[gym.id]?.showCallout();
            const offsetLat = region.latitudeDelta / 4; // Adjust this to your screen's aspect ratio
            mapRef.current?.animateToRegion({
              latitude: gym.latitude + offsetLat,
              longitude: gym.longitude,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            });
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
    {/* Spinning Clock Logo */}
    <View style={styles.logoRow}>
      <Image source={require("../../assets/appLogo/Mat.png")} style={styles.textLogo} />
      <AnimatedClock />
      <Image source={require("../../assets/appLogo/Times.png")} style={styles.textLogo} />
    </View>

    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={region}
      showsUserLocation
      onRegionChangeComplete={onRegionChangeComplete}
    >
      {markers}
    </MapView>
  
    {/* Floating Static Logo */}
    {/* <View style={styles.logoWrapper}>
      <Image
        source={require("../../assets/appLogo/MatTime Logo Final.png")}
        style={styles.logo}
      />
    </View> */}
  
    {/* Floating Submit Button */}
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => router.push("/screens/submit")}
    >
      <Text style={styles.floatingButtonText}>+ Submit a Gym</Text>
    </TouchableOpacity>
  </View>
  );
}
const screenWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  headerLogoWrapper: {
    position: "absolute",
    top: 40,  // adjust based on how far from the top you want it
    alignSelf: "center", // centers horizontally
    zIndex: 10, // makes sure it’s above the map
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: screenWidth * 0.20, // Responsive vertical position of the logo on map
    left: 0,
    right: 0,
    zIndex: 999,
    paddingHorizontal: 20,
  },
  
  textLogo: {
    width: screenWidth * 0.25,
    height: screenWidth * 0.1,
    resizeMode: "contain",
    marginHorizontal: 8,
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
    width: 940,
    height: 235,
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
  clockWrapper: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    zIndex: 999, // Ensure it's above the map
  },
});
