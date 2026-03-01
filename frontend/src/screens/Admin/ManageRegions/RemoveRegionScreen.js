import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function RemoveRegionScreen({ navigation }) {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  //  FETCH REGIONS 
  const fetchRegions = async () => {
    try {
      const { data } = await api.get("/auth/get-regions");

      if (data.success) {
        setRegions(data.regions);
      }
    } catch (error) {
      setAlertMessage("Failed to fetch regions");
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  //  DELETE REGION 
  const confirmDeleteRegion = async () => {
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

    //  DELETE REGION 
    const deleteRes = await api.delete(
      `/auth/admin/delete-region/${selectedRegion}`
    );

    if (!deleteRes.data.success) {
      setDeleting(false);
      setAlertMessage(deleteRes.data.message || "Delete failed");
      setAlertVisible(true);
      return;
    }

    setRegions((prev) =>
      prev.filter((region) => region !== selectedRegion)
    );

    setAlertMessage("Region deleted successfully!");
    setAlertVisible(true);

    // Reset modal & credentials
    setAdminEmail("");
    setAdminPassword("");
    setModalVisible(false);

  } catch (err) {
    setAlertMessage("Something went wrong!");
    setAlertVisible(true);
  } finally {
    setDeleting(false);
  }
};

  //  RENDER REGION CARD 
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.regionRow}>
        <MaterialIcons name="location-on" size={22} color="#2563eb" />
        <Text style={styles.regionName}>{item}</Text>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => {
          setSelectedRegion(item);
          setModalVisible(true);
        }}
      >
        <MaterialIcons name="delete" size={20} color="#fff" />
        <Text style={styles.removeText}>Remove Region</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/*  Header  */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Remove Region</Text>

        <View style={{ width: 30 }} />
      </View>

      {/*  Content  */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={regions}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchRegions();
              }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No regions available</Text>
          }
        />
      )}

      {/*  Credential Verification Modal  */}
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
              onPress={confirmDeleteRegion}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirm Deletion</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    elevation: 8,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e3a8a",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    elevation: 4,
  },

  regionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  regionName: {
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
    color: "#1e293b",
  },

  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    borderRadius: 10,
  },

  removeText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 15,
    color: "#64748b",
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