import React, { useState, useRef, useMemo, useCallback } from "react";
import { View, StyleSheet, Image } from "react-native";
import MapView, { Region } from "react-native-maps";
import GymMarker from "../../components/GymMarker";
import rawGyms from "../../assets/gyms.json";

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

      {/* Floating Logo */}
      <View style={styles.logoWrapper}>
        <Image
          source={require("../../assets/appLogo/OpenMatz.png")}
          style={styles.logo}
        />
      </View>
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
});
