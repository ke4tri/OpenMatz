import { View, Text, Image, StyleSheet, Linking, ScrollView, TouchableOpacity} from "react-native";
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
         {/* Back Button */}
  <TouchableOpacity style={styles.button} onPress={() => router.back()}>
    <Text style={styles.buttonText}>← Back to Map</Text>
  </TouchableOpacity>

  {/* Gym Name */}
  <Text style={styles.name}>{parsed.name}</Text>

  {/* Logo */}
  {parsed.logo && (
    <Image
      source={{ uri: parsed.logo }}
      style={styles.logo}
      resizeMode="contain"
    />
  )}

  {/* Class Times */}
  <Text style={styles.sectionTitle}>Class Times:</Text>
<View style={styles.classTimesWrapper}>
  {parsed.classTimes?.length ? (
    parsed.classTimes.map((time: string, idx: number) => (
      <Text key={idx} style={styles.time}>
        {time}
      </Text>
    ))
  ) : (
    <Text style={styles.time}>None listed</Text>
  )}
</View>

  {/* Contact Info */}
  <View style={styles.contactInfo}>
  {parsed.phone && (
    <TouchableOpacity onPress={() => Linking.openURL(`tel:${parsed.phone}`)}>
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📞</Text>
        <Text style={styles.infoText}>{parsed.phone}</Text>
      </View>
    </TouchableOpacity>
  )}

  {parsed.address && (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>📍</Text>
      <Text style={styles.infoText}>{parsed.address}</Text>
    </View>
  )}

  {parsed.website && (
    <TouchableOpacity onPress={() => Linking.openURL(parsed.website)}>
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>🌐</Text>
        <Text style={styles.infoText}>{parsed.website}</Text>
      </View>
    </TouchableOpacity>
  )}
</View>

  {/* Update Button */}
  <TouchableOpacity
    style={styles.button}
    onPress={() =>
      router.push({
        pathname: "/add-gym",
        params: { existingGym: JSON.stringify(parsed) },
      })
    }
  >
    <Text style={styles.buttonText}>Update This Gym</Text>
  </TouchableOpacity>
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
    textAlign: "center",
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
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  }, 
  time: {
    fontSize: 15,
    marginBottom: 4,
  },
  updateButton: {
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
    marginTop: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 12,
  },
  
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  classTimesWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  contactInfo: {
    marginBottom: 20,
  },
  
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",       // allow multi-line alignment
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexWrap: "wrap",               // ensure row wraps if needed
    maxWidth: "100%",  
  },
  
  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  
  infoText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  
  
});
