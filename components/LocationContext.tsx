// components/LocationContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

export type LocationData = { latitude: number; longitude: number } | null;


type Ctx = {
  location: LocationData;
  permission: Location.PermissionStatus | null;
  servicesEnabled: boolean | null;
  requestPermission: () => Promise<boolean>;
  refresh: () => Promise<void>;
};

const LocationContext = createContext<Ctx>({
  location: null,
  permission: null,
  servicesEnabled: null,
  requestPermission: async () => false,
  refresh: async () => {},
});

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<LocationData>(null);
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);
  const [servicesEnabled, setServicesEnabled] = useState<boolean | null>(null);
  const subRef = useRef<Location.LocationSubscription | null>(null);

  const requestPermission = async () => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        const res = await Location.requestForegroundPermissionsAsync();
        status = res.status;
      }
      setPermission(status);
      return status === "granted";
    } catch {
      setPermission("denied" as unknown as Location.PermissionStatus);
      return false;
    }
  };

  const refresh = async () => {
    try {
      // seed from last-known (fast)
      const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 });
      if (last?.coords) {
        setLocation({ latitude: last.coords.latitude, longitude: last.coords.longitude });
      }
      // then get a fresh fix (optional, quick timeout)
      const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ latitude: cur.coords.latitude, longitude: cur.coords.longitude });
    } catch {
      // ignore — user may deny or services off
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const granted = await requestPermission();
      const on = await Location.hasServicesEnabledAsync();
      if (cancelled) return;

      setServicesEnabled(on);
      if (!granted || !on) return;

      await refresh();
      if (cancelled) return;

      // start a lightweight watch (updates when user moves ~25–50m)
      subRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10_000,
          distanceInterval: 25,
        },
        (pos) => {
          setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        }
      );
    })();

    return () => {
      cancelled = true;
      subRef.current?.remove();
      subRef.current = null;
    };
  }, []);

  return (
    <LocationContext.Provider value={{ location, permission, servicesEnabled, requestPermission, refresh }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
