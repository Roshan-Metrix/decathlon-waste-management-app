// This screen is currently not in use but kept for potential future needs.

import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeButton from '../../../Components/HomeButton';
import { useFocusEffect } from "@react-navigation/native";

export default function VendorSignatureScreen({ navigation }) {
  const signatureRef = useRef(null);
  const [signature, setSignature] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      handleClear();
    }, [])
  );

  const handleSignature = async (sig) => {
    setSignature(sig);
    setSubmitted(true);

    try {
      await AsyncStorage.setItem("vendorSignature", sig);
    } catch (err) {
      console.log("Error saving signature: ", err);
    }
  };

  const handleClear = async () => {
    try {
      signatureRef.current?.clearSignature();
    } catch (e) {}

    setSignature(null);
    setSubmitted(false);
    await AsyncStorage.removeItem("vendorSignature");
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#1e40af" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Signature</Text>
        <View style={{ width: 26 }} />
        <HomeButton />
      </View>

      <Text style={styles.heading}>Vendor Signature</Text>

      {!submitted ? (
        <View style={styles.signatureBox}>
          <SignatureScreen
            ref={signatureRef}
            onOK={handleSignature}
            onEmpty={() => alert("Please sign first")}
            descriptionText="Sign here"
            clearText="Clear"
            confirmText="Save"
            webStyle={style}
          />
        </View>
      ) : (
        <View style={styles.previewBox}>
          <Image source={{ uri: signature }} style={styles.signatureImage} />
        </View>
      )}

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => {
          signatureRef.current.readSignature();
          navigation.navigate("BillingExportTransactionScreen");
        }}
      >
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
        <Text style={styles.clearText}>Clear Signature</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#fff",
    marginHorizontal: -20,
    paddingHorizontal: 20,
    elevation: 3,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e40af",
  },

  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
  },

  signatureBox: {
    height: 300,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },

  previewBox: {
    height: 300,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    marginBottom: 20,
  },

  signatureImage: {
    width: "100%",
    height: "100%",
  },

  submitBtn: {
    backgroundColor: "#1e40af",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  clearBtn: {
    backgroundColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  clearText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

const style = `
  .m-signature-pad { border: none; box-shadow: none; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { display: none; }
`;

