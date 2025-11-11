import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome</Text>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>Role: {user?.role}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: "#1e40af",
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
