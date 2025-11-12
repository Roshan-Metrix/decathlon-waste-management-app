// import FeatureLayout from "../../Components/FeatureLayout";

// export default function ExportDataScreen({ navigation }) {
//   return <FeatureLayout navigation={navigation} title="Export Data" icon="import-export" />;
// }

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ExportDataScreen({ navigation }) {
  const handleExport = (type) => {
    Alert.alert("Export Started", `Exporting data as ${type}...`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export Data</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Choose Export Format</Text>

        {/* Export Options */}
        <TouchableOpacity
          style={[styles.exportBox, { borderLeftColor: "#22c55e" }]}
          onPress={() => handleExport("CSV")}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="table-view" size={34} color="#22c55e" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.exportTitle}>Export as CSV</Text>
            <Text style={styles.exportDesc}>
              Save your data in comma-separated format. Easy for spreadsheets and databases.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportBox, { borderLeftColor: "#2563eb" }]}
          onPress={() => handleExport("Excel")}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="grid-on" size={34} color="#2563eb" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.exportTitle}>Export as Excel</Text>
            <Text style={styles.exportDesc}>
              Download data in Excel (.xlsx) format with full table structure.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportBox, { borderLeftColor: "#dc2626" }]}
          onPress={() => handleExport("PDF")}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="picture-as-pdf" size={34} color="#dc2626" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.exportTitle}>Export as PDF</Text>
            <Text style={styles.exportDesc}>
              Generate a well-formatted PDF report of your stored data.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={22} color="#2563eb" />
          <Text style={styles.infoText}>
            You can export only your authorized dataset. Make sure your internet connection is active.
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
  exportBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderLeftWidth: 6,
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
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  exportDesc: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 19,
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
