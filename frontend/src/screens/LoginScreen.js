import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Input from "../Components/Input";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return setMessage("Please fill all fields");
    setLoading(true);
    try {
      const res = await login(email, password);
      setMessage(res.message || "");
    } catch {
      setMessage("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* 🔵 Gradient Header */}
        <LinearGradient
          colors={["#2563eb", "#1e3a8a"]}
          style={styles.header}
        >
          <Ionicons name="shield-checkmark-outline" size={80} color="#fff" />
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>
            Please login to continue
          </Text>
        </LinearGradient>

        {/* 🔘 Card Section */}
        <View style={styles.card}>
          <Input
            icon={<Ionicons name="mail-outline" size={22} color="#2563eb" />}
            placeholder="Email address"
            onChangeText={setEmail}
          />

          <Input
            icon={<Ionicons name="lock-closed-outline" size={22} color="#2563eb" />}
            placeholder="Password"
            secure
            onChangeText={setPassword}
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Powered by Store Management System
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 80,
    paddingBottom: 50,
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 10,
  },
  headerSubtitle: {
    color: "#e0e7ff",
    fontSize: 16,
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 25,
    marginTop: -40,
    padding: 22,
    borderRadius: 22,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    gap: 15,
  },

  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  forgot: {
    textAlign: "center",
    marginTop: 12,
    color: "#2563eb",
    fontSize: 15,
  },

  message: {
    textAlign: "center",
    color: "#dc2626",
    marginBottom: 8,
    fontWeight: "500",
  },

  footer: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
    marginBottom: 10,
  },
});
