// app/(tabs)/map.tsx
import React, { useState, useRef, useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Region } from "react-native-maps";
import GymMarker from "../../components/GymMarker";
import rawGyms from "../../assets/gyms.json";

// Ref for controlling callouts
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

  // update region only when user finishes interacting
  const onRegionChangeComplete = useCallback((r: Region) => {
    setRegion(r);
  }, []);

  // build markers with stable keys
  const markers = useMemo(
    () =>
      gyms.map((gym) => {
        const refCb = (ref: MarkerRef | null) => {
          markerRefs.current[gym.id] = ref;
        };
        const handlePress = () => {
          // hide all callouts then show this one
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
export const options = {
  tabBarStyle: { display: 'none' },
};