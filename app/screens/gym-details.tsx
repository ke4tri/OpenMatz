import { View, Text, Image, StyleSheet, Linking, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function GymDetailsScreen() {
  const { gym } = useLocalSearchParams();

  if (!gym) {
    return (
      <View style={styles.center}>
        <Text>No gym data provided.</Text>
      </View>
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(gym as string);
  } catch (e) {
    return (
      <View style={styles.center}>
        <Text>Failed to load gym data.</Text>
      </View>
    );
  }

  const { name, logo, phone, email } = parsed;
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {logo ? (
        <Image source={{ uri: logo }} style={styles.logo} resizeMode="contain" />
      ) : (
        <Text style={styles.logoPlaceholder}>No logo available</Text>
      )}
      <Text style={styles.name}>{name}</Text>
      {phone && (
        <Text style={styles.link} onPress={() => Linking.openURL(`tel:${phone}`)}>
          {phone}
        </Text>
      )}
      {email && (
        <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${email}`)}>
          {email}
        </Text>
      )}
      <Text style={styles.backButtonCentered} onPress={() => router.back()}>Back to Map</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 20,
  },
  logoPlaceholder: {
    marginVertical: 20,
    fontStyle: "italic",
    color: "#888",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  link: {
    fontSize: 18,
    color: "blue",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  backButtonCentered: {
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
    marginBottom: 20,
    textAlign: "center",
    alignSelf: "center",
  },
  
});
