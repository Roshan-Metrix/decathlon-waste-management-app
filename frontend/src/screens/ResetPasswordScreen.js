import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Input from "../Components/Input";
import api from "../api/api";

export default function ResetPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    if (!email || !otp || !newPassword) {
      setMessage("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setMessage(data.message);
      if (data.success) {
        setTimeout(() => {
          navigation.navigate("Login");
        }, 1500);
      }
    } catch (err) {
      setMessage("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#2563eb", "#1e40af"]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Icon Header */}
          <View style={styles.headerContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="key-outline" size={70} color="#2563eb" />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the OTP sent to your email & create a new password
            </Text>
          </View>

          {/* White Card Form */}
          <View style={styles.card}>
            <Input
              icon={<Ionicons name="mail-outline" size={22} color="#2563eb" />}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              icon={
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#2563eb"
                />
              }
              placeholder="OTP"
              value={otp}
              onChangeText={setOtp}
            />

            <Input
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#2563eb"
                />
              }
              secure
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            {message ? (
              <Text style={styles.messageText}>{message}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 26,
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 40,
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 20,
  },

  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  iconWrapper: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginTop: 16,
  },

  subtitle: {
    fontSize: 15,
    color: "#e0e7ff",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    gap: 18,
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

  messageText: {
    textAlign: "center",
    color: "#2563eb",
    marginVertical: 8,
    fontWeight: "500",
  },
});
