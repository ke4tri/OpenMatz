import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import IconSymbol from "@/components/ui/IconSymbol"; 
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      {/* ✅ Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="home" color={color} />, // ✅ Fixed!
        }}
      />

      {/* ✅ Explore Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paper-plane-outline" color={color} />, // ✅ Fixed!
        }}
      />

      {/* ✅ Map Tab */}
      <Tabs.Screen
  name="map"  // ✅ Fixed! Matches the correct route name
  options={{
    title: "Map",
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="map" color={color} />,
  }}
/>

    </Tabs>
  );
}
