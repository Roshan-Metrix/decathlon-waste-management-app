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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import api from "../../../api/api";
import colors from "../../../colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Alert from "../../../Components/Alert";

export default function AddOtherManagersScreen({ navigation }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeId, setStoreId] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  // Admin verifier fields
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Auto generate password
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
  };

  // Create → ask for admin credentials
  const handleCreate = () => {
    if (!name || !email) {
      // alert("Please fill all fields");
      setAlertMessage("Please fill all fields");
      setAlertVisible(true);
      return;
    }
    setShowPopup(true);
  };

  // Fetch storeId
  const getStoreId = async () => {
    try {
      const storedId = await AsyncStorage.getItem("storeId");
      if (storedId) setStoreId(storedId);
    } catch (error) {
      console.log("Store Id fetch error :", error.message);
    }
  };

  useEffect(() => {
    getStoreId();
  }, []);

  // FINAL CONFIRM → verify admin → create manager
  const handleConfirm = async () => {
    if (!adminEmail || !adminPassword) {
      // alert("Enter your login credentials");
      setAlertMessage("Enter your login credentials");
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    try {
      // Verify admin credentials
      const verify = await api.post("/auth/login", {
        email: adminEmail,
        password: adminPassword,
      });

      if (!verify.data.success) {
        // alert("Admin verification failed!");
        setAlertMessage("Admin verification failed!");
        setAlertVisible(true);
        setLoading(false);
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
      setAlertMessage(registerRes.data.message);
      setAlertVisible(true);
        setLoading(false);
        return;
      }

      // alert("Manager Created Successfully!");
      setAlertMessage("Manager Created Successfully!");
      setAlertVisible(true);

      // Reset
      setName("");
      setEmail("");
      setPassword(generatePassword());
      setAdminEmail("");
      setAdminPassword("");
      setShowPopup(false);
    } catch (err) {
      console.log("Error: " + err.message);
      setAlertMessage("Something went wrong!");
      setAlertVisible(true);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add Managers</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={30}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon */}
          <View style={styles.iconCircle}>
            <MaterialIcons name="person-add" size={60} color={colors.primary} />
          </View>

          <Text style={styles.title}>Create New Manager</Text>

          <View style={styles.form}>
            {/* NAME */}
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={20} color={colors.primary} />
              <TextInput
                style={styles.inputField}
                placeholder="Manager Name"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* EMAIL */}
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color={colors.primary} />
              <TextInput
                style={styles.inputField}
                placeholder="Manager Email"
                value={email}
                keyboardType="email-address"
                onChangeText={setEmail}
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.passwordBox}>
              <MaterialIcons name="lock" size={24} color={colors.primary} />

              <TouchableOpacity onPress={copyPassword} style={{ flex: 1 }}>
                <Animated.Text
                  style={[styles.passwordText, { opacity: fadeAnim }]}
                >
                  {password}
                </Animated.Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setPassword(generatePassword())}>
                <MaterialIcons
                  name="refresh"
                  size={26}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createBtn, { marginTop: 13 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons name="add" size={22} color="#fff" />
                <Text style={styles.btnText}>Create Manager</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* POPUP */}
      <Modal transparent visible={showPopup} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Verify Your Identity</Text>

            <TextInput
              style={styles.input}
              placeholder="Your Email"
              value={adminEmail}
              onChangeText={setAdminEmail}
            />

            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Your Password"
              secureTextEntry
              value={adminPassword}
              onChangeText={setAdminPassword}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>Confirm & Create Manager</Text>
              )}
            </TouchableOpacity>

            {!loading && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPopup(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
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

/* ---------------- STYLES ---------------- */

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

  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },

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
    borderColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    gap: 10,
  },

  passwordText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },

  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
  },

  btnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 8,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 25,
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 18,
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    fontSize: 16,
  },

  submitButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 12,
    marginTop: 18,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },

  cancelButton: { paddingVertical: 12 },
  cancelText: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: 15,
  },
});
