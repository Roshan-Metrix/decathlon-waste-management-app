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
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function RemoveMaterialMappingScreen({ navigation }) {
  // Mapping state
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasQueried, setHasQueried] = useState(false);

  // Delete & Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Alert modal
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch active mapping for preview before deleting
  const fetchActiveMapping = async () => {
    setLoading(true);
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
      console.log("Fetch Active Mapping Error:", err);
      setHasQueried(true);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveMapping();
  }, []);

  // Handle Deletion Confirmation
  const handleDeleteMapping = async () => {
    try {
      setDeleting(true);

      const res = await api.delete("/auth/delete-material-mapping");

      if (res.data?.success) {
        setModalVisible(false);
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
      >
        {/* HERO BANNER */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="delete-sweep" size={34} color="#ef4444" />
          </View>
          <Text style={styles.heroTitle}>Delete Global Mapping</Text>
          <Text style={styles.heroSubtitle}>
            Permanently remove the global material mapping catalog from the system.
          </Text>
        </View>

        {/* LOADING STATE */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Locating global material mapping...</Text>
          </View>
        )}

        {/* NO MAPPING FOUND */}
        {!loading && hasQueried && materials.length === 0 && (
          <View style={styles.emptyStateBox}>
            <View style={[styles.emptyIconCircle, { backgroundColor: "#f3f4f6" }]}>
              <MaterialIcons name="info-outline" size={48} color="#6b7280" />
            </View>
            <Text style={styles.emptyStateTitle}>No Mapping Found</Text>
            <Text style={styles.emptyStateDesc}>
              There is currently no active global material mapping to remove.
            </Text>
          </View>
        )}

        {/* ACTIVE MAPPING FOUND - READY TO REMOVE */}
        {!loading && materials.length > 0 && (
          <View style={styles.targetCard}>
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

            <Text style={styles.targetRegion}>Decathlon Global Catalog</Text>
            <Text style={styles.targetVendor}>
              Applied across all stores &amp; vendors
            </Text>

            {/* Mapped Materials Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Configured Mappings Preview:</Text>
              {materials.slice(0, 6).map((m, idx) => (
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
              {materials.length > 6 && (
                <Text style={styles.moreText}>
                  + {materials.length - 6} more mapped materials
                </Text>
              )}
            </View>

            {/* Danger Warning Note */}
            <View style={styles.warningBox}>
              <MaterialIcons name="error-outline" size={20} color="#b91c1c" />
              <Text style={styles.warningText}>
                Deleting this mapping will remove all material correlations globally.
                Future transactions and reports will fall back to local store material names.
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
              Are you sure you want to permanently delete the global material mapping catalog ({materials.length} pairs)? This action cannot be undone.
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
                <>
                  <MaterialIcons name="delete-forever" size={20} color="#ffffff" />
                  <Text style={styles.modalConfirmText}>Yes, Delete Mapping</Text>
                </>
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
    backgroundColor: "#fee2e2",
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
  targetCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#dc2626",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
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
    gap: 5,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dangerBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#dc2626",
  },
  countLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#b91c1c",
    textTransform: "uppercase",
  },
  targetRegion: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
  },
  targetVendor: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 2,
    marginBottom: 14,
    fontWeight: "500",
  },
  previewContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  previewStoreText: {
    flex: 1,
    fontSize: 13,
    color: "#1f2937",
    fontWeight: "500",
  },
  previewOfficialText: {
    flex: 1,
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
  },
  moreText: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 6,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 18,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#991b1b",
    lineHeight: 18,
    fontWeight: "500",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    elevation: 3,
    shadowColor: "#ef4444",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  modalDangerIconCircle: {
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 22,
  },
  modalConfirmBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    marginBottom: 10,
  },
  modalConfirmText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  modalCancelBtn: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  modalCancelText: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "600",
  },
});
