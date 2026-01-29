import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../api/api";
import colors from '../../../colors'
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ViewOwnStoreManagersScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredManagers, setFilteredManagers] = useState([]);

  const loadManagers = async () => {
    try {
      const storeId = await AsyncStorage.getItem("storeId");

      const res = await api.get(`/auth/manager/get-store-managers/${storeId}`);
      
      if (res.data.success) {
        setManagers(res.data.managers);
        setFilteredManagers(res.data.managers);
      }
    } catch (error) {
      console.log("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  //  Live Search Filter
  useEffect(() => {
    const q = searchQuery.toLowerCase();

    const filtered = managers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.storeName.toLowerCase().includes(q)
    );

    setFilteredManagers(filtered);
  }, [searchQuery, managers]);

  const renderManager = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.name}>{item.name}</Text>

          <Text style={styles.meta}>
            Email: <Text style={styles.highlight}>{item.email}</Text>
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Managers</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.countCard}>
        <Ionicons name="people-outline" size={28} color={colors.primary} />
        <Text style={styles.countText}>Total Managers: </Text>
        <Text style={styles.countNumber}>{filteredManagers.length}</Text>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search . . ."
        placeholderTextColor="#6b7280"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredManagers}
          keyExtractor={(item) => item._id}
          renderItem={renderManager}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },

  // ⭐ Total Count Card
  countCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
  },
  countText: {
    fontSize: 18,
    marginLeft: 10,
    color: "#1e3a8a",
    fontWeight: "700",
  },
  countNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },

  searchInput: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#111827",
  },

  card: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  email: {
    fontSize: 14,
    color: "#4b5563",
  },

  meta: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
  },

  highlight: {
    fontWeight: "600",
    color: colors.primary,
  },
});
