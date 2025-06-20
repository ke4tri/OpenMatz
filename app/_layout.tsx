import { Stack } from "expo-router";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { LocationProvider } from "../components/LocationContext";

export default function Layout() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <LocationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </LocationProvider>
  );
}
