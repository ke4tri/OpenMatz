import { View, Text, Image, StyleSheet, Linking, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";


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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.name}>{parsed.name}</Text>
  
        {parsed.logo && (
          <Image
            source={{ uri: parsed.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
  
        {parsed.phone && (
          <Text
            style={styles.detail}
            onPress={() => Linking.openURL(`tel:${parsed.phone}`)}
          >
            📞 {parsed.phone}
          </Text>
        )}
  
        {parsed.email && (
          <Text
            style={styles.detail}
            onPress={() => Linking.openURL(`mailto:${parsed.email}`)}
          >
            ✉️ {parsed.email}
          </Text>
        )}
  
        {parsed.address && (
          <Text style={styles.detail}>📍 {parsed.address}</Text>
        )}
  
        {parsed.website && (
          <Text
            style={styles.detail}
            onPress={() => Linking.openURL(parsed.website)}
          >
            🌐 {parsed.website}
          </Text>
        )}
  
        <Text style={styles.sectionTitle}>Class Times:</Text>
        {parsed.openMatTimes?.length ? (
          parsed.openMatTimes.map((time: string, idx: number) => (
            <Text key={idx} style={styles.time}>
              {time}
            </Text>
          ))
        ) : (
          <Text style={styles.time}>None listed</Text>
        )}

        <Text style={styles.backButton} onPress={() => router.back()}>
          Back to Map
        </Text>
  
      </ScrollView>
    </SafeAreaView>
  );
  
  
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 100,
    alignSelf: "center",
    marginBottom: 15,
  },
  logoPlaceholder: {
    marginVertical: 20,
    fontStyle: "italic",
    color: "#888",
  },
  backButton: {
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
    color: "blue",
    textDecorationLine: "underline",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },  time: {
    fontSize: 15,
    marginBottom: 4,
  },
  
});
