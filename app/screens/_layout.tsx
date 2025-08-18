// app/screens/_layout.tsx
import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        // headerBackTitleVisible: false, // ❌ not supported in native-stack
        headerBackVisible: true,          // ✅ optional
        // headerBackTitle: "",            // ✅ optional if you want no back text on iOS
      }}
    >
      <Stack.Screen name="submit"      options={{ title: "Submit a Gym" }} />
      <Stack.Screen name="update-gym"  options={{ title: "Update Gym" }} />
      <Stack.Screen name="upgrade"     options={{ title: "Upgrade to Premium" }} />
      <Stack.Screen name="subscribe"   options={{ title: "Choose your plan" }} />
      <Stack.Screen name="gym-details" options={{ headerShown: false,title: "Gym Details" }} />
    </Stack>
  );
}
