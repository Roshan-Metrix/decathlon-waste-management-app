import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function RemoveMaterialMappingScreen({ route, navigation }) {
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

  // Mapping state
  const [mappingData, setMappingData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  // Delete & Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Alert modal
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch Regions
  const fetchRegions = async () => {
    try {
      setRegionsLoading(true);
      const { data } = await api.get("/auth/get-regions");
      if (data?.success && Array.isArray(data.regions)) {
        setRegionItems(
          data.regions.map((r) => ({
            label: r,
            value: r,
          }))
        );
      }
    } catch (err) {
      console.log("Fetch Regions Error:", err?.message);
    } finally {
      setRegionsLoading(false);
    }
  };

  // Fetch Vendors
  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const { data } = await api.get("/vendor/get-all-vendors?limit=100");
      if (data?.success && Array.isArray(data.vendors)) {
        setVendorItems(
          data.vendors.map((v) => ({
            label: v.name + (v.state ? ` (${v.state})` : ""),
            value: v._id,
          }))
        );
      }
    } catch (err) {
      console.log("Fetch Vendors Error:", err?.message);
    } finally {
      setVendorsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
    fetchVendors();
  }, []);

  // Fetch active mapping for preview before deleting
  const fetchActiveMapping = async () => {
    if (!selectedRegion || !selectedVendor) {
      setMappingData(null);
      setMaterials([]);
      setHasQueried(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(
        `/auth/get-material-mapping/${selectedRegion.trim()}/${selectedVendor}`
      );

      setHasQueried(true);

      if (data?.success && data?.data) {
        setMappingData(data.data);
        setMaterials(Array.isArray(data.data.materials) ? data.data.materials : []);
      } else {
        setMappingData(null);
        setMaterials([]);
      }
    } catch (err) {
      console.log("Fetch Active Mapping Error:", err);
      setHasQueried(true);
      setMappingData(null);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRegion && selectedVendor) {
      fetchActiveMapping();
    } else {
      setMappingData(null);
      setMaterials([]);
      setHasQueried(false);
    }
  }, [selectedRegion, selectedVendor]);

  // Handle Deletion Confirmation
  const handleDeleteMapping = async () => {
    if (!selectedRegion || !selectedVendor) {
      setAlertMessage("Please select both a Region and Vendor.");
      setAlertVisible(true);
      return;
    }

    try {
      setDeleting(true);

      const res = await api.delete(
        `/auth/delete-material-mapping/${selectedRegion.trim()}/${selectedVendor}`
      );

      if (res.data?.success) {
        setModalVisible(false);
        setMappingData(null);
        setMaterials([]);
        setAlertMessage(
          res.data.message || "Material mapping deleted successfully!"
        );
        setAlertVisible(true);
      } else {
        setAlertMessage(res.data?.message || "Failed to delete material mapping.");
        setAlertVisible(true);
      }
    } catch (err) {
      console.log("Delete Mapping Error:", err);
      const serverMessage =
        err?.response?.data?.message ||
        "Failed to delete material mapping. Please try again.";
      setAlertMessage(serverMessage);
      setAlertVisible(true);
    } finally {
      setDeleting(false);
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
        <Text style={styles.headerTitle}>Remove Material Mapping</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
      >
        {/* SELECTORS CARD */}
        <View
          style={[
            styles.selectorsCard,
            {
              zIndex: regionOpen ? 5000 : vendorOpen ? 4000 : 1,
              elevation: regionOpen ? 5000 : vendorOpen ? 4000 : 2,
            },
          ]}
        >
          <Text style={styles.selectorSectionTitle}>Target Configuration</Text>

          {/* Region Dropdown */}
          <Text style={styles.label}>Region (State)</Text>
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
              style={styles.leadingIcon}
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
          <Text style={[styles.label, { marginTop: 12 }]}>Vendor</Text>
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
              style={styles.leadingIcon}
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
        </View>

        {/* LOADING STATE */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Locating material mapping...</Text>
          </View>
        )}

        {/* PROMPT TO SELECT */}
        {!loading && (!selectedRegion || !selectedVendor) && (
          <View style={[styles.emptyStateBox, { zIndex: 1, elevation: 1 }]}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="delete-sweep" size={48} color="#2563eb" />
            </View>
            <Text style={styles.emptyStateTitle}>Select Region & Vendor</Text>
            <Text style={styles.emptyStateDesc}>
              Choose both a region and vendor above to preview the active material
              mapping before removing it.
            </Text>
          </View>
        )}

        {/* NO MAPPING FOUND */}
        {!loading &&
          selectedRegion &&
          selectedVendor &&
          hasQueried &&
          materials.length === 0 && (
            <View style={[styles.emptyStateBox, { zIndex: 1, elevation: 1 }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: "#f3f4f6" }]}>
                <MaterialIcons name="info-outline" size={48} color="#6b7280" />
              </View>
              <Text style={styles.emptyStateTitle}>No Mapping Found</Text>
              <Text style={styles.emptyStateDesc}>
                There is no active material mapping to remove for{" "}
                <Text style={{ fontWeight: "700", color: "#1f2937" }}>
                  {selectedRegion}
                </Text>{" "}
                with this vendor.
              </Text>
            </View>
          )}

        {/* ACTIVE MAPPING FOUND - READY TO REMOVE */}
        {!loading &&
          selectedRegion &&
          selectedVendor &&
          materials.length > 0 && (
            <View style={[styles.targetCard, { zIndex: 1, elevation: 1 }]}>
              {/* Target Banner */}
              <View style={styles.targetHeader}>
                <View style={styles.dangerBadge}>
                  <MaterialIcons name="warning" size={16} color="#dc2626" />
                  <Text style={styles.dangerBadgeText}>Active Mapping Located</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countNumber}>{materials.length}</Text>
                  <Text style={styles.countLabel}>Pairs</Text>
                </View>
              </View>

              <Text style={styles.targetRegion}>{selectedRegion}</Text>
              <Text style={styles.targetVendor}>
                Vendor: {mappingData?.vendor || "Selected Vendor"}
              </Text>

              {/* Mapped Materials Preview */}
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Configured Mappings Preview:</Text>
                {materials.slice(0, 5).map((m, idx) => (
                  <View key={idx} style={styles.previewRow}>
                    <Text style={styles.previewStoreText} numberOfLines={1}>
                      • {m.materialType}
                    </Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={14}
                      color="#6b7280"
                      style={{ marginHorizontal: 6 }}
                    />
                    <Text style={styles.previewOfficialText} numberOfLines={1}>
                      {m.officialMaterialType}
                    </Text>
                  </View>
                ))}
                {materials.length > 5 && (
                  <Text style={styles.moreText}>
                    + {materials.length - 5} more mapped materials
                  </Text>
                )}
              </View>

              {/* Danger Warning Note */}
              <View style={styles.warningBox}>
                <MaterialIcons name="error-outline" size={20} color="#b91c1c" />
                <Text style={styles.warningText}>
                  Deleting this mapping will remove all material correlations for
                  this Region and Vendor.
                </Text>
              </View>

              {/* REMOVE BUTTON */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="delete-forever" size={22} color="#ffffff" />
                <Text style={styles.removeButtonText}>
                  Remove Material Mapping
                </Text>
              </TouchableOpacity>
            </View>
          )}
      </ScrollView>

      {/* CONFIRMATION MODAL */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalDangerIconCircle}>
              <MaterialIcons name="delete-forever" size={36} color="#ef4444" />
            </View>

            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to permanently delete the material mapping for{" "}
              <Text style={{ fontWeight: "700", color: "#111827" }}>
                {selectedRegion}
              </Text>{" "}
              and vendor{" "}
              <Text style={{ fontWeight: "700", color: "#111827" }}>
                {mappingData?.vendor || "selected vendor"}
              </Text>
              ? This action cannot be undone.
            </Text>

            <TouchableOpacity
              style={[styles.modalConfirmBtn, deleting && { opacity: 0.7 }]}
              onPress={handleDeleteMapping}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.modalConfirmText}>Deleting...</Text>
                </>
              ) : (
                <Text style={styles.modalConfirmText}>Yes, Delete Mapping</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setModalVisible(false)}
              disabled={deleting}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  selectorsCard: {
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
  selectorSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 12,
  },
  label: {
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
  leadingIcon: {
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "600",
  },
  emptyStateBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 36,
    paddingHorizontal: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  emptyIconCircle: {
    backgroundColor: "#dbeafe",
    padding: 18,
    borderRadius: 50,
    marginBottom: 14,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateDesc: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  targetCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    shadowColor: "#dc2626",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  targetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dangerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  dangerBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#dc2626",
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: "#dc2626",
  },
  countLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#ef4444",
    textTransform: "uppercase",
  },
  targetRegion: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  targetVendor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginTop: 2,
    marginBottom: 14,
  },
  previewContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  previewStoreText: {
    flex: 1,
    fontSize: 12,
    color: "#1e3a8a",
    fontWeight: "600",
  },
  previewOfficialText: {
    flex: 1,
    fontSize: 12,
    color: "#15803d",
    fontWeight: "600",
  },
  moreText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    marginTop: 4,
    fontStyle: "italic",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fef2f2",
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#991b1b",
    lineHeight: 16,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#dc2626",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    gap: 8,
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  modalDangerIconCircle: {
    backgroundColor: "#fee2e2",
    padding: 14,
    borderRadius: 40,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  modalConfirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    width: "100%",
    paddingVertical: 13,
    borderRadius: 11,
    marginBottom: 10,
    gap: 6,
  },
  modalConfirmText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  modalCancelBtn: {
    width: "100%",
    paddingVertical: 10,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
  },
});