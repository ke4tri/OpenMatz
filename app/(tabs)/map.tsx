import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Text, Dimensions, TouchableWithoutFeedback } from "react-native";
import MapView, { Region } from "react-native-maps";
import GymMarker from "../../components/GymMarker";
import { useRouter } from "expo-router";
import { useLocation } from "../../components/LocationContext";
import {  query, where, getDocs, collection } from "firebase/firestore";
import { db } from "../../Firebase/firebaseConfig";
import AnimatedClock from "../../components/AnimatedClock";

const screenWidth = Dimensions.get("window").width;

const LogoRow = () => {
  const router = useRouter();

  return (
    <TouchableWithoutFeedback onPress={() => router.push("/screens/future-release")}>
      <View style={styles.logoRow}>
        <Text style={styles.logoText}>Mat</Text>
        <AnimatedClock />
        <Text style={styles.logoText}>Times</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};




type MarkerRef = { hideCallout: () => void; showCallout: () => void };

export default function MapScreen() {
  try {
    // console.log("🚀 MapScreen rendering...");

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
      // console.log("🗺️ Region changed:", r);
      setRegion(r);
    }, []);

    const mapRef = useRef<MapView | null>(null);
 const [mapKey, setMapKey] = useState(0);
const [initialLoaded, setInitialLoaded] = useState(false);


    // Fetch gyms
useEffect(() => {
 

  const fetchGyms = async () => {
    try {
      const snapshot = await getDocs(collection(db, "gyms"));
      const approvedGyms = snapshot.docs
        .map((doc) => doc.data())
        .filter((gym: any) => gym.approved);

      setGyms(approvedGyms);
      setGyms(approvedGyms);
setMapKey((prev) => prev + 1); // ⬅️ triggers MapView remount


      // ✅ Force a visual update
      setRegion((prev) => ({
        ...prev,
        latitude: prev.latitude + 0.00001,
      }));
    } catch (error) {
      console.error("❌ Failed to fetch gyms:", error);
    }
  };

  fetchGyms();
}, []);




    // Center map when location ready
useEffect(() => {
  if (location && !initialLoaded) {
    const nudgeRegion = {
      latitude: location.latitude + 0.00001,
      longitude: location.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };

    setRegion(nudgeRegion);
    setMapKey((prev) => prev + 1); // Force MapView re-render
    setInitialLoaded(true);
  }
}, [location, initialLoaded]);


    const markers = useMemo(
      () =>
        gyms.map((gym) => {
          try {
            const refCb = (ref: MarkerRef | null) => {
              markerRefs.current[gym.id] = ref;
            };
            const handlePress = () => {
              Object.values(markerRefs.current).forEach((r) => r?.hideCallout());
              markerRefs.current[gym.id]?.showCallout();
            };

            // console.log("📌 Creating marker for:", gym.name, gym.latitude, gym.longitude);

            return (
              <GymMarker
                key={gym.id}
                gym={gym}
                markerRef={refCb}
                onPress={handlePress}
              />
            );
          } catch (markerErr) {
            console.error("❌ Error rendering marker:", gym, markerErr);
            return null;
          }
        }),
      [gyms]
    );

    return (
      <View style={styles.container}>
{initialLoaded && (
  <MapView
    key={mapKey}
    ref={mapRef}
    style={styles.map}
    initialRegion={region}
    showsUserLocation
    onRegionChangeComplete={onRegionChangeComplete}
  >
    {markers}
  </MapView>
)}


        {/* Spinning Clock Logo 
<Pressable onPress={() => router.push("/screens/future-release")}>
  <View style={styles.logoRow}>
    <Text style={styles.logoText}>Mat</Text>
    <AnimatedClock />
    <Text style={styles.logoText}>Times</Text>
  </View>
</Pressable>
*/}

<LogoRow />

        {/* Color Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: "blue" }]} />
            <Text style={styles.legendText}>Approved Gym</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: "orange" }]} />
            <Text style={styles.legendText}>Restrictions/Call</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: "red" }]} />
            <Text style={styles.legendText}>Unverified</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => {
            console.log("🧭 Navigating to /screens/submit");
            router.push("/screens/submit");
          }}
        >
          <Text style={styles.floatingButtonText}>+ Submit a Gym</Text>
        </TouchableOpacity>
      </View>
    );
  } catch (err) {
    console.error("🔥 MapScreen crashed during render:", err);
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>MapScreen crashed: {String(err)}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  legendContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    padding: 6,
    borderRadius: 8,
  },
  logoText: {
  fontSize: screenWidth * 0.1, // increased from 0.08 to 0.1
  fontWeight: "bold",
  color: "#000",
  marginHorizontal: 4, // tighter spacing around clock
  fontFamily: "helvetica", // or custom font
},

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: "black",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  logoRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  top: screenWidth * 0.20,
  left: 0,
  right: 0,
  zIndex: 999,
  paddingHorizontal: 10, // less horizontal space
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
