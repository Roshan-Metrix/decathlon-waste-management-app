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
import DropDownPicker from "react-native-dropdown-picker";
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

export default function AddMaterialMappingScreen({ route, navigation }) {
  // Dropdown states
  const [regionOpen, setRegionOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(
    route?.params?.region || null
  );
  const [regionItems, setRegionItems] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);

  const [vendorOpen, setVendorOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(
    route?.params?.vendorId || null
  );
  const [vendorItems, setVendorItems] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  // Mappings state
  const [mappings, setMappings] = useState([
    { materialType: "", officialMaterialType: "" },
  ]);
  const [isExistingMapping, setIsExistingMapping] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Submission & alert states
  const [submitting, setSubmitting] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch Regions on mount
  const fetchRegions = async () => {
    try {
      setRegionsLoading(true);
      const { data } = await api.get("/auth/get-regions");
      if (data?.success && Array.isArray(data.regions)) {
        const formatted = data.regions.map((r) => ({
          label: r,
          value: r,
        }));
        setRegionItems(formatted);
      }
    } catch (error) {
      console.log("Fetch Regions Error:", error?.message);
    } finally {
      setRegionsLoading(false);
    }
  };

  // Fetch Vendors on mount
  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const { data } = await api.get("/vendor/get-all-vendors?limit=100");
      if (data?.success && Array.isArray(data.vendors)) {
        const formatted = data.vendors.map((v) => ({
          label: v.name + (v.state ? ` (${v.state})` : ""),
          value: v._id,
        }));
        setVendorItems(formatted);
      }
    } catch (error) {
      console.log("Fetch Vendors Error:", error?.message);
    } finally {
      setVendorsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
    fetchVendors();
  }, []);

  // When Region and Vendor are both selected, check for existing mappings or regional materials
  useEffect(() => {
    if (selectedRegion && selectedVendor) {
      fetchExistingMappingOrRates(selectedRegion, selectedVendor);
    } else {
      setIsExistingMapping(false);
    }
  }, [selectedRegion, selectedVendor]);

  const fetchExistingMappingOrRates = async (region, vendorId) => {
    setCheckingExisting(true);
    try {
      // 1. Check if mapping already exists
      const mappingRes = await api.get(
        `/auth/get-material-mapping/${region}/${vendorId}`
      );

      if (
        mappingRes.data?.success &&
        Array.isArray(mappingRes.data.data?.materials) &&
        mappingRes.data.data.materials.length > 0
      ) {
        setMappings(
          mappingRes.data.data.materials.map((m) => ({
            materialType: m.materialType || "",
            officialMaterialType: m.officialMaterialType || "",
          }))
        );
        setIsExistingMapping(true);
        setCheckingExisting(false);
        return;
      }

      setIsExistingMapping(false);

      // 2. If no mapping exists yet, check regional materials for pre-filling store material names
      try {
        const regionalRes = await api.get(
          `/auth/get-regional-materials/${region}/${vendorId}`
        );
        if (
          regionalRes.data?.success &&
          Array.isArray(regionalRes.data?.materials) &&
          regionalRes.data.materials.length > 0
        ) {
          const autoFilled = regionalRes.data.materials.map((item) => {
            const matName = item.includes(":")
              ? item.split(":")[0].trim()
              : item.trim();
            return {
              materialType: matName,
              officialMaterialType: "",
            };
          });
          setMappings(autoFilled);
          setCheckingExisting(false);
          return;
        }
      } catch {
        // No regional rates or 404, fall back to empty row
      }

      setMappings([{ materialType: "", officialMaterialType: "" }]);
    } catch (err) {
      console.log("Check Existing Mapping Error:", err?.message);
      setMappings([{ materialType: "", officialMaterialType: "" }]);
      setIsExistingMapping(false);
    } finally {
      setCheckingExisting(false);
    }
  };

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
    if (!selectedRegion) {
      setAlertMessage("Please select a Region.");
      setAlertVisible(true);
      return;
    }

    if (!selectedVendor) {
      setAlertMessage("Please select a Vendor.");
      setAlertVisible(true);
      return;
    }

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

      const res = await api.post(
        `/auth/add-material-mapping/${selectedRegion.trim()}/${selectedVendor}`,
        payload
      );

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
        "Failed to save material mappings. Please check if material rates are configured for this Region and Vendor.";
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
            <Text style={styles.heroTitle}>Material Mapping Hub</Text>
            <Text style={styles.heroSubtitle}>
              Map localized store waste names to Decathlon&apos;s standard
              material catalog for uniform reporting and tracking.
            </Text>
          </View>

          {/* SELECTORS SECTION */}
          <View
            style={[
              styles.sectionCard,
              {
                zIndex: regionOpen ? 5000 : vendorOpen ? 4000 : 1,
                elevation: regionOpen ? 5000 : vendorOpen ? 4000 : 2,
              },
            ]}
          >
            <Text style={styles.sectionLabel}>Configuration Scope</Text>

            {/* Region Dropdown */}
            <Text style={styles.inputLabel}>Select Region</Text>
            <View
              style={[
                styles.dropdownWrapper,
                {
                  zIndex: regionOpen ? 5000 : 1,
                  elevation: regionOpen ? 5000 : 1,
                },
              ]}
            >
              <MaterialIcons
                name="location-on"
                size={22}
                color="#2563eb"
                style={styles.dropdownLeadingIcon}
              />
              <DropDownPicker
                open={regionOpen}
                value={selectedRegion}
                items={regionItems}
                setOpen={(val) => {
                  setRegionOpen(val);
                  if (val) setVendorOpen(false);
                }}
                onOpen={() => setVendorOpen(false)}
                setValue={setSelectedRegion}
                setItems={setRegionItems}
                placeholder={
                  regionsLoading ? "Loading regions..." : "Choose a Region"
                }
                loading={regionsLoading}
                listMode="SCROLLVIEW"
                scrollViewProps={{ nestedScrollEnabled: true }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                arrowIconContainerStyle={styles.arrowIconContainer}
                zIndex={5000}
                zIndexInverse={1000}
                dropDownDirection="BOTTOM"
                maxHeight={200}
              />
            </View>

            {/* Vendor Dropdown */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>
              Select Vendor
            </Text>
            <View
              style={[
                styles.dropdownWrapper,
                {
                  zIndex: vendorOpen ? 4000 : 1,
                  elevation: vendorOpen ? 4000 : 1,
                },
              ]}
            >
              <MaterialIcons
                name="business"
                size={22}
                color="#2563eb"
                style={styles.dropdownLeadingIcon}
              />
              <DropDownPicker
                open={vendorOpen}
                value={selectedVendor}
                items={vendorItems}
                setOpen={(val) => {
                  setVendorOpen(val);
                  if (val) setRegionOpen(false);
                }}
                onOpen={() => setRegionOpen(false)}
                setValue={setSelectedVendor}
                setItems={setVendorItems}
                placeholder={
                  vendorsLoading ? "Loading vendors..." : "Choose a Vendor"
                }
                loading={vendorsLoading}
                listMode="SCROLLVIEW"
                scrollViewProps={{ nestedScrollEnabled: true }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                arrowIconContainerStyle={styles.arrowIconContainer}
                zIndex={4000}
                zIndexInverse={2000}
                dropDownDirection="BOTTOM"
                maxHeight={200}
              />
            </View>

            {/* Status indicator badge */}
            {checkingExisting && (
              <View style={[styles.infoBadge, { zIndex: 1, elevation: 1 }]}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.infoBadgeText}>
                  Checking existing configurations...
                </Text>
              </View>
            )}

            {!checkingExisting && isExistingMapping && (
              <View
                style={[
                  styles.infoBadge,
                  styles.existingBadge,
                  { zIndex: 1, elevation: 1 },
                ]}
              >
                <MaterialIcons name="edit-note" size={20} color="#059669" />
                <Text style={[styles.infoBadgeText, { color: "#065f46" }]}>
                  Existing mapping detected. Updates will overwrite.
                </Text>
              </View>
            )}
          </View>

          {/* MAPPING ROWS SECTION */}
          <View style={[styles.mappingsCard, { zIndex: 1, elevation: 1 }]}>
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

                {/* Field 1: Store/Regional Material Type */}
                <View style={styles.fieldBox}>
                  <Text style={styles.fieldLabel}>
                    Store / Regional Material Name
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
                      placeholder="e.g. Carton, Film LDPE"
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
                  {isExistingMapping ? "Update Material Mappings" : "Save Material Mappings"}
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
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    overflow: "visible",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 12,
  },
  sectionSublabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  dropdownWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingLeft: 10,
    position: "relative",
    overflow: "visible",
  },
  dropdownLeadingIcon: {
    marginRight: 6,
  },
  dropdown: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: "transparent",
    minHeight: 46,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    elevation: 5000,
    zIndex: 5000,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  dropdownText: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#9ca3af",
  },
  arrowIconContainer: {
    marginRight: 8,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 14,
    gap: 8,
  },
  existingBadge: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  infoBadgeText: {
    fontSize: 13,
    color: "#1d4ed8",
    fontWeight: "500",
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
    marginBottom: 14,
  },
  addPairBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addPairText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  pairCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pairBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e40af",
  },
  removeRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 6,
    gap: 2,
  },
  removeRowText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
  fieldBox: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 9,
    paddingHorizontal: 10,
    height: 44,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
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
    backgroundColor: "#e2e8f0",
  },
  connectorPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    marginHorizontal: 8,
  },
  connectorText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3730a3",
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  chipsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipSelected: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#475569",
  },
  chipTextSelected: {
    color: "#15803d",
    fontWeight: "700",
  },
  bottomAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  bottomAddBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#1e40af",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    gap: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});