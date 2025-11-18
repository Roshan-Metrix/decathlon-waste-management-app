import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";

export default function RemoveStoresScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [search, setSearch] = useState("");

  // Fetch stores
  const getStores = async () => {
    try {
      const res = await api.get("/auth/admin/get-all-stores");

      if (res.data.success) {
        setStores(res.data.stores);
        setFilteredStores(res.data.stores);
      } else {
        alert("Failed to fetch stores");
      }
    } catch (err) {
      alert("Error fetching stores");
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    getStores();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = stores.filter((store) => {
      const text = search.toLowerCase();

      return (
        store.storeId.toString().toLowerCase().includes(text) ||
        store.name.toLowerCase().includes(text)
      );
    });

    setFilteredStores(filtered);
  }, [search, stores]);

  // Remove Store
  const confirmRemoval = async () => {
    if (!adminEmail || !adminPassword) {
      alert("Please enter admin email and password!");
      return;
    }

    try {
      const res = await api.delete(
        `/auth/admin/delete-store/${selectedStore.storeId}`,
        {
          data: {
            adminEmail,
            adminPassword,
          },
        }
      );

      if (!res.data.success) {
        alert(res.data.message);
        return;
      }

      alert("Store removed successfully!");

      const newList = stores.filter((s) => s.storeId !== selectedStore.storeId);

      setStores(newList);
      setFilteredStores(newList);

      setModalVisible(false);
      setAdminEmail("");
      setAdminPassword("");
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Remove Stores</Text>

        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>All Stores</Text>

        {/*  Search Bar */}
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={22} color="#2563eb" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Store ID or Name..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {filteredStores.map((store, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.row}>
              <MaterialIcons name="store" size={24} color="#2563eb" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.cardTitle}>{store.name}</Text>
                <Text style={styles.cardSub}>ID: {store.storeId}</Text>
                <Text style={styles.cardSub}>
                  Location: {store.storeLocation}
                </Text>
                <Text style={styles.cardSub}>
                  Contact: {store.contactNumber}
                </Text>
                <Text style={styles.cardSub}>Email: {store.email}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => {
                setSelectedStore(store);
                setModalVisible(true);
              }}
            >
              <MaterialIcons name="delete" size={22} color="#fff" />
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Verify Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Verify Your Identity</Text>

            <View style={styles.inputBox}>
              <MaterialIcons name="email" size={22} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Admin Email"
                value={adminEmail}
                onChangeText={setAdminEmail}
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialIcons name="lock" size={22} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Admin Password"
                secureTextEntry
                value={adminPassword}
                onChangeText={setAdminPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={confirmRemoval}
            >
              <Text style={styles.confirmText}>Confirm Removal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },
  content: {
    padding: 20,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
    textAlign: "center",
  },

  /*  Search Bar Style */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  cardSub: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  removeBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  removeText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 20,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    marginLeft: 10,
  },
  confirmBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  confirmText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBtn: {
    marginTop: 10,
  },
  cancelText: {
    textAlign: "center",
    fontSize: 15,
    color: "#6b7280",
  },
});
