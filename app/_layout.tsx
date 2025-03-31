import { createDrawerNavigator } from "@react-navigation/drawer";
import MapScreen from "./(tabs)/map";
import SubmitScreen from "./drawer/submit";

const Drawer = createDrawerNavigator();

export default function Layout() {
  return (
    <Drawer.Navigator initialRouteName="Map">
      <Drawer.Screen name="Map" component={MapScreen} />
      <Drawer.Screen name="Submit a Gym" component={SubmitScreen} />
    </Drawer.Navigator>
  );
}
