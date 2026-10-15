import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function RemoveRegionScreen({ navigation }) {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

  // Modal & Selection
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Admin credentials verification
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // FETCH REGIONS
  const fetchRegions = async () => {
    try {
      const { data } = await api.get("/auth/get-regions");
      if (data?.success && Array.isArray(data.regions)) {
        setRegions(data.regions);
      }
    } catch (error) {
      setAlertMessage("Failed to fetch regions");
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  // Filtered regions based on search
  const filteredRegions = useMemo(() => {
    if (!search.trim()) return regions;
    const q = search.toLowerCase();
    return regions.filter((r) => r.toLowerCase().includes(q));
  }, [search, regions]);

  // Open delete modal for a region
  const handleOpenDeleteModal = (region) => {
    setSelectedRegion(region);
    setAdminEmail("");
    setAdminPassword("");
    setShowPassword(false);
    setModalVisible(true);
  };

  // DELETE REGION HANDLER
  const confirmDeleteRegion = async () => {
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAlertMessage("Please enter your admin credentials");
      setAlertVisible(true);
      return;
    }

    try {
      setDeleting(true);

      // 1. VERIFY ADMIN
      const verify = await api.post("/auth/login", {
        email: adminEmail.trim(),
        password: adminPassword,
      });

      if (!verify.data?.success) {
        setDeleting(false);
        setAlertMessage("Admin verification failed! Check your credentials.");
        setAlertVisible(true);
        return;
      }

      // 2. DELETE REGION
      const deleteRes = await api.delete(
        `/auth/admin/delete-region/${selectedRegion}`
      );

      if (!deleteRes.data?.success) {
        setDeleting(false);
        setAlertMessage(deleteRes.data?.message || "Region delete failed");
        setAlertVisible(true);
        return;
      }

      // Update state locally
      setRegions((prev) => prev.filter((region) => region !== selectedRegion));

      setModalVisible(false);
      setAdminEmail("");
      setAdminPassword("");

      setAlertMessage(`Region "${selectedRegion}" deleted successfully!`);
      setAlertVisible(true);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Something went wrong while deleting!";
      setAlertMessage(errMsg);
      setAlertVisible(true);
    } finally {
      setDeleting(false);
    }
  };

  // RENDER REGION CARD
  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {/* Region Icon Circle */}
        <View style={styles.iconCircle}>
          <MaterialIcons name="location-on" size={24} color="#2563eb" />
        </View>

        {/* Region Details */}
        <View style={styles.regionInfo}>
          <Text style={styles.regionName} numberOfLines={1}>
            {item}
          </Text>
          <Text style={styles.regionSub}>Configured Territory</Text>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleOpenDeleteModal(item)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="delete-outline" size={18} color="#ffffff" />
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Remove Region</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* BODY CONTENT */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading regions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRegions}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchRegions();
              }}
              colors={["#2563eb"]}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerSection}>
              {/* Summary Stats Card */}
              <View style={styles.countCard}>
                <View style={styles.countIconCircle}>
                  <MaterialIcons name="map" size={30} color="#2563eb" />
                </View>
                <View style={styles.countInfo}>
                  <Text style={styles.countLabel}>Total Active Regions</Text>
                  <Text style={styles.countNumber}>{regions.length}</Text>
                </View>
              </View>

              {/* Warning Notice Banner */}
              <View style={styles.noticeBanner}>
                <MaterialIcons name="info-outline" size={20} color="#d97706" />
                <Text style={styles.noticeText}>
                  Deleting a region will permanently remove all associated material
                  rates and configurations.
                </Text>
              </View>

              {/* Search Box */}
              {regions.length > 0 && (
                <View style={styles.searchBox}>
                  <MaterialIcons name="search" size={22} color="#2563eb" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search region name..."
                    placeholderTextColor="#94a3b8"
                    value={search}
                    onChangeText={setSearch}
                  />
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch("")}>
                      <MaterialIcons name="close" size={20} color="#64748b" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialIcons
                  name={search ? "search-off" : "map"}
                  size={46}
                  color="#94a3b8"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {search ? "No Matching Regions" : "No Regions Available"}
              </Text>
              <Text style={styles.emptyDesc}>
                {search
                  ? `No regions found matching "${search}". Try another keyword.`
                  : "There are currently no regions registered in the system."}
              </Text>
            </View>
          }
        />
      )}

      {/* CREDENTIAL VERIFICATION MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            {/* Security Icon Badge */}
            <View style={styles.modalSecurityBadge}>
              <MaterialIcons name="security" size={32} color="#dc2626" />
            </View>

            <Text style={styles.modalTitle}>Admin Authorization</Text>
            <Text style={styles.modalSubtitle}>
              Please verify your administrator credentials to proceed with this
              permanent action.
            </Text>

            {/* Target Region Highlight Card */}
            <View style={styles.targetRegionCard}>
              <Text style={styles.targetRegionLabel}>Region to Delete:</Text>
              <View style={styles.targetRegionRow}>
                <MaterialIcons name="location-on" size={18} color="#dc2626" />
                <Text style={styles.targetRegionName}>{selectedRegion}</Text>
              </View>
            </View>

            {/* Admin Email Input */}
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={20} color="#2563eb" />
              <TextInput
                placeholder="Admin Email"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={adminEmail}
                onChangeText={setAdminEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Admin Password Input with Visibility Toggle */}
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color="#2563eb" />
              <TextInput
                placeholder="Admin Password"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={adminPassword}
                onChangeText={setAdminPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Delete Button */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                deleting && { opacity: 0.7 },
              ]}
              onPress={confirmDeleteRegion}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.confirmText}>Verifying & Deleting...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="delete-forever" size={20} color="#ffffff" />
                  <Text style={styles.confirmText}>Confirm & Delete Region</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
              disabled={deleting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ALERT MODAL */}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 18,
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 14,
  },
  countCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  countIconCircle: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 30,
    marginRight: 14,
  },
  countInfo: {
    flex: 1,
  },
  countLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  countNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1e40af",
    marginTop: 2,
  },
  noticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: "#92400e",
    lineHeight: 17,
    fontWeight: "500",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    backgroundColor: "#eff6ff",
    padding: 10,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  regionInfo: {
    flex: 1,
    marginRight: 10,
  },
  regionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  regionSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 5,
    elevation: 2,
    shadowColor: "#dc2626",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  removeText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyIconCircle: {
    backgroundColor: "#f1f5f9",
    padding: 18,
    borderRadius: 50,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  modalSecurityBadge: {
    backgroundColor: "#fee2e2",
    padding: 14,
    borderRadius: 35,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  targetRegionCard: {
    width: "100%",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  targetRegionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#991b1b",
    marginBottom: 2,
  },
  targetRegionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  targetRegionName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#b91c1c",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 11,
    paddingHorizontal: 12,
    marginBottom: 12,
    width: "100%",
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    marginLeft: 8,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    width: "100%",
    paddingVertical: 13,
    borderRadius: 11,
    marginTop: 6,
    marginBottom: 10,
    gap: 6,
    elevation: 3,
    shadowColor: "#dc2626",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  confirmText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelButton: {
    paddingVertical: 8,
    width: "100%",
    alignItems: "center",
  },
  cancelText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 14,
  },
});