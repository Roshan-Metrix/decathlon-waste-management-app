import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View>
        <Image source={require("../../assets/icon.png")} style={styles.image} />
      </View>
      {/* Tagline */}
      <Text style={styles.tagline}>SPORT FOR ALL - ALL FOR SPORTS</Text>

      <Text style={styles.subtitle}>
        Manage operations efficiently. Track collections, approvals, and store
        activities.
      </Text>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginText}>Get Started</Text>
      </TouchableOpacity>

      {/* Footer Note */}
      <Text style={styles.footerText}>
        This application is developed for Decathlon's internal usage
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f9fafb",
  },
  tagline: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 15,
    textAlign: "center",
    fontStyle: "italic",
    position: "absolute",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 24,
    color: "#4b5563",
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: "#1e40af",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  loginText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: "contain",
  },
  footerText: {
    position: "absolute",
    bottom: 16,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 12,
  },
});
