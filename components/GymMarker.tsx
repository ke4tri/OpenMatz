import React from "react";
import { View, Text, Image } from "react-native";
import { Marker, Callout } from "react-native-maps";

type GymMarkerProps = {
  gym: any;
  logoSource: any;
  markerSize: { width: number; height: number }; // still passed in but not applied to layout
  zoomLevel: number;
  logoCutoffZoom: number;
};

export default function GymMarker({
  gym,
  logoSource,
  markerSize,
  zoomLevel,
  logoCutoffZoom,
}: GymMarkerProps) {
  const markerDimensions = {
    width: 60,
    height: 20,
  };

  return (
    <Marker
      key={gym.id}
      coordinate={{
        latitude: gym.latitude,
        longitude: gym.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }} // keeps marker centered on point
    >
      {/* Wrapper view with fixed size and center alignment */}
      <View
        style={[
          markerDimensions,
          {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        {/* Logo Image with scaling transform, not layout resize */}
        <Image
          source={logoSource}
          style={{
            width: "100%",
            height: "100%",
            opacity: zoomLevel >= logoCutoffZoom ? 1 : 0,
            transform: [{ scale: zoomLevel / 10 }],
          }}
          resizeMode="contain"
        />

        {/* Blue dot centered in the same fixed space */}
        <View
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: "blue",
            borderWidth: 1,
            borderColor: "white",
            opacity: zoomLevel < logoCutoffZoom ? 1 : 0,
          }}
        />
      </View>

      <Callout tooltip={false}>
        <View style={{ backgroundColor: "white", padding: 10, borderRadius: 8 }}>
          <Text style={{ fontWeight: "bold" }}>{gym.name}</Text>
          {gym.openMatTimes?.map((time: string, index: number) => (
            <Text key={index}>{time}</Text>
          ))}
        </View>
      </Callout>
    </Marker>
  );
}
