// For future use , but this code have bug 

import * as Camera from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";
import { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export const askCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === "granted";
};

export const askStoragePermission = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === "granted";
};

export const askLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
};

// MAIN FUNCTION — ask all permissions + reopen modal if denied permission 
export const usePermissionHandler = () => {
  const [visible, setVisible] = useState(false);
  const [retry, setRetry] = useState(() => () => {});

  const showModal = (retryFn) => {
    setRetry(() => retryFn);
    setVisible(true);
  };

  const askAll = async () => {
    const cam = await askCameraPermission();
    if (!cam) return showModal(askAll);

    const storage = await askStoragePermission();
    if (!storage) return showModal(askAll);

    const location = await askLocationPermission();
    if (!location) return showModal(askAll);

    return true;
  };

  const PermissionModal = () => (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Permissions Needed</Text>
          <Text style={styles.text}>
            Your device permissions were denied. Please allow permissions to
            continue using the app.
          </Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              setVisible(false);
              retry();
            }}
          >
            <Text style={styles.btnText}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return { askAll, PermissionModal };
};


// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 7,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  text: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
