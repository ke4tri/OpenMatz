// // app/_layout.tsx
// import { Stack } from "expo-router";
// import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
// import { useColorScheme } from "react-native";

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   return (
//     <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="screens/gym-details" options={{ title: "Gym Details" }} />
//         <Stack.Screen name="drawer/submit" options={{ title: "Submit a Gym" }} />
//       </Stack>
//     </ThemeProvider>
//   );
// }
