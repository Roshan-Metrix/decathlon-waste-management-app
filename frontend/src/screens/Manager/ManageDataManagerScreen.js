// import FeatureLayout from "../../Components/FeatureLayout";

// export default function ManageDataManagerScreen({ navigation }) {
//   return <FeatureLayout navigation={navigation} title="Manage Data" icon="folder" />;
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

export default function ManageDataManagerScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Data</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overview Section */}
        <View style={styles.overviewBox}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialIcons name="folder" size={28} color="#2563eb" />
              <Text style={styles.statValue}>124</Text>
              <Text style={styles.statLabel}>Data Entries</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="check-circle" size={28} color="#2563eb" />
              <Text style={styles.statValue}>118</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="pending-actions" size={28} color="#2563eb" />
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Action Section */}
        <Text style={styles.sectionTitle}>Manage Options</Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionBox}
            onPress={() => navigation.navigate("AddEntryScreen")}
          >
            <MaterialIcons name="add-box" size={40} color="#2563eb" />
            <Text style={styles.actionTitle}>Add New Data</Text>
            <Text style={styles.actionDesc}>
              Create and save a new record in the system.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBox}
            onPress={() => navigation.navigate("ViewEntriesScreen")}
          >
            <MaterialIcons name="visibility" size={40} color="#2563eb" />
            <Text style={styles.actionTitle}>View Entries</Text>
            <Text style={styles.actionDesc}>
              Browse, search, and filter existing data entries.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBox}
            onPress={() => navigation.navigate("EditDataScreen")}
          >
            <MaterialIcons name="edit" size={40} color="#2563eb" />
            <Text style={styles.actionTitle}>Edit Data</Text>
            <Text style={styles.actionDesc}>
              Modify or update existing records easily.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBox}
            onPress={() => navigation.navigate("DeleteDataScreen")}
          >
            <MaterialIcons name="delete-forever" size={40} color="#dc2626" />
            <Text style={[styles.actionTitle, { color: "#dc2626" }]}>
              Delete Data
            </Text>
            <Text style={styles.actionDesc}>
              Remove outdated or incorrect records permanently.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={22} color="#2563eb" />
          <Text style={styles.infoText}>
            Note: All updates are logged automatically. Ensure data accuracy
            before saving any changes.
          </Text>
        </View>
      </ScrollView>
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
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  overviewBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a8a",
    marginTop: 25,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  actionsContainer: {
    marginTop: 15,
  },
  actionBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
    marginTop: 8,
  },
  actionDesc: {
    fontSize: 13,
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
