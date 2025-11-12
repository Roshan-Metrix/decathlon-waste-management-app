import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Main Title */}
      <Text style={styles.title}>DECATHLON</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>SPORT FOR ALL - ALL FOR SPORTS</Text>

      {/* Optional Illustration */}
      {/* <Image source={require("../../assets/waste.png")} style={styles.image} /> */}

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
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#1e40af",
    textAlign: "center",
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: "#374151",
    marginTop: 6,
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
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
    width: 200,
    height: 100,
    resizeMode: "contain",
    marginVertical: 10,
  },
  footerText: {
    position: "absolute",
    bottom: 16,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 12,
  },
});
