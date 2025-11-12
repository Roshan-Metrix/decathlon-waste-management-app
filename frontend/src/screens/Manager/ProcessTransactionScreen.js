// import FeatureLayout from "../../Components/FeatureLayout";

// export default function ProcessTransactionScreen({ navigation }) {
//   return <FeatureLayout navigation={navigation} title="Process Transaction" icon="account-balance" />;
// }

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProcessTransactionScreen({ navigation }) {
  const [storeId, setStoreId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleProcess = () => {
    if (!storeId || !amount) {
      Alert.alert("Missing Fields", "Please enter Store ID and Amount.");
      return;
    }
    Alert.alert("Transaction Processed", `₹${amount} processed for Store ID: ${storeId}`);
    setStoreId("");
    setAmount("");
    setDescription("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Process Transaction</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Form Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text style={styles.label}>Store ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Store ID"
            placeholderTextColor="#9ca3af"
            value={storeId}
            onChangeText={setStoreId}
          />

          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Transaction Amount"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            placeholder="Optional description..."
            placeholderTextColor="#9ca3af"
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.processButton} onPress={handleProcess}>
            <MaterialIcons name="account-balance" size={22} color="#fff" />
            <Text style={styles.processText}>Process Transaction</Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={22} color="#2563eb" />
          <Text style={styles.infoText}>
            Ensure all transaction details are correct before submission. Once processed, it cannot be reversed.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  form: {
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  processButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 25,
  },
  processText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 25,
  },
  infoText: {
    color: "#1e3a8a",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
