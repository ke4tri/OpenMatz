import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function RedirectToTabMap() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(tabs)/map");
  }, []);

  return null; // Don't render anything
}
