import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function ViewAllStoresScreen({ navigation }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");

  const LIMIT = 3;

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

        setStores((prev) => [...prev, ...newStores]);
        setFilteredStores((prev) => [...prev, ...newStores]);
        setHasMore(data.hasMore);
        setCount(data.count || count);
        setPage((prev) => prev + 1);
      } else {
        setAlertMessage(data.message);
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
  }, []);

  // Search filter (client-side)
  useEffect(() => {
    const s = search.toLowerCase();

    const filtered = stores.filter((store) => {
      const storeId = store.storeId?.toLowerCase() || "";
      const name = store.name?.toLowerCase() || "";

      return storeId.includes(s) || name.includes(s);
    });

    setFilteredStores(filtered);
  }, [search, stores]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate("AllTransactionsScreen", {
          storeId: item.storeId,
        })
      }
      style={styles.card}
    >
      <View style={styles.row}>
        <MaterialIcons name="confirmation-number" size={22} color="#2563eb" />
        <Text style={styles.value}>{item.storeId || "N/A"}</Text>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="store" size={22} color="#2563eb" />
        <Text style={styles.value}>{item.name || "N/A"}</Text>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="location-pin" size={22} color="#2563eb" />
        <Text style={styles.value}>{item.storeLocation || "N/A"}</Text>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="phone" size={22} color="#2563eb" />
        <Text style={styles.value}>{item.contactNumber || "N/A"}</Text>
      </View>

      <View style={styles.row}>
        <MaterialIcons name="email" size={22} color="#2563eb" />
        <Text style={styles.value}>{item.email || "N/A"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Stores</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Total Count */}
      <View style={styles.countBox}>
        <MaterialIcons name="store" size={32} color="#2563eb" />
        <View>
          <Text style={styles.countLabel}>Total Stores</Text>
          <Text style={styles.countValue}>{count}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={22} color="#2563eb" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Store ID or Name"
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
      ) : (
        <FlatList
          data={filteredStores}
          keyExtractor={(item, index) => item.storeId ?? index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          onEndReached={fetchStores}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading ? <ActivityIndicator size="small" /> : null
          }
        />
      )}

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
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    elevation: 4,
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },

  countBox: {
    backgroundColor: "#e0e7ff",
    padding: 18,
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  countLabel: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },

  countValue: {
    fontSize: 26,
    fontWeight: "900",
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

  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
});
