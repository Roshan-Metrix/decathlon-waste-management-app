import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";
import colors from "../../../colors";
import Alert from "../../../Components/Alert";
import useImagePreview from "../../../lib/useImagePreview";
import { AuthContext } from "../../../context/AuthContext";

export default function ItemsTransactionScreen({ navigation, route }) {
  const { transactionId } = route.params || {};

  const cameraRef = useRef(null);
  const successToastTimerRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const { openImage, ImagePreviewModal } = useImagePreview();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [successToastVisible, setSuccessToastVisible] = useState(false);

  const [materialType, setMaterialType] = useState("");
  const [materialRate, setMaterialRate] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [enterWeight, setEnterWeight] = useState("");

  const [materialTypesAndRates, setMaterialTypesAndRates] = useState([]);

  const { region } = useContext(AuthContext);

  const showSuccessToast = () => {
    if (successToastTimerRef.current) {
      clearTimeout(successToastTimerRef.current);
    }

    setSuccessToastVisible(true);
    successToastTimerRef.current = setTimeout(() => {
      setSuccessToastVisible(false);
      successToastTimerRef.current = null;
    }, 1800);
  };

  const resolveTransactionId = () => {
    if (!transactionId) return "";

    if (typeof transactionId === "string") {
      try {
        const parsed = JSON.parse(transactionId);
        return parsed?.transactionId || transactionId;
      } catch {
        return transactionId;
      }
    }

    if (typeof transactionId === "object") {
      return transactionId?.transactionId || "";
    }

    return "";
  };

  // Ask camera permission on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (err) {
        console.log("Camera permission error:", err);
        setHasPermission(false);
      }
    })();
  }, []);

  const fetchMaterialTypesAndRates = async () => {
    try {
      const res = await api.get(`/auth/get-regional-materials/${region}`);
      if (res.data?.success) {
        setMaterialTypesAndRates(res.data.materials);
      }
    } catch (e) {
      console.log("Fetch material types error:", e);
    }
  };

  useEffect(() => {
    fetchMaterialTypesAndRates();
  }, [region]);

  useEffect(() => {
    return () => {
      if (successToastTimerRef.current) {
        clearTimeout(successToastTimerRef.current);
      }
    };
  }, []);

  // Capture image and run OCR
  const handleCapture = async () => {
    try {
      if (!cameraRef.current) {
        setAlertMessage("Camera not ready!");
        setAlertVisible(true);
        return;
      }

      const picture = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.3,
      });

      setPhoto(picture);

      const formData = new FormData();
      formData.append("image", {
        uri: picture.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });
    } catch (e) {
      console.log("Capture Error:", e.message);
      setAlertMessage("Capture Failed.\nTry again.");
      setAlertVisible(true);
    }
  };

  // Add item to backend
  const handleAddItem = async () => {
    if (!materialType) {
      setAlertMessage("Please select material type!");
      setAlertVisible(true);
      return;
    }
    if (!photo) {
      setAlertMessage("Please capture an image first!");
      setAlertVisible(true);
      return;
    }

    // Determine weight and source
    let weight = "";
    let weightSource = "";

    if (enterWeight.trim() !== "") {
      weight = enterWeight.trim();
      weightSource = "manually";
    }

    if (!weight) {
      setAlertMessage("No weight detected or entered.");
      setAlertVisible(true);
      return;
    }

    try {
      setLoading(true);

      const resolvedTransactionId = resolveTransactionId();

      if (!resolvedTransactionId) {
        setLoading(false);
        setAlertMessage("Please create or fetch a transaction first!");
        setAlertVisible(true);
        return;
      }

      const payload = {
        materialType,
        materialRate,
        weight,
        weightSource,
        image: photo.base64,
      };

      const res = await api.post(
        `/transaction/transaction-items/${resolvedTransactionId}`,
        payload,
      );

      setLoading(false);

      if (res.data?.success) {
        setPhoto(null);
        setMaterialType("");
        setMaterialRate("");
        setEnterWeight("");
        showSuccessToast();
      } else {
        console.log("Add item response:", res.data);
        setAlertMessage(res.data?.message || "Item not added.");
        setAlertVisible(true);
      }
    } catch (err) {
      setLoading(false);
      console.log("ADD ITEM ERROR:", err?.response?.data || err.message || err);
      setAlertMessage(
        err?.response?.data?.message || err?.message || "Something went wrong!",
      );
      setAlertVisible(true);
    }
  };

  // Permission states
  if (hasPermission === null) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerScreen}>
        <Text style={{ marginBottom: 12 }}>No access to camera</Text>
        <TouchableOpacity
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
          style={styles.permissionBtn}
        >
          <Text style={{ color: "#fff" }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {successToastVisible && (
        <View style={styles.successToast}>
          <MaterialIcons name="check-circle" size={20} color="#fff" />
          <Text style={styles.successToastText}>Added</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#1e40af" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add Materials</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("BillingExportTransactionScreen")}
        >
          <MaterialIcons name="assignment" size={32} color="#1e40af" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* CAMERA SECTION */}
        <View style={styles.cameraBox}>
          {photo ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openImage({ uri: photo.uri })}
            >
              <Image source={{ uri: photo.uri }} style={styles.capturedImage} />
            </TouchableOpacity>
          ) : (
            <CameraView style={styles.camera} facing="back" ref={cameraRef} />
          )}
        </View>

        <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
          <MaterialIcons name="camera-alt" size={22} color="#fff" />
          <Text style={styles.captureText}>Capture</Text>
        </TouchableOpacity>

        {/* Material dropdown */}
        <TouchableOpacity
          style={styles.dropdownBox}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text>{materialType || "Select Material Type"}</Text>
          <MaterialIcons
            name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
          />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownList}>
            {materialTypesAndRates?.map((item) => {
              const cleanedMaterial = item.split(":")[0].trim();
              const cleanedMaterialRate = item.split(":")[1]?.trim() || "";

              return (
                <TouchableOpacity
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMaterialType(cleanedMaterial);
                    setMaterialRate(cleanedMaterialRate);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{cleanedMaterial}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Weights */}

        <View style={styles.inputBox}>
          <TextInput
            placeholder="Enter Weight"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            keyboardType="numeric"
            value={enterWeight}
            onChangeText={setEnterWeight}
          />
          <Text style={styles.unit}>kg</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
          <Text style={styles.addText}>Add Material</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={22} color={colors.primary} />
          <Text style={styles.infoText}>
            Please review all details carefully before submitting. Once added, materials cannot be edited. 
          </Text>
        </View>
      </ScrollView>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 6 }}>Processing...</Text>
        </View>
      )}
      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

