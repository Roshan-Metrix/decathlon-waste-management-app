// import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
// import { useState } from "react";
// import Input from "../Components/Input";
// import api from "../api/api";

// export default function ResetPasswordScreen({ navigation, route }) {
//   const [email, setEmail] = useState(route.params?.email || "");
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const handleResetPassword = async () => {
//     if (!email || !otp || !newPassword) {
//       setMessage("Please fill all fields");
//       return;
//     }
//     setLoading(true);
//     try {
//       const { data } = await api.post("/auth/reset-password", {
//         email,
//         otp,
//         newPassword,
//       });
//       setMessage(data.message);
//       if (data.success) {
//         setTimeout(() => {
//           navigation.navigate("Login");
//         }, 1500);
//       }
//     } catch (err) {
//       setMessage("Failed to reset password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" }}>
//       <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>
//         Reset Password
//       </Text>

//       <Input placeholder="Email" value={email} onChangeText={setEmail} />
//       <Input placeholder="OTP" onChangeText={setOtp} />
//       <Input secure placeholder="New Password" onChangeText={setNewPassword} />

//       {message ? (
//         <Text style={{ textAlign: "center", color: "#2563eb", marginVertical: 8 }}>
//           {message}
//         </Text>
//       ) : null}

//       <TouchableOpacity
//         style={{ backgroundColor: "#2563eb", padding: 12, borderRadius: 8 }}
//         onPress={handleResetPassword}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>
//             Reset Password
//           </Text>
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Ionicons name="key-outline" size={70} color="#2563eb" />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter OTP and your new password to continue
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Input
            icon={<Ionicons name="mail-outline" size={22} color="#2563eb" />}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            icon={<Ionicons name="shield-checkmark-outline" size={22} color="#2563eb" />}
            placeholder="OTP"
            onChangeText={setOtp}
          />
          <Input
            icon={<Ionicons name="lock-closed-outline" size={22} color="#2563eb" />}
            secure
            placeholder="New Password"
            onChangeText={setNewPassword}
          />

          {message ? <Text style={styles.messageText}>{message}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
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
