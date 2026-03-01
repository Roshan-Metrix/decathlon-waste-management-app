import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import { ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";
import { generatePassword } from "../../../lib/generatePassword";

export default function AddManagersScreen({ navigation }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeId, setStoreId] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);

  // Verifier admin fields
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Auto-generate password on screen open
  useEffect(() => {
    setPassword(generatePassword());
  }, []);

  // Blink animation
  const blink = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const copyPassword = async () => {
    await Clipboard.setStringAsync(password);
    blink();
    setAlertMessage("Password copied to clipboard");
    setAlertVisible(true);
  };

  // Press Create -> show popup
  const handleCreate = () => {
    if (!name || !email) {
      setAlertMessage("Please fill all fields");
      setAlertVisible(true);
      return;
    }
    setShowPopup(true);
  };

  // FINAL CONFIRM -> Verify credentials -> register new manager
  const handleConfirm = async () => {
    if (!adminEmail || !adminPassword) {
      setAlertMessage("Enter your login credentials");
      setAlertVisible(true);
      return;
    }

    try {
      setLoading(true);

      // Verify admin credentials
      const verify = await api.post("/auth/login", {
        email: adminEmail,
        password: adminPassword,
      });

      if (!verify.data.success) {
        setLoading(false);
        setAlertMessage("Admin verification failed!");
        setAlertVisible(true);
        return;
      }

      // Register new manager
      const registerRes = await api.post("/auth/registerManager", {
        name,
        email,
        password,
        storeId,
      });

      if (!registerRes.data.success) {
        setLoading(false);
        setAlertMessage(registerRes.data.message);
        setAlertVisible(true);
        return;
      }

      setAlertMessage("Manager Created Successfully!");
      setAlertVisible(true);

      // Reset fields
      setName("");
      setEmail("");
      setPassword(generatePassword());
      setAdminEmail("");
      setAdminPassword("");
      setShowPopup(false);
    } catch (err) {
      setAlertMessage("Something went wrong!");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add Manager</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <MaterialIcons name="person-add" size={60} color="#2563eb" />
        </View>

        <Text style={styles.title}>Create New Manager</Text>

        <View style={styles.form}>
          {/* NAME */}
          <View style={styles.inputWrapper}>
            <MaterialIcons name="store" size={20} color="#2563eb" />
            <TextInput
              style={styles.inputField}
              placeholder="Store Id"
              placeholderTextColor="#7e7c7c"
              value={storeId}
              onChangeText={setStoreId}
            />
          </View>

          {/* NAME */}
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" size={20} color="#2563eb" />
            <TextInput
              style={styles.inputField}
              placeholder="Manager Name"
              placeholderTextColor="#7e7c7c"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* EMAIL */}
          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={20} color="#2563eb" />
            <TextInput
              style={styles.inputField}
              placeholder="Manager Email"
              placeholderTextColor="#7e7c7c"
              value={email}
              keyboardType="email-address"
              onChangeText={setEmail}
            />
          </View>

          {/* PASSWORD BOX */}
          <View style={styles.passwordBox}>
            <MaterialIcons name="lock" size={24} color="#2563eb" />

            <TouchableOpacity onPress={copyPassword} style={{ flex: 1 }}>
              <Animated.Text
                style={[styles.passwordText, { opacity: fadeAnim }]}
              >
                {password}
              </Animated.Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPassword(generatePassword())}>
              <MaterialIcons name="refresh" size={26} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createBtn, { marginTop: 13 }]}
          onPress={handleCreate}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
          <Text style={styles.btnText}>Create Manager</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* POPUP */}
      <Modal transparent visible={showPopup} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <MaterialIcons
              name="verified-user"
              size={50}
              color="#2563eb"
              style={{ marginBottom: 15 }}
            />

            <Text style={styles.modalTitle}>Credential Verification</Text>
            <Text style={styles.modalSubtitle}>
              Please confirm your admin credentials to continue.
            </Text>

            {/* Email */}
            <View style={styles.inputWrapperModal}>
              <MaterialIcons name="email" size={20} color="#2563eb" />
              <TextInput
                placeholder="Admin Email"
                placeholderTextColor="#94a3b8"
                style={styles.modalInput}
                value={adminEmail}
                onChangeText={setAdminEmail}
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrapperModal}>
              <MaterialIcons name="lock" size={20} color="#2563eb" />
              <TextInput
                placeholder="Admin Password"
                placeholderTextColor="#94a3b8"
                style={styles.modalInput}
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry
              />
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={loading ? null : handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirm & Create Manager</Text>
              )}
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setShowPopup(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

/*  STYLES  */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#fff",
    elevation: 3,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#2563eb" },

  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },

  iconCircle: {
    backgroundColor: "#e0e7ff",
    padding: 20,
    borderRadius: 100,
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 25,
  },

  form: { width: "100%", gap: 16 },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    gap: 8,
  },

  inputField: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },

  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    gap: 10,
  },

  passwordText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
  },

  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
  },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "600", marginLeft: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 25,
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e3a8a",
    marginBottom: 6,
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },

  inputWrapperModal: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    width: "100%",
  },

  modalInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    color: "#0f172a",
  },

  confirmButton: {
    backgroundColor: "#2563eb",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },

  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  cancelButton: {
    marginTop: 12,
  },

  cancelText: {
    color: "#dc2626",
    fontWeight: "600",
  },
});
