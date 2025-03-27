import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
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
      <MapView style={styles.map} initialRegion={region}>
        {rawGyms.map((gym) => {
          const logoSource = gym.logo
            ? { uri: gym.logo }
            : fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

          const isFallback = !gym.logo;

          return (
            <Marker
              key={gym.id}
              coordinate={{ latitude: gym.latitude, longitude: gym.longitude }}
              title={gym.name}
            >
              <Image
                source={logoSource}
                style={isFallback ? styles.fallbackImage : styles.markerImage}
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
    width: 150,
    height: 40,
    borderRadius: 20,
  },
  fallbackImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
});