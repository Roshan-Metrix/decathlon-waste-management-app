import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";

export default function ViewOtherAdminsScreen({ navigation }) {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      const { data } = await api.get("/auth/admin/get-all-admins");

      if (data.success) {
        setAdmins(data.admins || []);
        setFilteredAdmins(data.admins || []);
        setTotalCount(data.count || 0);
      }
    } catch (err) {
      console.log("Fetch Admins Error:", err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  //  Filter Logic
  const handleSearch = (text) => {
    setSearchText(text);

    const filtered = admins.filter(
      (item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.email.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredAdmins(filtered);
  };

  return (
    <View style={styles.container}>
      {/* ------- Header ------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Other Admins</Text>

        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 40 }}
        />
      ) : (
        <>
          {/* ------- Total Admins Summary Card ------- */}
          <View style={styles.summaryCard}>
            <MaterialIcons name="groups" size={32} color="#2563eb" />
            <View style={{ marginLeft: 20 }}>
              <Text style={styles.summaryTitle}>Total Admins</Text>
              <Text style={styles.summaryCount}>{totalCount}</Text>
            </View>
          </View>

          {/* ------- Search Bar ------- */}
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={22} color="#2563eb" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>

          {/* ------- Admin List ------- */}
          <FlatList
            data={filteredAdmins}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <Text style={styles.noData}>No matching admins found.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>

                <MaterialIcons
                  name="admin-panel-settings"
                  size={26}
                  color="#2563eb"
                />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

/* ----------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
    elevation: 2,
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
  },

  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },

  summaryTitle: {
    fontSize: 16,
    color: "#555",
  },

  summaryCount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2563eb",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  email: {
    fontSize: 14,
    marginTop: 3,
    color: "#555",
  },

  noData: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777",
  },
});
