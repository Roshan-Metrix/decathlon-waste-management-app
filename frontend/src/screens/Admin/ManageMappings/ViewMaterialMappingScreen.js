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
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function ViewMaterialMappingScreen({ navigation }) {
  // Mapping data states
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch Global Material Mapping
  const fetchMapping = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await api.get("/auth/get-material-mapping");

      setHasQueried(true);

      if (data?.success && data?.data) {
        setMaterials(
          Array.isArray(data.data.materials) ? data.data.materials : []
        );
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.log("Fetch Mapping Error:", err);
      setHasQueried(true);
      setMaterials([]);
      const errMsg =
        err?.response?.data?.message || "Failed to fetch material mappings.";
      setAlertMessage(errMsg);
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMapping();
  }, []);

  // Client-side search filtering
  const filteredMaterials = useMemo(() => {
    if (!search.trim()) return materials;
    const q = search.toLowerCase();
    return materials.filter(
      (m) =>
        (m.materialType && m.materialType.toLowerCase().includes(q)) ||
        (m.officialMaterialType &&
          m.officialMaterialType.toLowerCase().includes(q))
    );
  }, [materials, search]);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMapping(true)}
            colors={["#2563eb"]}
          />
        }
      >
        {/* HERO BANNER */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="visibility" size={32} color="#2563eb" />
          </View>
          <Text style={styles.heroTitle}>Global Material Catalog</Text>
          <Text style={styles.heroSubtitle}>
            Unified mapping rules applied across all regions, stores, and vendor reports.
          </Text>
        </View>

        {/* LOADING STATE */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading global material mappings...</Text>
          </View>
        )}

        {/* NO MAPPING FOUND STATE */}
        {!loading && hasQueried && materials.length === 0 && (
          <View style={styles.emptyStateBox}>
            <View style={[styles.emptyIconCircle, { backgroundColor: "#fee2e2" }]}>
              <MaterialIcons name="assignment-late" size={48} color="#ef4444" />
            </View>
            <Text style={styles.emptyStateTitle}>No Mapping Configured</Text>
            <Text style={styles.emptyStateDesc}>
              There are currently no global material mappings configured in the database.
            </Text>
            <TouchableOpacity
              style={styles.createNowBtn}
              onPress={() => navigation.navigate("AddMaterialMappingScreen")}
            >
              <MaterialIcons name="add-circle" size={20} color="#ffffff" />
              <Text style={styles.createNowBtnText}>Create Mapping Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ACTIVE MAPPING CONTENT */}
        {!loading && materials.length > 0 && (
          <View style={{ marginTop: 4 }}>
            {/* SUMMARY COUNT CARD */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTopRow}>
                <View style={styles.summaryIconBox}>
                  <MaterialIcons name="sync-alt" size={28} color="#2563eb" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.summaryRegionText}>Global Catalog</Text>
                  <Text style={styles.summaryVendorText} numberOfLines={1}>
                    All Stores &amp; Vendors
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
                  onPress={() => navigation.navigate("AddMaterialMappingScreen")}
                >
                  <MaterialIcons name="edit" size={17} color="#2563eb" />
                  <Text style={styles.actionEditText}>Edit Mapping</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionDeleteBtn}
                  onPress={() => navigation.navigate("RemoveMaterialMappingScreen")}
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
                        <Text style={styles.blockTitle}>Store / Local Name</Text>
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
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: "#1f2937",
    paddingLeft: 8,
  },
  listSection: {
    marginBottom: 20,
  },
  listSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
    marginLeft: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  indexPill: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  indexPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4b5563",
  },
  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: "600",
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
    marginBottom: 5,
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
    textTransform: "uppercase",
  },
  namePillStore: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  storeNameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e3a8a",
  },
  arrowBlock: {
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  namePillOfficial: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  officialNameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065f46",
  },
  noSearchMatchBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  noSearchMatchText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
});
