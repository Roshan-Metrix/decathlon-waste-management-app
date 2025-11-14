import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Alert } from "react-native";

export default function AddStoreScreen({ navigation }) {
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorPassword, setVendorPassword] = useState("");

  // Generate 16-char random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleAddStore = () => {
    if (!storeId || !storeName || !storeLocation || !contactNumber) {
      alert("Please fill all fields!");
      return;
    }

    // Open Popup & generate password
    setVendorPassword(generatePassword());
    setModalVisible(true);
  };

  const handleVendorSubmit = () => {
    if (!vendorEmail) {
      alert("Please enter vendor email!");
      return;
    }

    alert(
      `Store Added!\nVendor Email: ${vendorEmail}\nVendor Password: ${vendorPassword}`
    );

    // Reset fields
    setStoreId("");
    setStoreName("");
    setStoreLocation("");
    setContactNumber("");
    setVendorEmail("");
    setVendorPassword("");
    setModalVisible(false);
  };

  const copyPassword = async () => {
    await Clipboard.setStringAsync(vendorPassword);
    // Alert.alert("Copied!", "Password copied to clipboard.");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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

      <ScrollView contentContainerStyle={styles.content}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <MaterialIcons name="store" size={60} color="#2563eb" />
        </View>

        <Text style={styles.subTitle}>Enter Store Details</Text>

        {/* Input Fields */}
        <View style={styles.form}>
          <TextInput
            placeholder="Store ID"
            value={storeId}
            onChangeText={setStoreId}
            style={styles.input}
          />
          <TextInput
            placeholder="Store Name"
            value={storeName}
            onChangeText={setStoreName}
            style={styles.input}
          />
          <TextInput
            placeholder="Location"
            value={storeLocation}
            onChangeText={setStoreLocation}
            style={styles.input}
          />
          <TextInput
            placeholder="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddStore}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add-business" size={22} color="#fff" />
          <Text style={styles.addText}>Add Store</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Popup Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Manager Login Details</Text>

            <TextInput
              placeholder="Manager Email"
              value={vendorEmail}
              onChangeText={setVendorEmail}
              style={styles.input}
            />

            <View style={styles.passwordBox}>
              <TouchableOpacity onPress={copyPassword}>
                <Text
                  style={[
                    styles.passwordText,
                    { color: "#1d4ed8" },
                  ]}
                >
                  {vendorPassword}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setVendorPassword(generatePassword())}
              >
                <MaterialIcons name="refresh" size={26} color="#2563eb" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleVendorSubmit}
            >
              <Text style={styles.submitText}>Confirm & Create Manager</Text>
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
    </View>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  iconCircle: {
    backgroundColor: "#e0e7ff",
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
  },
  form: {
    width: "100%",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 15,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
  },
  addText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 8,
  },

  /* Modal Styling */
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 20,
    textAlign: "center",
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e0e7ff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  passwordText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#111",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelText: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: 15,
  },
});
