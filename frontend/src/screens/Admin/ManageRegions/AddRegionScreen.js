
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";

import Alert from "../../../Components/Alert";
import api from "../../../api/api";

const MATERIAL_SUGGESTIONS = [
  "Defective Products",
  "Hazardous Waste",
  "Recycling Cardboard",
  "Recycling E Waste",
  "Recycling Glass",
  "Recycling Hangers",
  "Return Hangers",
  "Recycling Metal",
  "Recycling Mixed Packaging",
  "Recycling Organic",
  "Recycling Paper",
  "Recycling Rubber",
  "Recycling Soft Plastic",
  "Recycling Textile",
  "Recycling Wood",
  "Unsegregated Waste",
  "Recycling Hard Plastic",
  "Food Waste - Expired Products",
  "Recycling Metal Mixed",
  "Recycling Wood Pallet Wood",
  "Nonrecycling Wood(Furniture)",
  "Recycling Metal Fixtures Truck Load",
  "Aluminium < 1000 kgs /> 1000 kgs",
  "LED Strips",
  "Energy Recovery",
  "Incineration",
];

export default function AddRegionScreen({ navigation }) {
  const [stateName, setStateName] = useState("");
  const [materials, setMaterials] = useState([
    { materialType: "", rate: "" },
  ]);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [vendorOpen, setVendorOpen] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [vendorsName, setVendorsName] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);

  // Add new material row
  const addMaterialField = () => {
    setMaterials((prev) => [
      ...prev,
      { materialType: "", rate: "" },
    ]);
  };

  // Handle material change
  const handleMaterialChange = (index, field, value) => {
    setMaterials((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  // Select material suggestion
  const handleSuggestionSelect = (index, suggestion) => {
    handleMaterialChange(index, "materialType", suggestion);
  };

  // Remove material row
  const removeMaterialField = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setVendorLoading(true);

      const res = await api.get("/vendor/get-all-vendors");

      if (res.data?.success && Array.isArray(res.data.vendors)) {
        const vendors = res.data.vendors.map((v) => ({
          label: v.name,
          value: v.name,
        }));

        setVendorsName(vendors);
      }
    } catch (error) {
      console.log("Fetch Vendor Error:", error.message);
    } finally {
      setVendorLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Submit region
  const handleAddRegion = async () => {
    if (!stateName.trim()) {
      setAlertMessage("Please enter state name");
      setAlertVisible(true);
      return;
    }

    // Validate every material row
    const hasInvalidMaterial = materials.some(
      (m) =>
        !m.materialType.trim() ||
        m.rate.trim() === "" ||
        !Number.isFinite(Number(m.rate))
    );

    if (hasInvalidMaterial) {
      setAlertMessage(
        "Please enter a valid Material Type and Rate for every material"
      );
      setAlertVisible(true);
      return;
    }

    const formattedMaterials = materials.map((m) => ({
      materialType: m.materialType.trim(),
      rate: Number(m.rate),
    }));

    try {
      setLoading(true);

      const payload = {
        state: stateName.trim(),
        vendorName: vendor,
        materials: formattedMaterials,
      };

      const response = await api.post(
        "/auth/admin/add-materials",
        payload
      );

      if (response.data.success) {
        setAlertMessage(response.data.message);
        setAlertVisible(true);

        // Reset form
        setStateName("");
        setVendor(null);
        setMaterials([{ materialType: "", rate: "" }]);
      } else {
        setAlertMessage(
          response.data.message || "Something went wrong"
        );
        setAlertVisible(true);
      }
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message ||
        "Server error occurred";

      setAlertMessage(serverMessage);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color="#1e40af"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add Region</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Region Input */}
        <Text style={styles.sectionTitle}>Region</Text>

        <View style={styles.inputBox}>
          <MaterialIcons
            name="map"
            size={22}
            color="#2563eb"
          />

          <TextInput
            style={styles.input}
            placeholder="Enter Region Name"
            placeholderTextColor="#7e7c7c"
            value={stateName}
            onChangeText={setStateName}
          />
        </View>

        {/* Vendor Dropdown */}
        <View style={[styles.inputRow, styles.vendorRow]}>
          <MaterialIcons
            name="manage-accounts"
            size={22}
            color="#2563eb"
          />

          <DropDownPicker
            open={vendorOpen}
            value={vendor}
            items={vendorsName}
            setOpen={setVendorOpen}
            setValue={setVendor}
            setItems={setVendorsName}
            placeholder={
              vendorLoading
                ? "Loading vendors..."
                : "Select Vendor"
            }
            loading={vendorLoading}
            listMode="SCROLLVIEW"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            animationType="slide"
            arrowIconContainerStyle={styles.arrowIconContainer}
          />
        </View>

        {/* Materials Section */}
        <Text style={styles.sectionTitle}>Materials</Text>

        {materials.map((item, index) => {
          const filteredSuggestions =
            item.materialType.trim().length > 0
              ? MATERIAL_SUGGESTIONS.filter((suggestion) =>
                  suggestion
                    .toLowerCase()
                    .includes(item.materialType.trim().toLowerCase())
                )
              : [];

          return (
            <View key={index} style={styles.materialCard}>
              {/* Material Type */}
              <View style={styles.inputBox}>
                <MaterialIcons
                  name="category"
                  size={22}
                  color="#2563eb"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Material Type"
                  placeholderTextColor="#7e7c7c"
                  value={item.materialType}
                  onChangeText={(text) =>
                    handleMaterialChange(
                      index,
                      "materialType",
                      text
                    )
                  }
                />
              </View>

              {/* Material Suggestions */}
              {item.materialType.trim().length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>
                    Suggested Materials
                  </Text>

                  {filteredSuggestions.length > 0 ? (
                    <View style={styles.suggestionsList}>
                      {filteredSuggestions.map((suggestion) => (
                        <TouchableOpacity
                          key={suggestion}
                          style={[
                            styles.suggestionChip,
                            item.materialType === suggestion &&
                              styles.selectedSuggestionChip,
                          ]}
                          onPress={() =>
                            handleSuggestionSelect(
                              index,
                              suggestion
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.suggestionText,
                              item.materialType === suggestion &&
                                styles.selectedSuggestionText,
                            ]}
                          >
                            {suggestion}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noSuggestionText}>
                      No matching suggestions. You can use a custom material name.
                    </Text>
                  )}
                </View>
              )}

              {/* Rate Input - Restored */}
              <View style={styles.inputBox}>
                <MaterialIcons
                  name="currency-rupee"
                  size={22}
                  color="#2563eb"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Rate"
                  placeholderTextColor="#7e7c7c"
                  keyboardType="decimal-pad"
                  value={item.rate}
                  onChangeText={(text) =>
                    handleMaterialChange(index, "rate", text)
                  }
                />

                <Text style={styles.unitText}>/ kg</Text>
              </View>

              {/* Remove Material */}
              {materials.length > 1 && (
                <TouchableOpacity
                  style={styles.removeMaterialBtn}
                  onPress={() => removeMaterialField(index)}
                >
                  <MaterialIcons
                    name="delete"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.removeMaterialText}>
                    Remove
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Add Material Button */}
        <TouchableOpacity
          style={styles.addMaterialBtn}
          onPress={addMaterialField}
        >
          <MaterialIcons
            name="add"
            size={22}
            color="#fff"
          />

          <Text style={styles.addMaterialText}>
            Add More Material
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            loading && { opacity: 0.7 },
          ]}
          onPress={handleAddRegion}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>
              Save Region
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Alert */}
      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

// Styles
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
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 10,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
    paddingVertical: 0,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    position: "relative",
    width: "100%",
  },

  vendorRow: {
    zIndex: 1000,
    marginBottom: 20,
  },

  dropdown: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: "transparent",
    minHeight: 40,
  },

  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    width: "96%",
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
  },

  dropdownText: {
    fontSize: 15,
    color: "#333",
  },

  arrowIconContainer: {
    marginRight: 10,
  },

  materialCard: {
    backgroundColor: "#eaf0ff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  // Suggestions
  suggestionsContainer: {
    marginTop: -8,
    marginBottom: 15,
  },

  suggestionsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
    marginLeft: 4,
  },

  suggestionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  suggestionChip: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  selectedSuggestionChip: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  suggestionText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },

  selectedSuggestionText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  noSuggestionText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },

  // Rate
  unitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },

  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 5,
  },

  // Remove Material
  removeMaterialBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 5,
  },

  removeMaterialText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },

  // Add Material
  addMaterialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  addMaterialText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },

  // Submit
  submitBtn: {
    backgroundColor: "#1e40af",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
