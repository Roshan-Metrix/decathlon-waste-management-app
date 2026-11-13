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
import { FeatureCard } from "../../Components/FeatureCard";

export default function MaterialMappingScreen({ navigation }) {

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
        <Text style={styles.headerTitle}>Material Mapping</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Body */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="route" size={60} color="#1e40af" />
          </View>
          <Text style={styles.subTitle}>Material Mapping Hub</Text>
          <Text style={styles.desc}>
            Efficiently map the store material names to original Decathlon material names.
          </Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionSectionTitle}>Quick Actions</Text>

          <FeatureCard
            title="Add Material Mapping"
            description="Map store waste materials to Decathlon standard catalog."
            iconName="add-business"
            iconColor="#22c55e" 
            onPress={() => navigation.navigate("AddMaterialMappingScreen")}
          />

          <FeatureCard
            title="View Material Mappings"
            description="Access the complete list and detailed information."
            iconName="visibility"
            iconColor="#2563eb" 
            onPress={() => navigation.navigate("ViewMaterialMappingScreen")}
          />

          <FeatureCard
            title="Remove Material Mapping"
            description="Permanently delete a material mapping from the database."
            iconName="delete-forever"
            iconColor="#ef4444" 
            onPress={() => navigation.navigate("RemoveMaterialMappingScreen")}
          />
        </View>
      </ScrollView>
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
});
