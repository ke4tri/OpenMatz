import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Text, Dimensions } from "react-native";
import MapView, { Region } from "react-native-maps";
import GymMarker from "../../components/GymMarker";
import { useRouter } from "expo-router";
import { useLocation } from "../../components/LocationContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Firebase/firebaseConfig";
import AnimatedClock from "../../components/AnimatedClock";

const screenWidth = Dimensions.get("window").width;

type MarkerRef = { hideCallout: () => void; showCallout: () => void };

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 36.1627,
    longitude: -86.7816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const [gyms, setGyms] = useState<any[]>([]);
  const markerRefs = useRef<{ [id: string]: MarkerRef | null }>({});
  const router = useRouter();
  const { location } = useLocation();

  const onRegionChangeComplete = useCallback((r: Region) => {
    setRegion(r);
  }, []);

  // Fetch gyms
  useEffect(() => {
    const fetchGyms = async () => {
      const snapshot = await getDocs(collection(db, "gyms"));
      const approvedGyms = snapshot.docs
        .map((doc) => doc.data())
        .filter((gym: any) => gym.approved);

      setGyms(approvedGyms);
    };

    fetchGyms();
  }, []);

  // Center map when location ready
  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
      console.log("✅ Map centered on user location");
    }
  }, [location]);

  const markers = useMemo(
    () =>
      gyms.map((gym) => {
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
      }),
    [gyms]
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {markers}
      </MapView>

      {/* Spinning Clock Logo */}
      <View style={styles.logoRow}>
        <Image source={require("../../assets/appLogo/Mat.png")} style={styles.textLogo} />
        <AnimatedClock />
        <Image source={require("../../assets/appLogo/Times.png")} style={styles.textLogo} />
      </View>

      {/* Floating Submit button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/screens/submit")}
      >
        <Text style={styles.floatingButtonText}>+ Submit a Gym</Text>
      </TouchableOpacity>
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
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: screenWidth * 0.20,  // Responsive vertical position
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
