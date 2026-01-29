import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";

export default function ViewManagersScreen({ navigation }) {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchManagers = async () => {
    try {
      const { data } = await api.get("/auth/get-all-managers");

      if (data.success) {
        setManagers(data.managers);
        setFilteredManagers(data.managers);
      }
    } catch (err) {
      console.log("Fetch Managers Error:", err.message);
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
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
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
                <MaterialIcons name="confirmation-number" size={22} color="#2563eb" />
                <Text style={styles.value}>{m.storeName}</Text>
              </View>

              <View style={styles.row}>
                <MaterialIcons name="location-pin" size={22} color="#2563eb" />
                <Text style={styles.value}>{m.storeLocation}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

/* ---------------------- STYLES ---------------------- */
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
});
