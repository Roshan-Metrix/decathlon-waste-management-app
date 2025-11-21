import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import api from "../../../api/api";

export default function BillingTransactionScreen({ navigation }) {
  const [store, setStore] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [weight1, setWeight1] = useState("");
  const [weight2, setWeight2] = useState("");

  const [vendorSignature, setVendorSignature] = useState(null);

  // Fetch store + manager store
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/manager/profile");
        setProfile(res.data.manager);
        setStore(res.data.store);
      } catch (err) {
        console.log("Profile Error: ", err);
      }
    };
    fetchProfile();
  }, []);

  // Load vendor signature from AsyncStorage
  useEffect(() => {
    loadVendorSignature();
  }, []);

  const loadVendorSignature = async () => {
    const savedSig = await AsyncStorage.getItem("vendor_signature");
    if (savedSig) setVendorSignature(savedSig);
  };

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.permissionContainer}>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionBtn}
        >
          <Text style={{ color: "#fff" }}>Allow Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );

  const handleCapture = async (cam) => {
    const data = await cam.takePictureAsync();
    setPhoto(data.uri);
    setCameraOpen(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Billing Transaction</Text>

        {/* Export Button */}
        <TouchableOpacity onPress={() => navigation.navigate("ExportDataScreen")}>
          <MaterialIcons name="file-download" size={26} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* BILL LAYOUT */}
        <View style={styles.billBox}>
          <Text style={styles.storeName}>
            {store?.name || "Store Name Loading..."}
          </Text>
          <Text style={styles.storeLocation}>
            {store?.storeLocation || "Location Loading..."}
          </Text>

          {/* Transaction Info */}
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Date: 24/11/2025</Text>
            <Text style={styles.label}>Transaction ID: TXN-000123</Text>
          </View>

          {/* Manager + Vendor */}
          <Text style={styles.label}>
            Manager: {profile?.email || "Loading..."}
          </Text>
          <Text style={styles.label}>Vendor: (Will Fetch Later)</Text>

          {/* TABLE */}
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <Text style={styles.tableHeaderText}>SN</Text>
              <Text style={styles.tableHeaderText}>Item</Text>
              <Text style={styles.tableHeaderText}>Weight</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableData}>1</Text>

              <View style={styles.centerImageWrapper}>
                <Image
                  source={{ uri: "https://picsum.photos/50" }}
                  style={styles.itemImage}
                />
              </View>

              <Text style={styles.tableData}>120 gm</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableData}>2</Text>

              <View style={styles.centerImageWrapper}>
                <Image
                  source={{ uri: "https://picsum.photos/51" }}
                  style={styles.itemImage}
                />
              </View>

              <Text style={styles.tableData}>80 gm</Text>
            </View>

            {/* Total Row */}
            <View style={styles.tableRowTotal}>
              <Text style={styles.tableTotalText}>Grand Total : </Text>
              <TextInput
                placeholder="Enter Total"
                style={styles.totalInput}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Total in Words */}
          <Text style={styles.totalWords}>
            Grand Total (in words): _______________________________________
          </Text>

          {/* PHOTO CAPTURE */}
          <Text style={styles.subHeading}>Material Photo</Text>

          {!photo ? (
            <>
              {!cameraOpen ? (
                <TouchableOpacity
                  style={styles.openCameraBox}
                  onPress={() => setCameraOpen(true)}
                >
                  <MaterialIcons
                    name="photo-camera"
                    size={40}
                    color="#2563eb"
                  />
                  <Text style={{ color: "#2563eb" }}>Capture Image</Text>
                </TouchableOpacity>
              ) : (
                <CameraView style={styles.cameraView} facing="back">
                  {({ camera }) => (
                    <TouchableOpacity
                      style={styles.captureBtn}
                      onPress={() => handleCapture(camera)}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700" }}>
                        Capture
                      </Text>
                    </TouchableOpacity>
                  )}
                </CameraView>
              )}
            </>
          ) : (
            <Image source={{ uri: photo }} style={styles.capturedImage} />
          )}

          {/* Weight Inputs */}
          <TextInput
            placeholder="Weight 1"
            style={styles.weightInput}
            keyboardType="numeric"
            value={weight1}
            onChangeText={setWeight1}
          />
          <TextInput
            placeholder="Weight 2"
            style={styles.weightInput}
            keyboardType="numeric"
            value={weight2}
            onChangeText={setWeight2}
          />

          {/* SIGNATURES SECTION */}
          <Text style={styles.subHeading}>Signatures</Text>

          <View style={styles.signatureRow}>
            {/* Manager Signature Placeholder */}
            <View style={{ alignItems: "center" }}>
              <Image
                source={{ uri: "https://picsum.photos/70" }}
                style={styles.signatureImg}
              />
              <Text style={styles.signatureLabel}>Manager Signature</Text>
            </View>

            {/* Vendor Signature */}
            <View style={{ alignItems: "center" }}>
              {!vendorSignature ? (
                <TouchableOpacity
                  style={styles.vendorSignBtn}
                  onPress={() => navigation.navigate("VendorSignatureScreen")}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Add Vendor Signature
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <Image
                    source={{ uri: vendorSignature }}
                    style={styles.signatureImg}
                  />
                  <Text style={styles.signatureLabel}>Vendor Signature</Text>
                </>
              )}
            </View>
          </View>

          <Text style={styles.disclaimer}>
            * Above bill is true and correct *
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#fff",
    elevation: 3,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#2563eb" },
  billBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  storeName: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  storeLocation: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    color: "#555",
  },
  rowBetween: { marginVertical: 8 },
  label: { fontSize: 15, marginVertical: 5, color: "#333" },

  table: { borderWidth: 1, borderColor: "#ccc", marginTop: 15 },

  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    padding: 10,
  },
  tableHeaderText: { flex: 1, fontWeight: "700" },

  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  centerImageWrapper: { flex: 1, alignItems: "center" },

  tableData: { flex: 1 },
  itemImage: { width: 40, height: 40, borderRadius: 4 },

  tableRowTotal: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  tableTotalText: { flex: 1, fontWeight: "700" },
  totalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 6,
  },
  totalWords: { marginTop: 10, fontSize: 13, color: "#333" },

  subHeading: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },

  openCameraBox: {
    height: 200,
    borderWidth: 2,
    borderColor: "#2563eb",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  cameraView: { height: 250, borderRadius: 12, overflow: "hidden" },

  captureBtn: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  capturedImage: { width: "100%", height: 200, borderRadius: 12 },

  weightInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
  },

  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  signatureImg: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  signatureLabel: { marginTop: 5, fontSize: 13, color: "#333" },

  vendorSignBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  disclaimer: {
    marginTop: 20,
    fontSize: 12,
    textAlign: "center",
    color: "#777",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
  },
});
