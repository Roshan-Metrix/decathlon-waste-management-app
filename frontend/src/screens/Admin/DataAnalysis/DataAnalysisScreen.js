import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import api from "../../../api/api";

const DataAnalysisScreen = () => {
  const navigation = useNavigation();

  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [search, setSearch] = useState("");

  const [stats, setStats] = useState({
    totalStores: 0,
    totalTransactions: 0,
    totalItems: 0,
  });

  const [page, setPage] = useState(1);
  const LIMIT = 3;

  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStores = async (pageNumber = 1, refresh = false) => {
    try {
      setLoading(true);

      const { data } = await api.get(
        `/transaction/get-stores-total-transactions?page=${pageNumber}&limit=${LIMIT}`
      );

      if (data.success) {
        if (refresh || pageNumber === 1) {
          setStores(data.stores);
          setFilteredStores(data.stores);
        } else {
          setStores((prev) => [...prev, ...data.stores]);
          setFilteredStores((prev) => [...prev, ...data.stores]);
        }

        setStats({
          totalStores: data.totalStores,
          totalTransactions: data.totalTransactions,
          totalItems: data.totalItems,
        });

        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.log("Fetch stores error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStores(page);
  }, [page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchStores(1, true);
  };

  const handleSearch = (text) => {
    setSearch(text);

    if (!text) {
      setFilteredStores(stores);
      return;
    }

    const filtered = stores.filter((store) =>
      store.storeName.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredStores(filtered);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Analysis</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Dashboard Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="store" size={26} color="#2563eb" />
          <Text style={styles.statValue}>{stats.totalStores}</Text>
          <Text style={styles.statLabel}>Stores</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="receipt-long" size={26} color="#2563eb" />
          <Text style={styles.statValue}>{stats.totalTransactions}</Text>
          <Text style={styles.statLabel}>Trans.</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialIcons name="inventory" size={26} color="#2563eb" />
          <Text style={styles.statValue}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={22} color="#6b7280" />
        <TextInput
          placeholder="Search store..."
          value={search}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Store List */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredStores.length === 0 && !loading && (
          <Text style={styles.emptyText}>No stores found</Text>
        )}

        {filteredStores.map((store, index) => (
            <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("AllTransactionsScreen", {
                      storeId: store.storeId,
                    })
                  }
                  style={styles.card}
                >
            <View style={styles.cardHeader}>
              <MaterialIcons name="store" size={22} color="#2563eb" />
              <Text style={styles.storeName}>{store.storeName}</Text>
            </View>

            <View style={styles.row}>
              <MaterialIcons name="badge" size={18} color="#6b7280" />
              <Text style={styles.text}>ID: {store.storeId}</Text>
            </View>

            <View style={styles.row}>
              <MaterialIcons name="location-on" size={18} color="#6b7280" />
              <Text style={styles.text}>{store.storeLocation}</Text>
            </View>

            <View style={styles.row}>
              <MaterialIcons name="location-city" size={18} color="#6b7280" />
              <Text style={styles.text}>{store.storeState}</Text>
            </View>

            <View style={styles.row}>
              <MaterialIcons name="receipt-long" size={18} color="#6b7280" />
              <Text style={styles.text}>
                Transactions: {store.transactionCount}
              </Text>
            </View>
            </TouchableOpacity>
        ))}

        {loading && <ActivityIndicator size="large" color="#2563eb" />}

        {hasMore && !loading && filteredStores.length > 0 && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default DataAnalysisScreen;

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

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },

  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    width: "30%",
    elevation: 2,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },

  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 6,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  storeName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },

  text: {
    fontSize: 14,
    color: "#374151",
  },

  loadMoreBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  loadMoreText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
});