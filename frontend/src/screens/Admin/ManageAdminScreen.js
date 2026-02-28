import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Alert from "../../Components/Alert";
import { FeatureCard } from "../../Components/FeatureCard";

export default function ManageAdminScreen({ navigation }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = () => {
    setAlertMessage("This feature is coming soon!");
    setAlertVisible(true);
  };
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
        <Text style={styles.headerTitle}>Admin Access Hub</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="security" size={60} color="#1e40af" />
          </View>
          <Text style={styles.subTitle}>System Administrator Panel</Text>
          <Text style={styles.desc}>
            This portal is exclusively for managing and maintaining the
            highest-level system administrators. Handle with care.
          </Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionSectionTitle}>Privilege Management</Text>

          <FeatureCard
            title="Add New Admin"
            description="Grant top-level access to a new user account."
            iconName="person-add"
            iconColor="#10b981"
            onPress={() => navigation.navigate("AddAdminsScreen")}
          />

          <FeatureCard
            title="View All Admins"
            description="View a list of all current administrators and their statuses."
            iconName="people"
            iconColor="#3b82f6"
            onPress={() => navigation.navigate("ViewOtherAdminsScreen")}
          />

          <FeatureCard
            title="Restrict Admin Access"
            description="Remove administrative privileges from an existing account."
            iconName="no-accounts"
            iconColor="#ef4444"
            onPress={() => navigation.navigate("RestrictAdminAccessScreen")}
          />
        </View>

        {/* Info Section - Styled as a prominent Callout */}
        <View style={styles.calloutBox}>
          <MaterialIcons
            name="admin-panel-settings"
            size={22}
            color="#1e40af"
          />
          <Text style={styles.calloutText}>
            Administrative privileges grant full, unrestricted control over user
            roles, settings, and application data.
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
  // --- Header ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 50 : 60,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
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
  // --- Callout Box Style (Info Section) ---
  calloutBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e0e7ff", // Light blue background
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
