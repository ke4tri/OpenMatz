import React, { createContext, useState, useContext } from "react";

export type LocationData = {
  latitude: number;
  longitude: number;
} | null;

const LocationContext = createContext<{
  location: LocationData;
  setLocation: React.Dispatch<React.SetStateAction<LocationData>>;
}>({
  location: null,
  setLocation: () => {},
});

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<LocationData>(null);
  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
