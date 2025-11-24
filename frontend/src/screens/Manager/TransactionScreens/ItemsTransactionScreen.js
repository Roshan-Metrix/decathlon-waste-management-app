import React, { useEffect, useRef, useState } from "react";
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
import { CameraView, Camera } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { runOcrOnImage } from "../../../ocr/ocrService";
import { parseWeight } from "../../../ocr/parseWeight";
import api from "../../../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ItemsTransactionScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [materialType, setMaterialType] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fetchWeight, setFetchWeight] = useState("");
  const [enterWeight, setEnterWeight] = useState("");

  // ASK PERMISSION
  useEffect(() => {
    (async () => {
      const cam = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cam.status === "granted");
    })();
  }, []);

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
        <Text>No access to camera</Text>
        <TouchableOpacity
          onPress={() => Camera.requestCameraPermissionsAsync()}
          style={styles.permissionBtn}
        >
          <Text style={{ color: "#fff" }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // CAPTURE IMAGE + OCR
  const handleCapture = async () => {
    try {
      const picture = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });

      setPhoto(picture); 
      setLoading(true);

      // OCR
      const ocrText = await runOcrOnImage(picture.uri);
      const cleanWeight = parseWeight(ocrText);

      if (cleanWeight) {
        setFetchWeight(cleanWeight.toString());
      } else {
        alert("Unable to detect weight! Please enter manually.");
        setFetchWeight("");
      }

      setLoading(false);
    } catch (e) {
      console.log("Error capturing:", e);
      setLoading(false);
      alert("Capture failed. Try again.");
    }
  };

 // Add Item
const handleAddItem = async () => {
  if (!materialType) {
    alert("Please select material type.");
    return;
  }

  if (!photo) {
    alert("Please capture an image.");
    return;
  }

  // Determine weight + weightSource
  let weight = "";
  let weightSource = "";

  if (enterWeight.trim() !== "") {
    weight = enterWeight;
    weightSource = "manually";   // ✅ FIXED SPELLING
  } else {
    weight = fetchWeight;
    weightSource = "system";     // ✅ VALID
  }

  if (!weight) {
    alert("No weight detected or entered.");
    return;
  }

  try {
    setLoading(true);

    const stored = await AsyncStorage.getItem("todayTransaction");
    const parsed = JSON.parse(stored);
    const transactionId = parsed?.transactionId;

    const res = await api.post(
      `/manager/transaction/transaction-items/${transactionId}`,
      {
        materialType,
        weight,
        weightSource,
        image: photo.base64,
      }
    );

    setLoading(false);

    if (res.data.success) {
      alert("Item added successfully!");
      // Reset UI
      setPhoto(null);
      setMaterialType("");
      setFetchWeight("");
      setEnterWeight("");
    } else {
      alert("Item not added.");
    }
  } catch (err) {
    setLoading(false);
    console.log("ADD ITEM ERROR:", err?.response?.data || err);
    alert(err?.response?.data?.message || "Error adding item.");
  }
};


  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Material Photo</Text>
        <View style={{ width: 26 }} />
         <TouchableOpacity
          onPress={() => navigation.navigate("VendorSignatureScreen")}
        >
          <MaterialIcons name="assignment" size={35} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* CAMERA SECTION */}
        <View style={styles.cameraBox}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.capturedImage} />
          ) : (
            <CameraView style={styles.camera} facing="back" ref={cameraRef} />
          )}
        </View>

        {/* CAPTURE BUTTON */}
        <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
          <MaterialIcons name="photo-camera" size={22} color="#fff" />
          <Text style={styles.captureText}>Capture</Text>
        </TouchableOpacity>

        {/* MATERIAL DROPDOWN */}
        <TouchableOpacity
          style={styles.dropdownBox}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={styles.dropdownText}>
            {materialType || "Choose material"}
          </Text>
          <MaterialIcons
            name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color="#374151"
          />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownList}>
            {[
              "Defective Products",
              "Hazardous Waste",
              "Recycling Cardboard",
              "Recycling E Waste",
              "Recycling Glass",
              "Recycling Hangers",
              "Recycling Metal",
              "Recycling Mixed Packaging",
              "Recycling Organic",
              "Recycling Paper",
              "Recycling Rubber",
              "Recycling Soft Plastics",
              "Recycling Textile",
              "Waste Incineration",
              "Waste incineration energy recovery",
              "Waste Landfill",
            ].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setMaterialType(item);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* FETCHED WEIGHT (READ ONLY) */}
        <View style={styles.inputBox}>
          <TextInput
            placeholder="Fetched Weight (auto)"
            style={[styles.input, { color: "#6B7280" }]}
            keyboardType="numeric"
            value={fetchWeight}
            editable={false} 
          />
          <Text style={styles.gmText}>kg</Text>
        </View>

        {/* ENTER WEIGHT (OPTIONAL) */}
        <View style={styles.inputBox}>
          <TextInput
            placeholder="Enter Weight (manual)"
            style={styles.input}
            keyboardType="numeric"
            value={enterWeight}
            onChangeText={setEnterWeight}
          />
          <Text style={styles.gmText}>kg</Text>
        </View>

        {/* ADD MATERIAL */}
        <TouchableOpacity style={styles.calibrateBtn} onPress={handleAddItem}>
          <Text style={styles.calibrateText}>Add Material</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* LOADING */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    elevation: 5,
  },

  headerTitle: { fontSize: 22, fontWeight: "700", color: "#2563eb" },

  cameraBox: {
    width: "90%",
    height: 280,
    backgroundColor: "#fff",
    borderRadius: 18,
    alignSelf: "center",
    marginTop: 20,
    overflow: "hidden",
  },

  camera: { flex: 1 },

  capturedImage: { width: "100%", height: "100%" },

  captureBtn: {
    flexDirection: "row",
    marginTop: 15,
    backgroundColor: "#2563eb",
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
  },

  dropdownItem: {
    padding: 12,
  },

  dropdownItemText: {
    fontSize: 16,
  },

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

  gmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
  },

  calibrateBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 30,
    width: "85%",
    alignSelf: "center",
  },

  calibrateText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
  },

  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
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
});
