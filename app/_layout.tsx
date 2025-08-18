// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* All screens under /screens manage their own headers */}
      <Stack.Screen name="screens" options={{ headerShown: false }} />
    </Stack>
  );
}
