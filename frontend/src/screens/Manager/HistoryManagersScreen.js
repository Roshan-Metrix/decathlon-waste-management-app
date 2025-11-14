// import FeatureLayout from "../../Components/FeatureLayout";

// export default function HistoryStaffScreen({ navigation }) {
//   return <FeatureLayout navigation={navigation} title="History" icon="history" />;
// }

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function HistoryManagersScreen({ navigation }) {
  const [history, setHistory] = useState([
    {
      id: 1,
      action: "Added new stock data",
      date: "12 Nov 2025, 10:42 AM",
      status: "Completed",
    },
    {
      id: 2,
      action: "Updated sales entry",
      date: "11 Nov 2025, 4:15 PM",
      status: "Approved",
    },
    {
      id: 3,
      action: "Checked store data",
      date: "10 Nov 2025, 2:32 PM",
      status: "Pending",
    },
  ]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity onPress={() => console.log("Refreshing history...")}>
          <MaterialIcons name="refresh" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Timeline */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {history.map((item, index) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="history"
                size={26}
                color="#2563eb"
                style={{ marginRight: 8 }}
              />
              <View style={styles.timelineLine} />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.actionText}>{item.action}</Text>
              <Text style={styles.dateText}>{item.date}</Text>
              <View
                style={[
                  styles.statusBadge,
                  item.status === "Completed"
                    ? styles.completed
                    : item.status === "Approved"
                    ? styles.approved
                    : styles.pending,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.footerInfo}>
        <MaterialIcons name="info-outline" size={22} color="#2563eb" />
        <Text style={styles.footerText}>
          Your recent activity log is shown here. Only authorized changes are
          displayed.
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
  historyCard: {
    flexDirection: "row",
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginRight: 12,
  },
  timelineLine: {
    width: 2,
    height: 50,
    backgroundColor: "#cbd5e1",
    marginTop: 6,
  },
  textContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  dateText: {
    color: "#6b7280",
    fontSize: 13,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completed: {
    backgroundColor: "#dcfce7",
  },
  approved: {
    backgroundColor: "#dbeafe",
  },
  pending: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    margin: 20,
  },
  footerText: {
    color: "#1e3a8a",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
