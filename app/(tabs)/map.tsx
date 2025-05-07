import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import { Link } from "expo-router";
import rawGyms from "../../assets/gyms.json";

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      const newZoom = calculateZoomLevel(region.latitudeDelta);
      setZoomLevel(newZoom);
      console.log("🔁 Debounced Zoom Level:", newZoom);
    }, 100); // Debounce delay (100ms)
  
    return () => clearTimeout(timeout);
  }, [region.latitudeDelta]);
  

  const calculateZoomLevel = (latitudeDelta: number) => {
    const zoom = Math.round(Math.log(360 / latitudeDelta) / Math.LN2);
    return Math.max(1, Math.min(zoom, 20));
  };

  const getMarkerSize = () => {
    // The smaller the delta, the more zoomed in we are.
    const zoomRatio = 0.1 / region.latitudeDelta; // base it around your default (0.1)
    const clamped = Math.min(Math.max(zoomRatio, 2.5), 8); // keep it within sane range
  
    const width = 60 * clamped;
    const height = width * 0.3;
  
    return { width, height };
  };

  const gyms = rawGyms.filter((g) => g.approved);
  const logoCutoffZoom = 10; // tweak this value until it feels right


  return (
    <View style={styles.container}>
      <Link href="/drawer/map" asChild></Link>

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        onRegionChangeComplete={(newRegion) => {
          setRegion(newRegion);
          // const newZoom = calculateZoomLevel(newRegion.latitudeDelta);
          // setZoomLevel(newZoom);
          // console.log("🔍 Zoom level:", newZoom);
        }}
      >
          {gyms.map((gym) => {
            const logoSource =
              gym.approved && gym.logo
                ? { uri: gym.logo }
                : require("../../assets/fallbacks/BJJ_White_Belt.svg.png");

                  const markerSize = getMarkerSize();

                  return (
                    <Marker
                    key={`${gym.id}-${zoomLevel >= logoCutoffZoom ? 'logo' : 'dot'}`}
                      coordinate={{
                        latitude: gym.latitude,
                        longitude: gym.longitude,
                      }}
                      title={gym.name}
                    >
                      {/* Make sure there's always a valid child */}
                      {zoomLevel >= logoCutoffZoom ? (
                        <Image
                          source={logoSource}
                          style={[styles.markerImage, markerSize]}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.dotMarker} />
                      )}


                      <Callout>
                        <View style={styles.calloutContainer}>
                          <Text style={styles.gymName}>{gym.name}</Text>
                          {gym.openMatTimes?.map((time, index) => (
                            <Text key={index} style={styles.gymTime}>
                              {time}
                            </Text>
                          ))}
                        </View>
                      </Callout>
                    </Marker>
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

  // 🔵 Add this here 👇
  dotMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "white",
  },  
});

