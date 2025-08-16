// app/screens/_layout.tsx
import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: false,   // 👈 hide "< …" back row
        headerLargeTitle: false,
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="gym-details" options={{ title: "Gym Details" }} />
      <Stack.Screen name="submit"      options={{ title: "Submit a Gym" }} />
    </Stack>
  );
}
