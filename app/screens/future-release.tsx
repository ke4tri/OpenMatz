import { View, Text, StyleSheet, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";

export default function FutureRelease() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>By Port13ET</Text>
      <Pressable onPress={() => Linking.openURL("https://www.Port13ET.com")}>
        <Text style={styles.link}>www.Port13ET.com</Text>
      </Pressable>

      <View style={styles.divider} />

<Text style={styles.heading}>Coming Soon</Text>
<Text style={styles.feature}>• Gym Logo Upload •</Text>
<Text style={styles.feature}>• Premium membership options •</Text>
<Text style={styles.feature}>• More Locations •</Text>
<View style={{ paddingLeft: 20 }}>
  <Text style={styles.subFeature}>• Chicago</Text>
  <Text style={styles.subFeature}>• Cancun</Text>
  <Text style={styles.subFeature}>• Barcelona</Text>
  <Text style={styles.subFeature}>• Amsterdam</Text>
</View>

<Text style={styles.disclaimer}>
  We are working diligently on the process of gym population. It is our goal to populate the app with as many seeded gyms as possible with updated and accurate information. Please reach out with any inaccurate information you may find.
</Text>



      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={{ color: "white" }}>Back to map</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  subFeature: {
  fontSize: 14,
  color: "#ccc",
  marginLeft: 8,
},
  title: {
    color: "#ccc",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  link: {
    color: "#00BFFF",
    fontSize: 16,
    textDecorationLine: "underline",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    width: "80%",
    marginVertical: 20,
  },
disclaimer: {
  marginTop: 16,
  fontSize: 13,
  color: "#aaa",
  lineHeight: 18,
  textAlign: "center",
},


  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  feature: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 4,
  },
  backButton: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 6,
  },
});
