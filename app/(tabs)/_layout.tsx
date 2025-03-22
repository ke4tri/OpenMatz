import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs initialRouteName="map">
      <Tabs.Screen name="map" options={{ title: "Map" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
    </Tabs>
  );
}
