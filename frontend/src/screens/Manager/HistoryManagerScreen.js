// import FeatureLayout from "../../Components/FeatureLayout";

// export default function HistoryManagerScreen({ navigation }) {
//   return <FeatureLayout navigation={navigation} title="History" icon="history" />;
// }

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function HistoryManagerScreen({ navigation }) {
  // Example mock history data
  const historyData = [
    {
      id: 1,
      action: "Added new staff member",
      user: "John Doe",
      time: "2 hrs ago",
      icon: "person-add",
      color: "#2563eb",
    },
    {
      id: 2,
      action: "Updated store inventory",
      user: "Manager Admin",
      time: "5 hrs ago",
      icon: "store",
      color: "#22c55e",
    },
    {
      id: 3,
      action: "Removed old data entry",
      user: "Staff User",
      time: "1 day ago",
      icon: "delete-outline",
      color: "#dc2626",
    },
    {
      id: 4,
      action: "Processed transaction",
      user: "Anita Verma",
      time: "2 days ago",
      icon: "paid",
      color: "#f59e0b",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {historyData.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.iconContainer}>
              <MaterialIcons name={item.icon} size={28} color={item.color} />
            </View>
            <View style={styles.historyDetails}>
              <Text style={styles.actionText}>{item.action}</Text>
              <Text style={styles.userText}>{item.user}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          </View>
        ))}

        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={22} color="#2563eb" />
          <Text style={styles.infoText}>
            All activities are automatically logged for transparency and audit
            purposes.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------- STYLES ----------
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
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a8a",
    marginTop: 25,
    marginBottom: 15,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  historyDetails: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  userText: {
    fontSize: 14,
    color: "#374151",
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 25,
  },
  infoText: {
    color: "#1e3a8a",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
