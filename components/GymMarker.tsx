// components/GymMarker.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Marker, Callout, CalloutSubview } from "react-native-maps";
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
    {/* BUTTON */}
    <CalloutSubview
      onPress={() => {
        console.log("Gym Info button pressed", gym.name);
        router.push({
          pathname: "/screens/gym-details",
          params: { gym: JSON.stringify(gym) },
        });
      }}
    >
      <View style={styles.button}>
        <Text style={styles.buttonText}>Gym Info</Text>
      </View>
    </CalloutSubview>

    {/* INFO */}
    <View style={styles.info}>
      <Text style={styles.name}>{gym.name}</Text>
      {gym.openMatTimes?.map((time, idx) => (
        <Text key={idx} style={styles.time}>{time}</Text>
      ))}
    </View>
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
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderColor: 'red',        // for debugging
    borderWidth: 1,
    minWidth: 200,
    maxWidth: 300,
    flexDirection: 'column',
  },
  button: {
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
  },
  calloutContent: {
    flexDirection: "column",
    justifyContent: "space-between", // pushes button down
    flex: 1,
  },
  info: {
    backgroundColor: 'yellow',  // debug visual aid
    paddingTop: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  time: {
    fontSize: 14,
    color: 'black',
  },
  gymName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "black",
    marginBottom: 5,
  },
  gymTime: {
    fontSize: 14,
  },
  editButton: {
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "green"
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "black",
  },
  gymInfoWrapper: {
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginBottom: 8,
  },
});
