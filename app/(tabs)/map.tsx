import React, { useState, useRef, useMemo, useCallback } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Text } from "react-native";
import MapView, { Region } from "react-native-maps";
import GymMarker from "../../components/GymMarker";
import rawGyms from "../../assets/gyms.json";
import { useRouter } from "expo-router"; // ✅ add router for navigation

type MarkerRef = { hideCallout: () => void; showCallout: () => void };

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 36.1627,
    longitude: -86.7816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const markerRefs = useRef<{ [id: string]: MarkerRef | null }>({});
  const gyms = useMemo(() => rawGyms.filter((g) => g.approved), []);
  const router = useRouter();

  const onRegionChangeComplete = useCallback((r: Region) => {
    setRegion(r);
  }, []);

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
        onPress={() => router.push("/drawer/submit")}
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
  logoWrapper: {
    position: "absolute",
    top: 40, // adjust as needed
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
