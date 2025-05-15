import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen
        name="map"
        options={{
          headerShown: false, // ✅ removes the header and its logo
        }}
      />
    </Tabs>
  );
}
