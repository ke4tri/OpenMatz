//THis is currenly hiding the botom naviagare buttons to switch from explore to map views

import { Tabs } from "expo-router";
//import MapScreen from "./map";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { display: 'none' } }} />
    // <Tabs>
    //   <Tabs.Screen name="index" options={{ title: "Home" }} />
    //   <Tabs.Screen name="explore" options={{ title: "Explore" }} />
    //   <Tabs.Screen name="map" options={{ title: "Map" }} />
    // </Tabs>
  );
}
