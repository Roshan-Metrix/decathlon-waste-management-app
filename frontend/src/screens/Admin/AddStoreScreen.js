import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import api from "../../api/api";
import Alert from "../../Components/Alert";

export default function AddStoreScreen({ navigation }) {
  const [storeId, setStoreId] = useState("");
  const [name, setName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  useEffect(() => {
    setPassword(generatePassword());
  }, []);

  const copyPassword = async () => {
    await Clipboard.setStringAsync(password);
  };

  const handleAddStore = () => {
    if (
      !storeId ||
      !name ||
      !storeLocation ||
      !contactNumber ||
      !email ||
      !password
    ) {
      setAlertMessage("Please fill all field");
      setAlertVisible(true);
      return;
    }
    setModalVisible(true);
  };

  const handleVendorSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        storeId,
        name,
        storeLocation,
        contactNumber,
        email,
        password,
        adminEmail,
        adminPassword,
      };

      const { data } = await api.post("/auth/admin/registerStore", payload);

      if (data.success) {
        setAlertMessage("Store created successfully .");
        setAlertVisible(true);
        setModalVisible(false);

        setStoreId("");
        setName("");
        setStoreLocation("");
        setContactNumber("");
        setEmail("");
        setPassword("");
        setAdminEmail("");
        setAdminPassword("");
      } else {
       setAlertMessage(data.message || "Something went wrong");
       setAlertVisible(true);
      }
    } catch (err) {
      setAlertMessage("Something went wrong");
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
        <Text style={styles.headerTitle}>Add Store</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* KEYBOARD SAFE AREA */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="store" size={55} color="#2563eb" />
            </View>

            <Text style={styles.subTitle}>Store Details</Text>

            <View style={styles.form}>
              <View style={styles.inputRow}>
                <MaterialIcons name="badge" size={22} color="#2563eb" />
                <TextInput
                  placeholder="Store ID"
                  value={storeId}
                  onChangeText={setStoreId}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="storefront" size={22} color="#2563eb" />
                <TextInput
                  placeholder="Store Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="location-on" size={22} color="#2563eb" />
                <TextInput
                  placeholder="Location"
                  value={storeLocation}
                  onChangeText={setStoreLocation}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="call" size={22} color="#2563eb" />
                <TextInput
                  placeholder="Contact Number"
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="numeric"
                  style={styles.input}
                  maxLength={10}
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="email" size={22} color="#2563eb" />
                <TextInput
                  placeholder="Store Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>

              <View style={styles.passwordRow}>
                <TouchableOpacity
                  onPress={copyPassword}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <MaterialIcons name="lock" size={22} color="#1d4ed8" />
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={[styles.input, { marginLeft: 10 }]}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPassword(generatePassword())}
                >
                  <MaterialIcons name="refresh" size={24} color="#2563eb" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddStore}>
              <MaterialIcons name="add-business" size={20} color="#fff" />
              <Text style={styles.addText}>Add Store</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* POPUP */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Admin Verification</Text>

            <View style={[styles.inputRow, { marginBottom: 10 }]}>
              <MaterialIcons
                name="admin-panel-settings"
                size={22}
                color="#2563eb"
              />
              <TextInput
                placeholder="Admin Email"
                value={adminEmail}
                onChangeText={setAdminEmail}
                style={styles.input}
              />
            </View>

            <View style={[styles.inputRow, { marginBottom: 20 }]}>
              <MaterialIcons name="lock" size={22} color="#2563eb" />
              <TextInput
                placeholder="Admin Password"
                secureTextEntry
                value={adminPassword}
                onChangeText={setAdminPassword}
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { opacity: loading ? 0.5 : 1 }]}
              disabled={loading}
              onPress={handleVendorSubmit}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Verify & Create</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
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

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 45,
    paddingBottom: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },

  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#2563eb" },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },

  content: { width: "100%", alignItems: "center" },

  iconCircle: {
    backgroundColor: "#e0e7ff",
    padding: 18,
    borderRadius: 100,
    marginBottom: 10,
  },

  subTitle: { fontSize: 17, fontWeight: "600", marginBottom: 12 },

  form: { width: "100%", gap: 12 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "space-between",
  },

  input: { flex: 1, fontSize: 15, marginLeft: 8 },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    borderRadius: 12,
    width: "100%",
    marginTop: 18,
  },
  addText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 6 },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 16,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
  },

  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },

  cancelButton: { paddingVertical: 8 },
  cancelText: { textAlign: "center", fontSize: 14, color: "#777" },
});
