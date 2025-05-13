// app/(tabs)/map.tsx
import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Region } from "react-native-maps";
import GymMarker from "../../components/GymMarker";
import rawGyms from "../../assets/gyms.json";

const LOGO_ZOOM_CUTOFF = 0.2;

// ✅ Custom marker type just for controlling the callout
type MarkerRef = {
  hideCallout: () => void;
};

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 36.1627,
    longitude: -86.7816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const markerRefs = useRef<{ [key: string]: MarkerRef | null }>({});
  const gyms = useMemo(() => rawGyms.filter((g) => g.approved), []);

  // #1: only update region at end of gesture
  const onRegionChangeComplete = useCallback((r: Region) => {
    setRegion(r);
  }, []);

  // decide whether to show logos (true) or blue dots (false)
  const showLogos = region.longitudeDelta < LOGO_ZOOM_CUTOFF;

  // sizing logic stays the same
  const markerSize = useMemo(() => {
    const zoomRatio = 0.1 / region.latitudeDelta;
    const clamped = Math.min(Math.max(zoomRatio, 2.5), 8);
    const width = 60 * clamped;
    const height = width * 0.3;
    return { width, height };
  }, [region.latitudeDelta]);

  // #2: memoize your `<GymMarker />` list so React only rebuilds it
  const markers = useMemo(() => {
    return gyms.map((gym) => {
      const markerRefCallback = (ref: MarkerRef | null) => {
        markerRefs.current[gym.id] = ref;
      };

      return (
        <GymMarker
          key={`${gym.id}-${showLogos ? "logo" : "dot"}`}
          gym={gym}
          markerSize={markerSize}
          showLogo={showLogos}
          markerRef={markerRefCallback}
        />
      );
    });
  }, [gyms, markerSize, showLogos]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        onRegionChangeComplete={onRegionChangeComplete}
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
        {markers}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
