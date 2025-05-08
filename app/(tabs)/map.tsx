import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import { Link } from "expo-router";
import rawGyms from "../../assets/gyms.json";
import GymMarker from "../../components/GymMarker";


const fallbackImages = [
  require("../../assets/fallbacks/BlackBelt.png"),
  require("../../assets/fallbacks/BrownBelt.png"),
  require("../../assets/fallbacks/coral.png"),
  require("../../assets/fallbacks/BJJ_White_Belt.svg.png"),
  require("../../assets/fallbacks/WhiteBelt.png"),
];

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 36.1627,
    longitude: -86.7816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const [zoomLevel, setZoomLevel] = useState(10);
  const markerRefs = useRef<{ [key: string]: Marker | null }>({});

  const calculateZoomLevel = (latitudeDelta: number) => {
    const zoom = Math.round(Math.log(360 / latitudeDelta) / Math.LN2);
    return Math.max(1, Math.min(zoom, 20));
  };

  const getMarkerSize = () => {
    const zoomRatio = 0.1 / region.latitudeDelta;
    const clamped = Math.min(Math.max(zoomRatio, 2.5), 8);
    const width = 60 * clamped;
    const height = width * 0.3;
    return { width, height };
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const newZoom = calculateZoomLevel(region.latitudeDelta);
      setZoomLevel(newZoom);
      console.log("🔁 Debounced Zoom Level:", newZoom);
    }, 100);

    return () => clearTimeout(timeout);
  }, [region.latitudeDelta]);

  const gyms = rawGyms.filter((g) => g.approved);
  const logoCutoffZoom = 10;

  return (
    <View style={styles.container}>
      <Link href="/drawer/map" asChild></Link>

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onPress={() => {
          Object.values(markerRefs.current).forEach((ref) => {
            try {
              ref?.hideCallout();
            } catch (e) {
              console.warn("Failed to hide callout", e);
            }
          });
        }}
      >
        {gyms.map((gym) => {
          const logoSource =
            gym.approved && gym.logo
              ? { uri: gym.logo }
              : require("../../assets/fallbacks/BJJ_White_Belt.svg.png");

          const markerSize = getMarkerSize();

          return (
<GymMarker
  key={gym.id}
  gym={gym}
  logoSource={logoSource}
  markerSize={markerSize}
  zoomLevel={zoomLevel}
  logoCutoffZoom={logoCutoffZoom}
  markerRef={(ref) => {
    markerRefs.current[gym.id] = ref;
  }}
/>

          );
        })}
      </MapView>
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
  markerImage: {
    width: 60,
    height: 20,
    resizeMode: "contain",
  },
  calloutContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    minWidth: 200,
    maxWidth: 250,
  },
  gymName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  gymTime: {
    fontSize: 14,
  },
  hamburger: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  hamburgerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  dotMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "white",
  },
});