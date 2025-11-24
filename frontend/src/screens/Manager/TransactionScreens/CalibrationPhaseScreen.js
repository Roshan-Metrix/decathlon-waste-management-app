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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { runOcrOnImage } from "../../../ocr/ocrService";
import { parseWeight } from "../../../ocr/parseWeight";
import api from "../../../api/api";

export default function CalibrationPhaseScreen({ navigation }) {
  const cameraRef = useRef(null);

  const [hasPermission, setHasPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [fetchWeight, setFetchWeight] = useState("");

  const [loading, setLoading] = useState(false);
  const [canCalibrate, setCanCalibrate] = useState(false);

  useEffect(() => {
    (async () => {
      const cam = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cam.status === "granted");
    })();
  }, []);

  const handleCapture = async () => {
    try {
      const picture = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });

      setPhoto(picture);
      setLoading(true);

      const ocrText = await runOcrOnImage(picture.uri);
      const cleanWeight = parseWeight(ocrText);

      if (cleanWeight) {
        setFetchWeight(cleanWeight.toString());
      } else {
        alert("Unable to detect weight!");
        setFetchWeight("");
      }

      setCanCalibrate(true);
      setLoading(false);
    } catch (e) {
      console.log("Capture error:", e);
      setLoading(false);
      alert("Capture failed.");
    }
  };

  const handleRecapture = () => {
    setPhoto(null);
    setFetchWeight("");
    setCanCalibrate(false);
  };

  const handleCalibrate = async () => {
    if (!fetchWeight) {
      alert("Weight missing.");
      return;
    }

    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem("todayTransaction");
      const parsed = JSON.parse(stored);
      const transactionId = parsed?.transactionId;

      const payload = {
        fetchWeight,
        image: `data:image/jpeg;base64,${photo.base64}`,
      };

      const res = await api.post(
        `/manager/transaction/transaction-calibration/${transactionId}`,
        payload
      );

      setLoading(false);

      if (res.data.success) {
        await AsyncStorage.setItem("calibrationStatus", "Completed");
        navigation.navigate("ProcessTransactionScreen");
      } else {
        alert("Calibration failed.");
      }
    } catch (err) {
      alert(err?.response?.data?.message);
      setLoading(false);
    }
  };

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

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calibration Phase</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.card}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.capturedImage} />
          ) : (
            <CameraView style={styles.camera} ref={cameraRef} facing="back" />
          )}
        </View>

        {!photo && (
          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
            <MaterialIcons name="camera-alt" size={22} color="#fff" />
            <Text style={styles.captureText}>Capture Image</Text>
          </TouchableOpacity>
        )}

        {photo && (
          <TouchableOpacity style={styles.reBtn} onPress={handleRecapture}>
            <MaterialIcons name="camera" size={22} color="#fff" />
            <Text style={styles.captureText}>Capture Again</Text>
          </TouchableOpacity>
        )}

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Fetched Weight</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={fetchWeight}
              // editable={false}
              // making editable --
              onChangeText={setFetchWeight}
              keyboardType="numeric"
              editable={true}
              // --
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        </View>

        {canCalibrate && (
          <TouchableOpacity style={styles.mainBtn} onPress={handleCalibrate}>
            <Text style={styles.mainBtnText}>Calibrate</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

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
  card: {
    width: "90%",
    height: 280,
    backgroundColor: "#ffffffbb",
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
  reBtn: {
    flexDirection: "row",
    marginTop: 5,
    backgroundColor: "#4b5563",
    paddingVertical: 13,
    borderRadius: 12,
    width: "70%",
    alignSelf: "center",
    justifyContent: "center",
  },
  captureText: { color: "#fff", marginLeft: 8, fontWeight: "700" },
  inputCard: {
    marginTop: 13,
    padding: 20,
    backgroundColor: "#ffffffaa",
    borderRadius: 18,
    width: "90%",
    alignSelf: "center",
  },
  inputLabel: { fontSize: 14, fontWeight: "600" },
  inputWrapper: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
  },
  unit: { fontSize: 16, fontWeight: "700", color: "#2563eb" },
  mainBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 10,
    width: "85%",
    alignSelf: "center",
  },
  mainBtnText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
