// components/GymMarker.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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
  onPress={onPress} // shows callout
>
  <View style={styles.dotMarker} />
  <Callout
  tooltip
  onPress={() => {
    console.log("Tapped callout for:", gym.name);
    router.push({
      pathname: "/screens/gym-details",
      params: { gym: JSON.stringify(gym) },
    });
  }}
>
  <View style={styles.calloutContainer}>
    <View style={styles.info}>
      <Text style={styles.name}>{gym.name}</Text>

      {gym.openMatTimes?.length > 0 && (
        <Text style={styles.openMatsLabel}>OPENMATS</Text>
      )}

      {gym.openMatTimes.map((time, idx) => (
        <Text key={idx} style={styles.time}>{time}</Text>
      ))}

      <Text style={styles.tapHint}>Tap for more info</Text>
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
  moreInfoNote: {
    fontSize: 12,
    marginTop: 8,
    color: 'gray',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  calloutContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderColor: 'red', // optional for debug
    borderWidth: 1,
    minWidth: 200,
    maxWidth: 300,
  },
  tapHint: {
    marginTop: 8,
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  calloutContent: {
    flexDirection: "column",
    justifyContent: "space-between", // pushes button down
    flex: 1,
  },
  info: {
    alignItems: 'center',
    paddingTop: 5
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
    textAlign: 'center',
  },
  time: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
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
  openMatsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    marginBottom: 4,
    textAlign: 'center',
  },
  buttonWrapper: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
});
