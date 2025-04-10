import React, { useState } from "react";
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

  const calculateZoomLevel = (latitudeDelta: number) => {
    const zoom = Math.round(Math.log(360 / latitudeDelta) / Math.LN2);
    return Math.max(1, Math.min(zoom, 20));
  };

  const getMarkerSize = () => {
    if (zoomLevel >= 15) return { width: 75, height: 125 };
    if (zoomLevel >= 12) return { width: 75, height: 125 };
    return { width: 100, height: 200 };
  };

  const gyms = rawGyms.filter((g) => g.approved);

  return (
    <View style={styles.container}>
      <Link href="/drawer/map" asChild></Link>

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        onRegionChangeComplete={(newRegion) => {
          setRegion(newRegion);
          setZoomLevel(calculateZoomLevel(newRegion.latitudeDelta));
        }}
      >
        {gyms.map((gym) => {
          const isFallback = !gym.logo;
          const logoSource = isFallback
            ? fallbackImages[4]
            : { uri: gym.logo };

          const markerSize = getMarkerSize();

          return (
            <Marker
              key={gym.id}
              coordinate={{ latitude: gym.latitude, longitude: gym.longitude }}
              title={gym.name}
            >
              <Image
                source={logoSource}
                style={markerSize}
                resizeMode="contain"
              />
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.gymName}>{gym.name}</Text>
                  {gym.openMatTimes &&
                    gym.openMatTimes.map((time, index) => (
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
