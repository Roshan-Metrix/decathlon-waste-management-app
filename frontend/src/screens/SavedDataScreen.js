import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

export default function SavedDataScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const role = user?.role?.toLowerCase() || "staff";

  // Role-based saved data
  const savedItems = useMemo(() => {
    if (role === "admin") {
      return [
        { id: "1", title: "Branch Waste Report", date: "2025-11-11", amount: "124 kg" },
        { id: "2", title: "Manager Activity Log", date: "2025-11-09", amount: "8 records" },
        { id: "3", title: "System Export Backup", date: "2025-11-07", amount: "4 files" },
      ];
    } else {
      return [
        { id: "1", title: "Store 12 Daily Report", date: "2025-11-12", amount: "54 kg" },
        { id: "2", title: "Staff Entry Summary", date: "2025-11-10", amount: "18 entries" },
        { id: "3", title: "Weekly Plastic Data", date: "2025-11-08", amount: "31 kg" },
      ];
    }
  }, [role]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Data</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* User Info */}
      <View style={styles.userBox}>
        <MaterialIcons name="person" size={26} color="#2563eb" />
        <View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userRole}>{role.toUpperCase()}</Text>
        </View>
      </View>

      {/* Saved Data List */}
      <FlatList
        data={savedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="folder" size={24} color="#2563eb" />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardText}>Date: {item.date}</Text>
              <Text style={styles.cardText}>Amount: {item.amount}</Text>
            </View>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => alert(`Viewing details for ${item.title}`)}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Empty state */}
      {savedItems.length === 0 && (
        <View style={styles.emptyBox}>
          <MaterialIcons name="inbox" size={60} color="#9ca3af" />
          <Text style={styles.emptyText}>No saved data yet.</Text>
        </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
  },
  userBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  userRole: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  cardBody: {
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: "#374151",
  },
  viewButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#6b7280",
    marginTop: 8,
    fontSize: 16,
  },
});
