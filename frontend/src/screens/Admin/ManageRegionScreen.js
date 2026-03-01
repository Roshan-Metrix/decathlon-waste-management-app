import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Alert from "../../Components/Alert";
import { FeatureCard } from "../../Components/FeatureCard";

export default function ManageRegionScreen({ navigation }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1e40af" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Regions Management</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Body */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <MaterialIcons
              name="location-city"
              size={60}
              color="#1e40af"
            />
          </View>
          <Text style={styles.subTitle}>Regions Control Hub</Text>
          <Text style={styles.desc}>
            Manage all regions, including adding and managing material type and rates.
          </Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionSectionTitle}>Region Operations</Text>

          <FeatureCard
            title="Add New Region"
            description="Create a new region and assign initial material type and rates."
            iconName="add-location"
            iconColor="#22c55e" 
            onPress={() => navigation.navigate("AddRegionScreen")}
          />

          <FeatureCard
            title="View/Edit Regions"
            description="Browse region and edit material type and rates."
            iconName="location-searching"
            iconColor="#2563eb"
            onPress={() => navigation.navigate("ViewRegionScreen")}
          />

          <FeatureCard
            title="Remove Region"
            description="Deactivate or permanently delete a region."
            iconName="person-remove"
            iconColor="#ef4444"
            onPress={() => navigation.navigate("RemoveRegionScreen")}
          />
        </View>

        {/* Info Section - Now styled as a prominent Callout */}
        <View style={styles.calloutBox}>
          <MaterialIcons name="security" size={22} color="#1e40af" />
          <Text style={styles.calloutText}>
            Administrative access is required to modify user promotion status
            and security roles.
          </Text>
        </View>
      </ScrollView>
      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    // Enhanced Shadow
    shadowColor: "#1e40af",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e40af",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  // --- Hero Section ---
  heroSection: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 10,
  },
  iconCircle: {
    backgroundColor: "#dbeafe",
    padding: 25,
    borderRadius: 50,
    marginBottom: 15,
    shadowColor: "#1e40af",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  subTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
    lineHeight: 20,
    maxWidth: 350,
  },
  // --- Action Cards Container ---
  actionsContainer: {
    width: "100%",
    paddingTop: 10,
    gap: 12,
  },
  actionSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4b5563",
    marginBottom: 8,
    marginLeft: 5,
  },
  // --- New Callout Box Style ---
  calloutBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e0e7ff",
    padding: 16,
    borderRadius: 12,
    marginTop: 40,
    borderLeftWidth: 4,
    borderLeftColor: "#1e40af",
    width: "100%",
  },
  calloutText: {
    color: "#1e40af",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
