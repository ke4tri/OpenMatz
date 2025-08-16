// app/_layout.tsx
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index"  options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* 👇 Hide the parent header for everything under /app/screens/* */}
        <Stack.Screen name="screens" options={{ headerShown: false }} />
        {/* keep this if you want a title on update-gym */}
        <Stack.Screen name="update-gym" options={{ headerShown: false , title: "Update Gym" }} />
      </Stack>
    </ThemeProvider>
  );
}
