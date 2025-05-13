// components/GymMarker.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Marker, Callout } from "react-native-maps";
import { useRouter } from "expo-router";
import type { Gym } from "../app/types";

type Props = {
  gym: Gym;
  markerRef?: (ref: any) => void;
  onPress?: () => void;
};

const GymMarker: React.FC<Props> = React.memo(({ gym, markerRef, onPress }) => {
  const router = useRouter();

  return (
    <Marker
      ref={markerRef}
      coordinate={{ latitude: gym.latitude, longitude: gym.longitude }}
      onPress={onPress}
      pinColor="blue"
    >
      {/* Always render blue dot */}
      <View style={styles.dotMarker} />

      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <Text style={styles.gymName}>{gym.name}</Text>
          {gym.openMatTimes?.map((time, idx) => (
            <Text key={idx} style={styles.gymTime}>
              {time}
            </Text>
          ))}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/add-gym",
                params: { existingGym: JSON.stringify(gym) },
              })
            }
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>📝 Edit Info</Text>
          </Pressable>
        </View>
      </Callout>
    </Marker>
  );
});

export default GymMarker;

const styles = StyleSheet.create({
  dotMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "blue",
    borderWidth: 1,
    borderColor: "white",
  },
  calloutContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
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
  editButton: {
    marginTop: 10,
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  editButtonText: {
    fontWeight: "500",
    fontSize: 14,
  },
});
