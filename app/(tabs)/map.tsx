import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import rawGyms from "../../assets/gyms.json";

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
        {rawGyms.map((gym) => (
          <Marker
            key={gym.id}
            coordinate={{ latitude: gym.latitude, longitude: gym.longitude }}
            title={gym.name}
          >
            <Image
              source={{ uri: gym.logo }}
              style={styles.markerImage}
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
        ))}
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