//  STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },

  successToast: {
    position: "absolute",
    top: 108,
    alignSelf: "center",
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    elevation: 6,
  },

  successToastText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    elevation: 5,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e40af",
  },

  cameraBox: {
    width: "90%",
    height: 260,
    backgroundColor: "#fff",
    borderRadius: 18,
    alignSelf: "center",
    marginTop: 20,
    overflow: "hidden",
    elevation: 4,
  },

  camera: { flex: 1 },
  capturedImage: { width: "100%", height: "100%" },

  captureBtn: {
    flexDirection: "row",
    marginTop: 15,
    backgroundColor: "#1e40af",
    paddingVertical: 13,
    borderRadius: 12,
    width: "70%",
    alignSelf: "center",
    justifyContent: "center",
  },

  captureText: { color: "#fff", marginLeft: 8, fontWeight: "700" },

  dropdownBox: {
    marginTop: 20,
    width: "90%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dropdownList: {
    backgroundColor: "#fff",
    width: "90%",
    alignSelf: "center",
    marginTop: 5,
    borderRadius: 12,
    paddingVertical: 5,
    elevation: 3,
  },

  dropdownItem: {
    padding: 12,
  },

  dropdownItemText: { fontSize: 16 },

  inputBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 15,
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },

  unit: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },

  addBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 15,
    width: "85%",
    alignSelf: "center",
  },

  addText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
  },

  listTitle: {
    marginTop: 30,
    marginLeft: 25,
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a8a",
  },

  noItems: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6b7280",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 14,
    elevation: 3,
    alignItems: "center",
  },

  cardImage: {
    width: 115,
    height: 115,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#f3f4f6",
  },

  cardTitle: { fontSize: 17, fontWeight: "700" },
  cardSub: { fontSize: 15, color: "#6b7280", marginTop: 4 },

  cardTag: {
    marginTop: 6,
    fontSize: 13,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    backgroundColor: "#e0e7ff",
    borderRadius: 8,
    color: "#4338ca",
    fontWeight: "600",
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  permissionBtn: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#2563eb",
    borderRadius: 10,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    margin: 20,
  },

  infoText: {
    color: "#1e3a8b",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
