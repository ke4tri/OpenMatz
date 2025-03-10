import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";

export default function IndexPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
      router.replace("/screens/MapScreen"); // Redirect AFTER mount
    }, 1000); // Delay to ensure navigation is mounted

    return () => clearTimeout(timeout); // Cleanup function
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return null;
}
