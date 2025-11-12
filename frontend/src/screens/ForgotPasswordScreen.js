// import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
// import { useState } from "react";
// import Input from "../Components/Input";
// import api from "../api/api";

// export default function ForgotPasswordScreen({ navigation }) {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const handleSendOtp = async () => {
//     if (!email) return setMessage("Please enter your email");
//     setLoading(true);
//     try {
//       const { data } = await api.post("/auth/send-reset-otp", { email });
//       setMessage(data.message);
//       if (data.success) {
//         setTimeout(() => {
//           navigation.navigate("ResetPassword", { email });
//         }, 1500);
//       }
//     } catch (err) {
//       setMessage("Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" }}>
//       <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>
//         Forgot Password
//       </Text>

//       <Input placeholder="Enter your email" onChangeText={setEmail} />
//       {message ? (
//         <Text style={{ textAlign: "center", color: "#2563eb", marginVertical: 8 }}>
//           {message}
//         </Text>
//       ) : null}

//       <TouchableOpacity
//         style={{ backgroundColor: "#2563eb", padding: 12, borderRadius: 8 }}
//         onPress={handleSendOtp}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>Send OTP</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

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
import Input from "../Components/Input";
import api from "../api/api";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOtp = async () => {
    if (!email) return setMessage("Please enter your email");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/send-reset-otp", { email });
      setMessage(data.message);
      if (data.success) {
        setTimeout(() => {
          navigation.navigate("ResetPassword", { email });
        }, 1500);
      }
    } catch (err) {
      setMessage("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Arrow */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Ionicons name="mail-open-outline" size={70} color="#2563eb" />
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive OTP for password reset
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Input
            icon={<Ionicons name="mail-outline" size={22} color="#2563eb" />}
            placeholder="Enter your email"
            onChangeText={setEmail}
          />

          {message ? (
            <Text style={styles.messageText}>{message}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendOtp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
  },
  formContainer: {
    gap: 16,
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
  },
});
