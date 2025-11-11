import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waste Management System</Text>

      <Text style={styles.subtitle}>
        Manage your waste efficiently. Track collections, approvals, and vendors.
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.loginText}>Get Started</Text>
      </TouchableOpacity>

      {/* Optional: Add an illustration */}
      <Image
        style={styles.image}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#374151",
  },
  loginButton: {
    backgroundColor: "#1e40af",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 20,
  },
  loginText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginTop: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
});
