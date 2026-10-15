import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function ViewMaterialMappingScreen({ route, navigation }) {
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

  // Mapping data states
  const [mappingData, setMappingData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

  // Alert state
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

  // Fetch Material Mapping when Region and Vendor are both selected
  const fetchMapping = async (isRefresh = false) => {
    if (!selectedRegion || !selectedVendor) {
      setMappingData(null);
      setMaterials([]);
      setHasQueried(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
      console.log("Fetch Mapping Error:", err);
      setHasQueried(true);
      setMappingData(null);
      setMaterials([]);
      const errMsg =
        err?.response?.data?.message || "Failed to fetch material mappings";
      setAlertMessage(errMsg);
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedRegion && selectedVendor) {
      fetchMapping();
    } else {
      setMappingData(null);
      setMaterials([]);
      setHasQueried(false);
    }
  }, [selectedRegion, selectedVendor]);

  // Client-side search filtering
  const filteredMaterials = useMemo(() => {
    if (!search.trim()) return materials;
    const q = search.toLowerCase();
    return materials.filter(
      (m) =>
        m.materialType?.toLowerCase().includes(q) ||
        m.officialMaterialType?.toLowerCase().includes(q)
    );
  }, [search, materials]);

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
        <Text style={styles.headerTitle}>View Material Mappings</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMapping(true)}
            colors={["#2563eb"]}
          />
        }
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
          <Text style={styles.selectorSectionTitle}>Select Region & Vendor</Text>

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

        {/* LOADING INDICATOR */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading material mapping...</Text>
          </View>
        )}

        {/* NOT SELECTED PROMPT */}
        {!loading && (!selectedRegion || !selectedVendor) && (
          <View style={[styles.emptyStateBox, { zIndex: 1, elevation: 1 }]}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="alt-route" size={48} color="#2563eb" />
            </View>
            <Text style={styles.emptyStateTitle}>Select Region & Vendor</Text>
            <Text style={styles.emptyStateDesc}>
              Choose both a region and vendor above to inspect their configured
              material mapping definitions.
            </Text>
          </View>
        )}

        {/* NO MAPPING FOUND STATE */}
        {!loading &&
          selectedRegion &&
          selectedVendor &&
          hasQueried &&
          materials.length === 0 && (
            <View style={[styles.emptyStateBox, { zIndex: 1, elevation: 1 }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: "#fee2e2" }]}>
                <MaterialIcons name="assignment-late" size={48} color="#ef4444" />
              </View>
              <Text style={styles.emptyStateTitle}>No Mapping Configured</Text>
              <Text style={styles.emptyStateDesc}>
                There are no material mappings saved for{" "}
                <Text style={{ fontWeight: "700", color: "#1f2937" }}>
                  {selectedRegion}
                </Text>{" "}
                with this vendor yet.
              </Text>
              <TouchableOpacity
                style={styles.createNowBtn}
                onPress={() =>
                  navigation.navigate("AddMaterialMappingScreen", {
                    region: selectedRegion,
                    vendorId: selectedVendor,
                  })
                }
              >
                <MaterialIcons name="add-circle" size={20} color="#ffffff" />
                <Text style={styles.createNowBtnText}>Create Mapping Now</Text>
              </TouchableOpacity>
            </View>
          )}

        {/* ACTIVE MAPPING CONTENT */}
        {!loading &&
          selectedRegion &&
          selectedVendor &&
          materials.length > 0 && (
            <View style={{ marginTop: 4, zIndex: 1, elevation: 1 }}>
              {/* SUMMARY COUNT CARD */}
              <View style={[styles.summaryCard, { zIndex: 1, elevation: 1 }]}>
                <View style={styles.summaryTopRow}>
                  <View style={styles.summaryIconBox}>
                    <MaterialIcons name="sync-alt" size={28} color="#2563eb" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.summaryRegionText}>
                      {mappingData?.region || selectedRegion}
                    </Text>
                    <Text style={styles.summaryVendorText} numberOfLines={1}>
                      Vendor: {mappingData?.vendor || "Selected Vendor"}
                    </Text>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countNumber}>{materials.length}</Text>
                    <Text style={styles.countLabel}>Mapped</Text>
                  </View>
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionEditBtn}
                    onPress={() =>
                      navigation.navigate("AddMaterialMappingScreen", {
                        region: selectedRegion,
                        vendorId: selectedVendor,
                      })
                    }
                  >
                    <MaterialIcons name="edit" size={17} color="#2563eb" />
                    <Text style={styles.actionEditText}>Edit Mapping</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionDeleteBtn}
                    onPress={() =>
                      navigation.navigate("RemoveMaterialMappingScreen", {
                        region: selectedRegion,
                        vendorId: selectedVendor,
                      })
                    }
                  >
                    <MaterialIcons name="delete-forever" size={17} color="#ef4444" />
                    <Text style={styles.actionDeleteText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* SEARCH BOX */}
              <View style={styles.searchBox}>
                <MaterialIcons name="search" size={22} color="#2563eb" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search store or official material..."
                  placeholderTextColor="#7e7c7c"
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <MaterialIcons name="close" size={20} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>

              {/* MAPPINGS LIST */}
              <View style={styles.listSection}>
                <Text style={styles.listSectionTitle}>
                  Mapping Pairs ({filteredMaterials.length})
                </Text>

                {filteredMaterials.map((item, index) => (
                  <View key={index} style={styles.card}>
                    {/* Card Top Banner */}
                    <View style={styles.cardHeader}>
                      <View style={styles.indexPill}>
                        <Text style={styles.indexPillText}>#{index + 1}</Text>
                      </View>
                      <View style={styles.activeTag}>
                        <MaterialIcons name="check-circle" size={14} color="#10b981" />
                        <Text style={styles.activeTagText}>Active</Text>
                      </View>
                    </View>

                    {/* Mapping Comparison Flow */}
                    <View style={styles.mappingFlow}>
                      {/* Left: Store Material */}
                      <View style={styles.materialBlock}>
                        <View style={styles.materialTypeLabelRow}>
                          <MaterialIcons name="storefront" size={16} color="#2563eb" />
                          <Text style={styles.blockTitle}>Store / Vendor Name</Text>
                        </View>
                        <View style={styles.namePillStore}>
                          <Text style={styles.storeNameText} numberOfLines={2}>
                            {item.materialType}
                          </Text>
                        </View>
                      </View>

                      {/* Middle: Arrow */}
                      <View style={styles.arrowBlock}>
                        <MaterialIcons name="arrow-forward" size={22} color="#2563eb" />
                      </View>

                      {/* Right: Decathlon Official Name */}
                      <View style={styles.materialBlock}>
                        <View style={styles.materialTypeLabelRow}>
                          <MaterialIcons name="verified" size={16} color="#10b981" />
                          <Text style={[styles.blockTitle, { color: "#065f46" }]}>
                            Official Decathlon
                          </Text>
                        </View>
                        <View style={styles.namePillOfficial}>
                          <Text style={styles.officialNameText} numberOfLines={2}>
                            {item.officialMaterialType}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}

                {filteredMaterials.length === 0 && (
                  <View style={styles.noSearchMatchBox}>
                    <MaterialIcons name="search-off" size={40} color="#9ca3af" />
                    <Text style={styles.noSearchMatchText}>
                      No materials match &quot;{search}&quot;
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
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
  createNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
    marginTop: 18,
  },
  createNowBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#1e40af",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIconBox: {
    backgroundColor: "#eff6ff",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  summaryRegionText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e40af",
  },
  summaryVendorText: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 2,
    fontWeight: "500",
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e40af",
  },
  countLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3b82f6",
    textTransform: "uppercase",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  actionEditBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingVertical: 8,
    borderRadius: 9,
    gap: 5,
  },
  actionEditText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  actionDeleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingVertical: 8,
    borderRadius: 9,
    gap: 5,
  },
  actionDeleteText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ef4444",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
    marginLeft: 8,
  },
  listSection: {
    width: "100%",
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4b5563",
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  indexPill: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  indexPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
  },
  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  mappingFlow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  materialBlock: {
    flex: 1,
  },
  materialTypeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
  },
  namePillStore: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  storeNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  arrowBlock: {
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  namePillOfficial: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  officialNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803d",
  },
  noSearchMatchBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    backgroundColor: "#ffffff",
    borderRadius: 14,
  },
  noSearchMatchText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
});