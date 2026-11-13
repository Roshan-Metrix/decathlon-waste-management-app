import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

// Quick suggestions for Decathlon standard waste categories
const OFFICIAL_MATERIAL_SUGGESTIONS = [
  "Carton / Cardboard",
  "Clear Film (LDPE)",
  "Coloured Film",
  "Mixed Plastic",
  "Rigid Plastic (PP/HDPE)",
  "Wood / Pallets",
  "Metal / Iron",
  "Organic / Food Waste",
  "General Non-Recyclable",
  "Paper / Office Waste",
  "Textile Waste",
  "E-Waste / Electrical",
];

export default function AddMaterialMappingScreen({ navigation }) {
  // Mappings state
  const [mappings, setMappings] = useState([
    { materialType: "", officialMaterialType: "" },
  ]);
  const [isExistingMapping, setIsExistingMapping] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Submission & alert states
  const [submitting, setSubmitting] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch Existing Global Material Mapping on Mount
  const fetchExistingMapping = async () => {
    try {
      setLoadingExisting(true);
      const res = await api.get("/auth/get-material-mapping");

      if (
        res.data?.success &&
        Array.isArray(res.data.data?.materials) &&
        res.data.data.materials.length > 0
      ) {
        setMappings(
          res.data.data.materials.map((m) => ({
            materialType: m.materialType || "",
            officialMaterialType: m.officialMaterialType || "",
          }))
        );
        setIsExistingMapping(true);
      } else {
        setMappings([{ materialType: "", officialMaterialType: "" }]);
        setIsExistingMapping(false);
      }
    } catch (err) {
      console.log("Fetch Global Mapping Error:", err?.message);
      setMappings([{ materialType: "", officialMaterialType: "" }]);
      setIsExistingMapping(false);
    } finally {
      setLoadingExisting(false);
    }
  };

  useEffect(() => {
    fetchExistingMapping();
  }, []);

  // Add a new row
  const handleAddRow = () => {
    setMappings((prev) => [
      ...prev,
      { materialType: "", officialMaterialType: "" },
    ]);
  };

  // Remove a row
  const handleRemoveRow = (index) => {
    if (mappings.length <= 1) {
      setAlertMessage("At least one material mapping row is required.");
      setAlertVisible(true);
      return;
    }
    setMappings((prev) => prev.filter((_, i) => i !== index));
  };

  // Update a field in a row
  const handleUpdateRow = (index, field, value) => {
    setMappings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Save / Submit mappings to backend
  const handleSubmit = async () => {
    const filteredMaterials = mappings
      .map((m) => ({
        materialType: m.materialType.trim(),
        officialMaterialType: m.officialMaterialType.trim(),
      }))
      .filter((m) => m.materialType || m.officialMaterialType);

    if (filteredMaterials.length === 0) {
      setAlertMessage("Please enter at least one material mapping.");
      setAlertVisible(true);
      return;
    }

    // Verify all rows are complete
    for (let i = 0; i < filteredMaterials.length; i++) {
      const item = filteredMaterials[i];
      if (!item.materialType || !item.officialMaterialType) {
        setAlertMessage(
          `Row #${i + 1} is incomplete. Both Store Material and Official Material names are required.`
        );
        setAlertVisible(true);
        return;
      }
    }

    // Check for duplicate store material types
    const types = filteredMaterials.map((m) => m.materialType.toLowerCase());
    const uniqueTypes = new Set(types);
    if (uniqueTypes.size !== types.length) {
      setAlertMessage(
        "Duplicate Store Material types found. Each store material must be unique."
      );
      setAlertVisible(true);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        materials: filteredMaterials,
      };

      const res = await api.post("/auth/add-material-mapping", payload);

      if (res.data?.success) {
        setAlertMessage(
          res.data.message || "Material mappings saved successfully!"
        );
        setAlertVisible(true);
        setIsExistingMapping(true);
      } else {
        setAlertMessage(res.data?.message || "Failed to save material mappings.");
        setAlertVisible(true);
      }
    } catch (err) {
      console.log("Save Mapping Error:", err);
      const serverMessage =
        err?.response?.data?.message ||
        "Failed to save material mappings. Please check your network connection.";
      setAlertMessage(serverMessage);
      setAlertVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isExistingMapping ? "Edit Material Mapping" : "Add Material Mapping"}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          removeClippedSubviews={false}
        >
          {/* HERO BANNER */}
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="alt-route" size={38} color="#2563eb" />
            </View>
            <Text style={styles.heroTitle}>Global Material Mapping</Text>
            <Text style={styles.heroSubtitle}>
              Map localized store waste names to Decathlon&apos;s standard
              material catalog for uniform reporting across all stores and vendors.
            </Text>
          </View>

          {/* STATUS / SCOPE CARD */}
          <View style={styles.scopeCard}>
            <View style={styles.scopeHeader}>
              <MaterialIcons name="public" size={22} color="#2563eb" />
              <Text style={styles.scopeTitle}>Global Scope Configuration</Text>
            </View>

            {loadingExisting ? (
              <View style={styles.infoBadge}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.infoBadgeText}>
                  Loading existing global material mappings...
                </Text>
              </View>
            ) : isExistingMapping ? (
              <View style={[styles.infoBadge, styles.existingBadge]}>
                <MaterialIcons name="verified" size={20} color="#059669" />
                <Text style={[styles.infoBadgeText, { color: "#065f46" }]}>
                  Active global mapping loaded ({mappings.length} pairs). Saving will update the global catalog.
                </Text>
              </View>
            ) : (
              <View style={[styles.infoBadge, styles.newBadge]}>
                <MaterialIcons name="info-outline" size={20} color="#2563eb" />
                <Text style={[styles.infoBadgeText, { color: "#1e40af" }]}>
                  No global mapping saved yet. Define your mapping pairs below to establish the global catalog.
                </Text>
              </View>
            )}
          </View>

          {/* MAPPING ROWS SECTION */}
          <View style={styles.mappingsCard}>
            <View style={styles.mappingSectionHeader}>
              <View>
                <Text style={styles.sectionLabel}>Material Pairs</Text>
                <Text style={styles.sectionSublabel}>
                  {mappings.length} mapping {mappings.length === 1 ? "pair" : "pairs"} configured
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addPairBtn}
                onPress={handleAddRow}
              >
                <MaterialIcons name="add" size={18} color="#2563eb" />
                <Text style={styles.addPairText}>Add Row</Text>
              </TouchableOpacity>
            </View>

            {mappings.map((row, index) => (
              <View key={index} style={styles.pairCard}>
                {/* Row Header */}
                <View style={styles.pairHeader}>
                  <View style={styles.pairBadge}>
                    <Text style={styles.pairBadgeText}>#{index + 1}</Text>
                  </View>

                  {mappings.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveRow(index)}
                      style={styles.removeRowBtn}
                    >
                      <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                      <Text style={styles.removeRowText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Field 1: Store Material Type */}
                <View style={styles.fieldBox}>
                  <Text style={styles.fieldLabel}>
                    Store / Local Material Name
                  </Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="storefront"
                      size={20}
                      color="#2563eb"
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Cardboard, Clear Plastic"
                      placeholderTextColor="#9ca3af"
                      value={row.materialType}
                      onChangeText={(val) =>
                        handleUpdateRow(index, "materialType", val)
                      }
                    />
                  </View>
                </View>

                {/* Connector Indicator */}
                <View style={styles.connectorRow}>
                  <View style={styles.connectorLine} />
                  <View style={styles.connectorPill}>
                    <MaterialIcons name="arrow-downward" size={16} color="#2563eb" />
                    <Text style={styles.connectorText}>Maps To Decathlon Standard</Text>
                  </View>
                  <View style={styles.connectorLine} />
                </View>

                {/* Field 2: Official Material Type */}
                <View style={styles.fieldBox}>
                  <Text style={styles.fieldLabel}>
                    Decathlon Official Material Name
                  </Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="verified"
                      size={20}
                      color="#10b981"
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Carton / Cardboard, Film LDPE"
                      placeholderTextColor="#9ca3af"
                      value={row.officialMaterialType}
                      onChangeText={(val) =>
                        handleUpdateRow(index, "officialMaterialType", val)
                      }
                    />
                  </View>
                </View>

                {/* Quick Suggestion Chips */}
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Quick Suggestions:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsScroll}
                  >
                    {OFFICIAL_MATERIAL_SUGGESTIONS.map((sug, sIdx) => {
                      const isSelected = row.officialMaterialType === sug;
                      return (
                        <TouchableOpacity
                          key={sIdx}
                          style={[
                            styles.chip,
                            isSelected && styles.chipSelected,
                          ]}
                          onPress={() =>
                            handleUpdateRow(index, "officialMaterialType", sug)
                          }
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && styles.chipTextSelected,
                            ]}
                          >
                            {sug}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            ))}

            {/* Bottom Add Row Button */}
            <TouchableOpacity
              style={styles.bottomAddBtn}
              onPress={handleAddRow}
            >
              <MaterialIcons name="add-circle-outline" size={20} color="#2563eb" />
              <Text style={styles.bottomAddBtnText}>Add Another Material Row</Text>
            </TouchableOpacity>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.submitButtonText}>Saving Mappings...</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="save" size={22} color="#ffffff" />
                <Text style={styles.submitButtonText}>
                  {isExistingMapping ? "Update Global Mappings" : "Save Global Mappings"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    elevation: 4,
    shadowColor: "#1e40af",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e40af",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconCircle: {
    backgroundColor: "#dbeafe",
    padding: 14,
    borderRadius: 40,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 320,
  },
  scopeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  scopeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  scopeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  existingBadge: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  newBadge: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  infoBadgeText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "500",
    lineHeight: 18,
  },
  mappingsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  mappingSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSublabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  addPairBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    gap: 4,
  },
  addPairText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "700",
  },
  pairCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  pairHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pairBadge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pairBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  removeRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  removeRowText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
  },
  fieldBox: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "#111827",
  },
  connectorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    justifyContent: "center",
  },
  connectorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  connectorPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 4,
    marginHorizontal: 8,
  },
  connectorText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2563eb",
    textTransform: "uppercase",
  },
  suggestionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  suggestionsTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
  },
  chipsScroll: {
    gap: 6,
  },
  chip: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipSelected: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  chipText: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#065f46",
    fontWeight: "700",
  },
  bottomAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderStyle: "dashed",
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    paddingVertical: 12,
    gap: 6,
    marginTop: 4,
  },
  bottomAddBtnText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "700",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 15,
    gap: 8,
    elevation: 3,
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
