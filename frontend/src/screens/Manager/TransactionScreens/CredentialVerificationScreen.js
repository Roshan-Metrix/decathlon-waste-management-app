import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../../colors"

export default function CredentialVerificationScreen({ navigation }) {
  
  const signatureRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignature = async (sig) => {
    try {
      setLoading(true);

      await AsyncStorage.setItem("credentialStatus", "Completed");
      await AsyncStorage.setItem("managerSignature", sig);

      setSubmitted(true);

      setTimeout(() => {
        setLoading(false);
        navigation.goBack();
      }, 500);
    } catch (e) {
      console.log("Error saving signature: ", e);
      setLoading(false);
    }
  };

  const handleClear = () => {
    signatureRef.current.clearSignature();
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Credential Verification</Text>

        <View style={{ width: 26 }} />
      </View>

      <Text style={styles.heading}>Manager Signature</Text>

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

      {/* LOADING SPINNER */}
      {loading && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" />
          <Text style={{ textAlign: "center", marginTop: 10 }}>Submitting...</Text>
        </View>
      )}

      {/* SUBMIT BUTTON */}
      {!submitted && !loading && (
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => signatureRef.current.readSignature()}
        >
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      )}

      {/* CLEAR BUTTON */}
      {!submitted && !loading && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearText}>Clear Signature</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

//  STYLES 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 20,
  },

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
    color: colors.primary,
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

  submitBtn: {
    backgroundColor: colors.primary,
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
