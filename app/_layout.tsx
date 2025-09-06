// app/_layout.tsx
import { Stack } from "expo-router";
import { LocationProvider } from "../components/LocationContext"; 

export default function RootLayout() {
  return (
    <LocationProvider>
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* All screens under /screens manage their own headers */}
      <Stack.Screen name="screens" options={{ headerShown: false }} />
    </Stack>
    </LocationProvider>

  );
}
