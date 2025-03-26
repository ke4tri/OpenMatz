import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapScreen() {
  useEffect(() => {
    console.log("✅ Map Screen is Rendering!");
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 36.1627, // Nashville-ish
          longitude: -86.7816,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude: 36.1627, longitude: -86.7816 }}
          title={"BJJ Gym"}
          description={"Open Mat location"}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
