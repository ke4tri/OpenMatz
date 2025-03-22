import { Stack } from "expo-router";
import { View, Text } from "react-native";

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "green" }}> 
      {/* 🔰 Add debug color to confirm layout is rendering */}
      <Text style={{ fontSize: 20, fontWeight: "bold", color: "white", textAlign: "center" }}>
        ✅ Layout Loaded
      </Text>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens/gym-details" options={{ title: "Gym Details" }} />
      </Stack>
    </View>
  );
}
