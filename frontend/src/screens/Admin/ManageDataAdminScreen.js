// import FeatureLayout from "../../Components/FeatureLayout";

// export default function ManageDataAdminScreen({ navigation }) {
//   return <FeatureLayout navigation={navigation} title="Manage Data" icon="folder" />;
// }

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ManageDataAdminScreen({ navigation }) {
  const handleAction = (action) => {
    alert(`You selected: ${action}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Data</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="folder" size={60} color="#2563eb" />
        </View>

        <Text style={styles.subTitle}>Admin Data Management</Text>
        <Text style={styles.desc}>
          You can perform data management operations such as viewing, editing,
          deleting, or exporting stored records.
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAction("View All Data")}
          >
            <MaterialIcons name="visibility" size={22} color="#fff" />
            <Text style={styles.actionText}>View All Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#22c55e" }]}
            onPress={() => handleAction("Edit Data")}
          >
            <MaterialIcons name="edit" size={22} color="#fff" />
            <Text style={styles.actionText}>Edit Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#f59e0b" }]}
            onPress={() => handleAction("Export Data")}
          >
            <MaterialIcons name="file-download" size={22} color="#fff" />
            <Text style={styles.actionText}>Export Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
            onPress={() => handleAction("Delete Data")}
          >
            <MaterialIcons name="delete" size={22} color="#fff" />
            <Text style={styles.actionText}>Delete Data</Text>
          </TouchableOpacity>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  iconCircle: {
    backgroundColor: "#e0e7ff",
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  desc: {
    fontSize: 15,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 25,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  actionsContainer: {
    width: "100%",
    gap: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
