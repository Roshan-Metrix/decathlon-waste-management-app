import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import api from "../../api/api";

export default function AddStoreScreen({ navigation }) {
  const [storeId, setStoreId] = useState("");
  const [name, setName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

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
    if (!storeId || !name || !storeLocation || !contactNumber) {
      alert("Please fill all fields!");
      return;
    }

    setPassword(generatePassword());
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
      };

      const { data } = await api.post("/auth/admin/registerStore", payload);

      if (data.success) {
        alert("Store created successfully!");
        setModalVisible(false);

        setStoreId("");
        setName("");
        setStoreLocation("");
        setContactNumber("");
        setEmail("");
        setPassword("");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      alert("API Error: " + err.message);
    }

    setLoading(false);
  };

  const copyPassword = async () => {
    await Clipboard.setStringAsync(password);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Store</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="store" size={60} color="#2563eb" />
        </View>

        <Text style={styles.subTitle}>Enter Store Details</Text>

        <View style={styles.form}>
          <View style={styles.inputRow}>
            <MaterialIcons name="badge" size={24} color="#2563eb" />
            <TextInput
              placeholder="Store ID"
              value={storeId}
              onChangeText={setStoreId}
              style={styles.input}
            />
          </View>

          <View style={styles.inputRow}>
            <MaterialIcons name="storefront" size={24} color="#2563eb" />
            <TextInput
              placeholder="Store Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputRow}>
            <MaterialIcons name="location-on" size={24} color="#2563eb" />
            <TextInput
              placeholder="Location"
              value={storeLocation}
              onChangeText={setStoreLocation}
              style={styles.input}
            />
          </View>

          <View style={styles.inputRow}>
            <MaterialIcons name="call" size={24} color="#2563eb" />
            <TextInput
              placeholder="Contact Number"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddStore} activeOpacity={0.8}>
          <MaterialIcons name="add-business" size={22} color="#fff" />
          <Text style={styles.addText}>Add Store</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Store Login Details</Text>

            <View style={[styles.inputRow, { marginBottom: 15 }]}>
              <MaterialIcons name="email" size={24} color="#2563eb" />
              <TextInput
                placeholder="Manager Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>

            <View style={[styles.passwordBox, { marginBottom: 20 }]}>
              <TouchableOpacity
                onPress={copyPassword}
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <MaterialIcons name="lock" size={24} color="#1d4ed8" style={{ marginRight: 6 }} />
                <Text style={styles.passwordText}>{password}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setPassword(generatePassword())}>
                <MaterialIcons name="refresh" size={26} color="#2563eb" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleVendorSubmit}>
              {loading ? <ActivityIndicator color="#fff" /> :
                <Text style={styles.submitText}>Confirm & Create Store</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- STYLES ---------- */
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
    marginBottom: 25,
  },
  form: {
    width: "100%",
    marginBottom: 30,
    gap: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    marginTop: 10,
  },
  addText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 8,
  },
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
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 20,
    textAlign: "center",
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    padding: 14,
    borderRadius: 10,
    justifyContent: "space-between",
  },
  passwordText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
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
