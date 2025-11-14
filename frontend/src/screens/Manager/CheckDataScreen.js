// import FeatureLayout from "../../Components/FeatureLayout";

// export default function CheckDataScreen({ navigation }) {
//   return <FeatureLayout navigation={navigation} title="Datas" icon="assignment" />;
// }

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function CheckDataScreen({ navigation }) {
  const [records, setRecords] = useState([
    { id: 1, title: "Sales Record - Store A", date: "12 Nov 2025", status: "Verified" },
    { id: 2, title: "Inventory Report - Store B", date: "11 Nov 2025", status: "Pending" },
    { id: 3, title: "Customer Feedback Summary", date: "10 Nov 2025", status: "Under Review" },
  ]);

  const handleRefresh = () => {
    console.log("Refreshing records...");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datas</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Data List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {records.map((item) => (
          <View key={item.id} style={styles.dataCard}>
            <View style={styles.dataHeader}>
              <MaterialIcons name="assignment" size={26} color="#2563eb" />
              <Text style={styles.dataTitle}>{item.title}</Text>
            </View>

            <View style={styles.dataInfo}>
              <Text style={styles.dataDate}>📅 {item.date}</Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status === "Verified"
                    ? styles.verified
                    : item.status === "Pending"
                    ? styles.pending
                    : styles.review,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={22} color="#2563eb" />
        <Text style={styles.infoText}>
          All records are regularly updated by the admin. Please verify data before submission.
        </Text>
      </View>
    </View>
  );
}

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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  dataCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  dataHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  dataInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dataDate: {
    color: "#6b7280",
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verified: {
    backgroundColor: "#dcfce7",
  },
  pending: {
    backgroundColor: "#fee2e2",
  },
  review: {
    backgroundColor: "#fef9c3",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    margin: 20,
  },
  infoText: {
    color: "#1e3a8a",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
