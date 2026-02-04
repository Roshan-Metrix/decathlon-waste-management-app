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
import { Camera, CameraView } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { parseWeight } from "../../../ocr/parseWeight";
import api from "../../../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Alert from "../../../Components/Alert";
import useImagePreview from "../../../lib/useImagePreview";

export default function ItemsTransactionScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const { openImage, ImagePreviewModal } = useImagePreview();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [materialType, setMaterialType] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchWeight, setFetchWeight] = useState("");
  const [enterWeight, setEnterWeight] = useState("");

  const [itemsList, setItemsList] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

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

  // Fetch existing items on load (from today's transaction endpoint)
  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      setItemsLoading(true);

      const stored = await AsyncStorage.getItem("todayTransaction");
      if (!stored) {
        setItemsLoading(false);
        return;
      }

      const parsed = JSON.parse(stored);
      const transactionId = parsed?.transactionId;
      if (!transactionId) {
        setItemsLoading(false);
        return;
      }

      const res = await api.get(
        `/manager/transaction/todays-transactions/${transactionId}`,
      );

      if (res.data?.success) {
        const items = res.data?.transactions?.[0]?.items || [];

        const reversedItems = [...items].reverse();

        setItemsList(reversedItems);
      }
    } catch (e) {
      console.log("Fetch items error:", e);
    } finally {
      setItemsLoading(false);
    }
  };

  // Capture image and run OCR
  const handleCapture = async () => {
  try {
    if (!cameraRef.current) {
      setAlertMessage("Camera not ready!");
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    const picture = await cameraRef.current.takePictureAsync({
      base64: true, 
      quality: 0.5,
    });

    setPhoto(picture);

    const formData = new FormData();
    formData.append("image", {
      uri: picture.uri,
      name: "photo.jpg",
      type: "image/jpeg",
    });

    const res = await api.post(
      "/manager/transaction/transaction-calibration/ocr",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const ocrText = res.data.weight;
    const cleanWeight = parseWeight(ocrText);

    if (cleanWeight) {
      setFetchWeight(cleanWeight.toString());
    } else {
      setAlertMessage(
        "OCR couldn't detect weight.\nPlease enter weight manually or capture again."
      );
      setAlertVisible(true);
      setFetchWeight("");
    }
  } catch (e) {
    console.log("Capture Error:", e.message);
    if (e.response) {
      console.log("Server responded with:", e.response.data);
    } else if (e.request) {
      console.log("No response received:", e.request);
    } else {
      console.log("Axios config error:", e.config);
    }

    setAlertMessage("Capture Failed.\nTry again.");
    setAlertVisible(true);
  } finally {
    setLoading(false);
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
    } else {
      weight = fetchWeight;
      weightSource = "system";
    }

    if (!weight) {
      setAlertMessage("No weight detected or entered.");
      setAlertVisible(true);
      return;
    }

    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem("todayTransaction");
      const parsed = stored ? JSON.parse(stored) : null;
      const transactionId = parsed?.transactionId;

      if (!transactionId) {
        setLoading(false);
        setAlertMessage("Please create or fetch a transaction first!");
        setAlertVisible(true);
        return;
      }

      const payload = {
        materialType,
        weight,
        weightSource,
        image: photo.base64,
      };

      const res = await api.post(
        `/manager/transaction/transaction-items/${transactionId}`,
        payload,
      );

      setLoading(false);

      if (res.data?.success) {
        const returnedItems = res.data.items || [];

        const reversedReturnedItems = [...returnedItems].reverse();

        setItemsList(reversedReturnedItems);

        // reset fields for next item
        setPhoto(null);
        setMaterialType("");
        setFetchWeight("");
        setEnterWeight("");

        setAlertMessage("Item added successfully!");
        setAlertVisible(true);
      } else {
        console.log("Add item response:", res.data);
        setAlertMessage(res.data?.message || "Item not added.");
        setAlertVisible(true);
      }
    } catch (err) {
      setLoading(false);
      console.log("ADD ITEM ERROR:", err?.response?.data || err.message || err);
      setAlertMessage("Something went wrong!");
      setAlertVisible(true);
    }
  };

  // Helper to show image for item (either data URI or server filename)
  const getItemImageUri = (imageField) => {
    if (!imageField) return null;
    if (typeof imageField !== "string") return null;

    // If server returned a data: URI (base64 included)
    if (imageField.startsWith("data:")) return imageField;

    // If server returned a base64 string without prefix (rare), detect by length
    if (/^[A-Za-z0-9+/=]+$/.test(imageField) && imageField.length > 200) {
      // assume base64 PNG
      return `data:image/png;base64,${imageField}`;
    }

    // Otherwise treat it as filename on server uploads folder
    const base = api?.defaults?.baseURL || "";
    // adjust path if server stores uploads in /uploads/ or /public/uploads/
    return `${base.replace(/\/$/, "")}/uploads/${imageField}`;
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

  const formatDateTime = (isoString) => {
    if (!isoString) {
      return { formattedDate: "N/A", formattedTime: "N/A" };
    }
    try {
      const date = new Date(isoString);

      // Format Date (e.g., "Nov 25, 2025")
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });

      // Format Time (e.g., "2:30 PM")
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return { formattedDate, formattedTime };
    } catch (e) {
      console.error("Date formatting error:", e);
      return { formattedDate: "Invalid Date", formattedTime: "Invalid Time" };
    }
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.dropdownText}>
            {materialType || "Select Material Type"}
          </Text>
          <MaterialIcons
            name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
          />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownList}>
            {[
              "Recycling Metal",
              "Recycling Rubber",
              "Recycling Paper",
              "Recycling Glass",
              "Recycling E Waste",
              "Recycling Cardboard",
              "Recycling Textile",
              "Recycling Soft Plastics",
              "Hazardous Waste",
              "Recycling Organic",
              "Mixed Packaging",
              "Defective Products",
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

        {/* Weights */}
        <View style={styles.inputBox}>
          <TextInput
            placeholder="Fetched Weight (auto)"
            style={[styles.input, { color: "#6B7280" }]}
            value={fetchWeight}
            editable={false}
          />
          <Text style={styles.unit}>kg</Text>
        </View>

        <View style={styles.inputBox}>
          <TextInput
            placeholder="Enter Weight (manual)"
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

        <Text style={styles.listTitle}>Added Items</Text>

        {itemsLoading ? (
          <ActivityIndicator
            style={{ marginTop: 15 }}
            size="small"
            color="#1e40af"
          />
        ) : itemsList.length === 0 ? (
          <Text style={styles.noItems}>No items added yet.</Text>
        ) : (
          <View style={{ marginTop: 10 }}>
            {itemsList.map((item) => {
              const imgUri = getItemImageUri(item.image);
              const { formattedDate, formattedTime } = formatDateTime(
                item.createdAt,
              );
              return (
                <View key={item.itemNo} style={styles.card}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      openImage(
                        imgUri
                          ? { uri: imgUri }
                          : require("../../../../assets/icon.png"),
                      )
                    }
                  >
                    <Image
                      source={
                        imgUri
                          ? { uri: imgUri }
                          : require("../../../../assets/icon.png")
                      }
                      style={styles.cardImage}
                    />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {/* {item.itemNo}.  */}
                      {item.materialType}
                    </Text>
                    <Text style={styles.cardSub}>
                      Weight : {item.weight} kg
                    </Text>
                    <Text style={styles.cardSub}>Date : {formattedDate} </Text>
                    <Text style={styles.cardSub}>Time : {formattedTime} </Text>
                    <Text style={styles.cardTag}>
                      {item.weightSource === "system" ? "System" : "Manual"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
      <ImagePreviewModal />
    </View>
  );
}

//  STYLES 
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
});
