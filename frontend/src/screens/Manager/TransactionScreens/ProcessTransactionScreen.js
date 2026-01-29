import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../../colors";

export default function ProcessTransactionScreen({ navigation }) {
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);

  const [calibrationStatus, setCalibrationStatus] = useState("Pending");
  const [credentialStatus, setCredentialStatus] = useState("Pending");

  // LOAD transaction ID
  const fetchTransactionId = async () => {
    try {
      setLoading(true);

      const todayData = await AsyncStorage.getItem("todayTransaction");
      const parsed = JSON.parse(todayData || "{}");
      setTransactionId(parsed.transactionId || "");
    } catch (error) {
      console.log("AsyncStorage Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // LOAD STATUS WHEN SCREEN IS FOCUSED
  useFocusEffect(
    useCallback(() => {
      const loadStatus = async () => {
        const calib = await AsyncStorage.getItem("calibrationStatus");
        const cred = await AsyncStorage.getItem("credentialStatus");

        setCalibrationStatus(calib || "Pending");
        setCredentialStatus(cred || "Pending");
      };

      loadStatus();
    }, [])
  );

  useEffect(() => {
    fetchTransactionId();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isReady =
    calibrationStatus === "Completed" && credentialStatus === "Completed";

  const getStatusStyle = (status) =>
    status === "Completed" ? styles.completed : styles.pending;

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("UserScreen")}>
          <MaterialIcons name="arrow-back" size={40} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Process Transaction</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Top Icon */}
      <View style={styles.topIconWrapper}>
        <View style={styles.topIconCircle}>
          <MaterialIcons name="account-balance" size={60} color={colors.primary} />
        </View>
        <Text style={styles.topTitle}>Transaction Processing</Text>
        <Text style={styles.topSubtitle}>
          Complete the necessary phases below
        </Text>
      </View>

      {/* CONTENT */}
      <View style={styles.container}>
        <Text style={styles.label}>Transaction ID </Text>
        {transactionId ? (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={transactionId}
              editable={false}
            />
          </View>
        ) : (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value="Add Transaction First"
              editable={false}
            />
          </View>
        )}
        {/* Calibration Phase */}
        <TouchableOpacity
          style={[styles.phaseButton, !transactionId && styles.disabled]}
          disabled={!transactionId}
          onPress={() =>
            navigation.navigate("CalibrationPhaseScreen", { transactionId })
          }
        >
          <View>
            <Text style={styles.phaseTitle}>Calibration Phase</Text>
            <Text style={styles.phaseDesc}>Begin initial verification</Text>
          </View>

          <View style={[styles.statusBadge, getStatusStyle(calibrationStatus)]}>
            <Text style={styles.statusText}>{calibrationStatus}</Text>
          </View>
        </TouchableOpacity>

        {/* Credential Verification */}
        <TouchableOpacity
          style={[styles.phaseButton, !transactionId && styles.disabled]}
          disabled={!transactionId}
          onPress={() =>
            navigation.navigate("CredentialVerificationScreen", {
              transactionId,
            })
          }
        >
          <View>
            <Text style={styles.phaseTitle}>Credential Verification</Text>
            <Text style={styles.phaseDesc}>Verify Signature</Text>
          </View>

          <View style={[styles.statusBadge, getStatusStyle(credentialStatus)]}>
            <Text style={styles.statusText}>{credentialStatus}</Text>
          </View>
        </TouchableOpacity>

        {/* Final Button */}
        <TouchableOpacity
          disabled={!isReady}
          onPress={() =>
            navigation.navigate("ItemsTransactionScreen", { transactionId })
          }
          style={[
            styles.finalButton,
            { backgroundColor: isReady ? colors.primary : "#94a3b8" },
          ]}
        >
          <Text style={styles.finalButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ----------------- STYLES -----------------
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    marginLeft: 15,
  },
  topIconWrapper: { alignItems: "center", marginTop: 25, marginBottom: 10 },
  topIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 12,
  },
  topSubtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },

  container: { padding: 20 },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 10,
  },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    elevation: 2,
  },

  phaseButton: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  disabled: { opacity: 0.5 },

  phaseTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  phaseDesc: { fontSize: 13, color: "#6b7280", marginTop: 4 },

  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  completed: { backgroundColor: "#dcfce7" },
  pending: { backgroundColor: "#fee2e2" },
  statusText: { fontSize: 13, fontWeight: "700", color: "#111827" },

  finalButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  finalButtonText: { fontSize: 18, fontWeight: "700", color: "#fff" },
});
