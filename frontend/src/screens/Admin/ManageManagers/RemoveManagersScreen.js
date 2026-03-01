import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function RemoveManagersScreen({ navigation }) {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [deleting, setDeleting] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fetchManagers = async () => {
    try {
      const { data } = await api.get("/auth/get-all-managers");

      if (data.success) {
        setManagers(data.managers);
        setFilteredManagers(data.managers);
      }
    } catch (err) {
      console.log("Fetch Managers Error:", err.message);
      setAlertMessage("Failed to fetch managers");
      setAlertVisible(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  //  Filter managers on search
  useEffect(() => {
    const s = search.toLowerCase();

    const filtered = managers.filter((m) => {
      return (
        m.name.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        m.storeId.toLowerCase().includes(s) ||
        m.storeName.toLowerCase().includes(s) ||
        m.storeLocation.toLowerCase().includes(s)
      );
    });

    setFilteredManagers(filtered);
  }, [search]);

  const confirmDeleteManager = async () => {
    if (!adminEmail || !adminPassword) {
      setAlertMessage("Enter your login credentials");
      setAlertVisible(true);
      return;
    }

    try {
      setDeleting(true);

      //  VERIFY ADMIN
      const verify = await api.post("/auth/login", {
        email: adminEmail,
        password: adminPassword,
      });

      if (!verify.data.success) {
        setDeleting(false);
        setAlertMessage("Admin verification failed!");
        setAlertVisible(true);
        return;
      }

      //  DELETE MANAGER
      const res = await api.delete(
        `/auth/admin/delete-manager/${selectedManager._id}`,
      );

      if (!res.data.success) {
        setDeleting(false);
        setAlertMessage(res.data.message || "Delete failed");
        setAlertVisible(true);
        return;
      }

      const updated = managers.filter((m) => m._id !== selectedManager._id);

      setManagers(updated);
      setFilteredManagers(updated);

      setAlertMessage("Manager removed successfully!");
      setAlertVisible(true);

      // Reset
      setAdminEmail("");
      setAdminPassword("");
      setModalVisible(false);
    } catch (error) {
      setAlertMessage("Something went wrong!");
      setAlertVisible(true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Managers List</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={22} color="#2563eb" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, store, email..."
          placeholderTextColor="#7e7c7c"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Loading */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 40 }}
        />
      ) : filteredManagers.length === 0 ? (
        <Text style={styles.noData}>No managers found.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Total Managers */}
          <View style={styles.countBox}>
            <MaterialIcons name="people" size={50} color="#2563eb" />
            <Text style={styles.countText}>Total Managers</Text>
            <Text style={styles.countNumber}>{filteredManagers.length}</Text>
          </View>

          {/* Manager Cards */}
          {filteredManagers.map((m, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.row}>
                <MaterialIcons name="person" size={22} color="#2563eb" />
                <Text style={styles.value}>{m.name}</Text>
              </View>

              <View style={styles.row}>
                <MaterialIcons name="email" size={22} color="#2563eb" />
                <Text style={styles.value}>{m.email}</Text>
              </View>

              <View style={styles.row}>
                <MaterialIcons name="store" size={22} color="#2563eb" />
                <Text style={styles.value}>{m.storeId}</Text>
              </View>

              <View style={styles.row}>
                <MaterialIcons
                  name="confirmation-number"
                  size={22}
                  color="#2563eb"
                />
                <Text style={styles.value}>{m.storeName}</Text>
              </View>

              <View style={styles.row}>
                <MaterialIcons name="location-pin" size={22} color="#2563eb" />
                <Text style={styles.value}>{m.storeLocation}</Text>
              </View>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => {
                  setSelectedManager(m);
                  setModalVisible(true);
                }}
              >
                <MaterialIcons name="delete" size={22} color="#fff" />
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      <Modal visible={modalVisible} transparent animationType="fade">
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
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color="#2563eb" />
              <TextInput
                placeholder="Admin Email"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={adminEmail}
                onChangeText={setAdminEmail}
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#2563eb" />
              <TextInput
                placeholder="Admin Password"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry
              />
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmDeleteManager}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirm Removal</Text>
              )}
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
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
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    backgroundColor: "#fff",
    elevation: 3,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },

  scrollContent: { padding: 20 },

  countBox: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 25,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 25,
  },

  countText: {
    fontSize: 18,
    color: "#2563eb",
    fontWeight: "600",
    marginTop: 10,
  },

  countNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e3a8a",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  value: {
    fontSize: 16,
    marginLeft: 10,
    color: "#111827",
    fontWeight: "500",
  },

  noData: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
    color: "#777",
  },

  removeBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  removeText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },

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

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    width: "100%",
  },

  input: {
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
