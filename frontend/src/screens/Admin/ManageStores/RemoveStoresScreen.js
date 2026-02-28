import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function RemoveStoresScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const LIMIT = 3;

  // Fetch Stores with Pagination
  const fetchStores = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const { data } = await api.get(
        `/auth/admin/get-all-stores?page=${page}&limit=${LIMIT}`,
      );

      if (data.success) {
        const newStores = Array.isArray(data.stores[0])
          ? data.stores.flat()
          : data.stores;

        setStores((prev) => {
          const combined = [...prev, ...newStores];

          const unique = combined.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.storeId === item.storeId),
          );

          return unique;
        });

        setFilteredStores((prev) => {
          const combined = [...prev, ...newStores];

          const unique = combined.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.storeId === item.storeId),
          );

          return unique;
        });

        setHasMore(data.hasMore);
        setCount(data.count || 0);
        setPage((prev) => prev + 1);
      } else {
        setAlertMessage("Failed to fetch stores!");
        setAlertVisible(true);
      }
    } catch (error) {
      setAlertMessage("Error fetching stores!");
      setAlertVisible(true);
    }

    setLoading(false);
    setInitialLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, [page]);

  // Search Filter
  useEffect(() => {
    const text = search.toLowerCase();

    const filtered = stores.filter((store) => {
      const id = store?.storeId?.toLowerCase() || "";
      const name = store?.name?.toLowerCase() || "";

      return id.includes(text) || name.includes(text);
    });

    setFilteredStores(filtered);
  }, [search, stores]);

  // Remove Store
  const confirmRemoval = async () => {
    if (!adminEmail || !adminPassword) {
      setAlertMessage("Please enter your credentials!");
      setAlertVisible(true);
      return;
    }

    try {
      const res = await api.delete(
        `/auth/admin/delete-store/${selectedStore.storeId}`,
        {
          data: { adminEmail, adminPassword },
        },
      );

      if (!res.data.success) {
        setAlertMessage(res.data.message);
        setAlertVisible(true);
        return;
      }

      const updated = stores.filter((s) => s.storeId !== selectedStore.storeId);

      setStores(updated);
      setFilteredStores(updated);

      setModalVisible(false);
      setAdminEmail("");
      setAdminPassword("");

      setAlertMessage("Store removed successfully!");
      setAlertVisible(true);
    } catch (error) {
      setAlertMessage("Error removing store!");
      setAlertVisible(true);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <MaterialIcons name="store" size={24} color="#2563eb" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSub}>ID: {item.storeId}</Text>
          <Text style={styles.cardSub}>Location: {item.storeLocation}</Text>
          <Text style={styles.cardSub}>Contact: {item.contactNumber}</Text>
          <Text style={styles.cardSub}>Email: {item.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => {
          setSelectedStore(item);
          setModalVisible(true);
        }}
      >
        <MaterialIcons name="delete" size={22} color="#fff" />
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

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

      {/* Search */}
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={22} color="#2563eb" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Store ID or Name..."
          placeholderTextColor="#7e7c7c"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {initialLoading ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 50 }}
        />
      ) : filteredStores.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <MaterialIcons name="store" size={100} color="#555" />
          <Text style={{ textAlign: "center", color: "#555", fontSize: 21 }}>
            No stores found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStores}
          keyExtractor={(item, index) =>
            item.storeId ? `${item.storeId}-${index}` : index.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          onEndReached={fetchStores}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading ? <ActivityIndicator size="small" /> : null
          }
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Verify Your Identity</Text>

            <View style={styles.inputBox}>
              <MaterialIcons name="email" size={22} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Admin Email"
                placeholderTextColor="#7e7c7c"
                value={adminEmail}
                onChangeText={setAdminEmail}
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialIcons name="lock" size={22} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Admin Password"
                placeholderTextColor="#7e7c7c"
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
    marginTop: 14,
    marginHorizontal: 10,
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
