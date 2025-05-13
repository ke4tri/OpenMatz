// components/GymMarker.tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { Marker, Callout } from "react-native-maps";
import { useRouter } from "expo-router";
import type { Gym } from "../app/types";

type Props = {
  gym: Gym;
  markerSize: { width: number; height: number };
  showLogo: boolean;
  markerRef?: (ref: any) => void;
};

const GymMarker = ({
  gym,
  markerSize,
  showLogo,
  markerRef,
}: Props) => {
  const router = useRouter();
  const fallbackLogo = require("../assets/fallbacks/BJJ_White_Belt.svg.png");

  // pick either the real URI or the fallback
  const logoSource = useMemo(() => {
    return gym.logo && gym.logo.trim() !== ""
      ? { uri: gym.logo }
      : fallbackLogo;
  }, [gym.logo]);

  return (
    <Marker
      coordinate={{ latitude: gym.latitude, longitude: gym.longitude }}
      title={gym.name}
      ref={markerRef}
    >
      {showLogo ? (
        <Image
          source={logoSource}
          style={[styles.markerImage, markerSize]}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.dotMarker} />
      )}

      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <Text style={styles.gymName}>{gym.name}</Text>
          {gym.openMatTimes?.map((time: string, idx: number) => (
            <Text key={idx} style={styles.gymTime}>
              {time}
            </Text>
          ))}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/add-gym",
                params: {
                  existingGym: JSON.stringify(gym),
                },
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
};

const styles = StyleSheet.create({
  markerImage: {
    resizeMode: "contain",
  },
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

export default GymMarker;
