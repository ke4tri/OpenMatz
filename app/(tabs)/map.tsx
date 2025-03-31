// File: app/(tabs)/map.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { Link } from "expo-router";
import rawGyms from "../../assets/gyms.json";

const fallbackImages = [
  require("../../assets/fallbacks/BlackBelt.png"),
  require("../../assets/fallbacks/BrownBelt.png"),
  require("../../assets/fallbacks/coral.png")
];

export default function MapScreen() {
  const [region, setRegion] = useState({
    latitude: 36.1627,
    longitude: -86.7816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    console.log("✅ Map Screen is Rendering!");
  }, []);

  return (
    <View style={styles.container}>
<Link href="/drawer/map" asChild>
  {/* <TouchableOpacity style={styles.hamburger}>
    <Text style={styles.hamburgerText}>☰</Text>
  </TouchableOpacity> */}
</Link>

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
      >
        {rawGyms.map((gym) => {
          const logoSource = gym.logo
            ? { uri: gym.logo }
            : fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

          return (
            <Marker
              key={gym.id}
              coordinate={{ latitude: gym.latitude, longitude: gym.longitude }}
              title={gym.name}
            >
              <Image
                source={logoSource}
                style={gym.logo ? styles.markerImage : styles.fallbackImage}
                resizeMode="contain"
              />
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.gymName}>{gym.name}</Text>
                  {gym.openMatTimes && gym.openMatTimes.map((time, index) => (
                    <Text key={index} style={styles.gymTime}>{time}</Text>
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
    width: 100,
    height: 30,
    borderRadius: 15,
  },
  fallbackImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
});