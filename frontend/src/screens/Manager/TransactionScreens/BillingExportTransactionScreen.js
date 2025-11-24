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
import api from "../../../api/api";
import { useFocusEffect } from "@react-navigation/native";

export default function BillingExportTransactionScreen({ navigation }) {
  const [store, setStore] = useState(null);
  const [profile, setProfile] = useState(null);

  const [managerSignature, setManagerSignature] = useState(null);
  const [vendorSignature, setVendorSignature] = useState(null);

  // Fetch store + manager profile
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

  useFocusEffect(
  React.useCallback(() => {
    const loadSignatures = async () => {
      const vendorSig = await AsyncStorage.getItem("vendorSignature");
      const managerSig = await AsyncStorage.getItem("managerSignature");

      if (managerSig) setManagerSignature(managerSig);
      if (vendorSig) setVendorSignature(vendorSig);
    };

    loadSignatures();
  }, [])
);

  // Load both signatures from async storage
  // useFocusEffect(() => {
  //   loadSignatures();
  // }, []);

  // const loadSignatures = async () => {
  //   const managerSig = await AsyncStorage.getItem("managerSignature");
  //   const vendorSig = await AsyncStorage.getItem("vendorSignature");

  //   if (managerSig) setManagerSignature(managerSig);
  //   if (vendorSig) setVendorSignature(vendorSig);
  // };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Billing Transaction</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("ExportDataScreen")}
        >
          <MaterialIcons name="file-download" size={26} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* BILL AREA */}
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

          {/* Total Words */}
          <Text style={styles.totalWords}>
            Grand Total (in words): _______________________________________
          </Text>


          <View style={styles.signatureRow}>

            {/* MANAGER SIGNATURE */}
            <View style={{ alignItems: "center" }}>
              {managerSignature ? (
                <Image
                  source={{ uri: managerSignature }}
                  style={styles.signatureImg}
                />
              ) : (
                <Image
                  source={{ uri: "https://picsum.photos/55" }}
                  style={styles.signatureImg}
                />
              )}
              <Text style={styles.signatureLabel}>Manager Signature</Text>
            </View>

            {/* VENDOR SIGNATURE */}
            <View style={{ alignItems: "center" }}>
                  <Image
                    source={{ uri: vendorSignature }}
                    style={styles.signatureImg}
                  />
                  <Text style={styles.signatureLabel}>Vendor Signature</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>
            * Above bill is true and correct *
          </Text>
        </View>

        {/* Export */}
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={() => navigation.navigate("ExportDataScreen")}
        >
          <Text style={styles.exportText}>Export Bill</Text>
        </TouchableOpacity>
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

  // subHeading: {
  //   fontSize: 18,
  //   fontWeight: "700",
  //   marginTop: 20,
  //   marginBottom: 10,
  // },

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

  exportBtn: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  exportText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

