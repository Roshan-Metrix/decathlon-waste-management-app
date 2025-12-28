import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import api from "../../../api/api";
import {
  clearOldTransaction,
  saveTodayTransaction,
} from "../../../utils/storage";
import colors from "../../../colors";
import { AuthContext } from "../../../context/AuthContext";
import Alert from "../../../Components/Alert";

export default function AddTransactionScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [sendingLoading, setSendingLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [managerName, setManagerName] = useState("");
  // Vendor Dropdown
  const [vendorOpen, setVendorOpen] = useState(false);
  const [vendorName, setVendorName] = useState(null);
  const [vendorItems, setVendorItems] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  const fetchVendors = async () => {
    try {
      setVendorsLoading(true);
      const res = await api.get("/auth/vendor/get-all-vendors");

      if (res.data?.success && Array.isArray(res.data.vendors)) {
        const vendors = res.data.vendors.map((v) => ({
          label: v.name,
          value: v.name,
        }));

        setVendorItems(vendors);
      }
    } catch (error) {
      console.error("Vendor fetch error:", error);
      setAlertMessage("Failed to fetch vendors.");
      setAlertVisible(true);
    } finally {
      setVendorsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      if (user?.role === "manager") {
        const res = await api.get("/auth/manager/profile");
        if (res.data.success) {
          setStoreId(res.data.store.storeId);
          setStoreName(res.data.store.name);
          setStoreLocation(res.data.store.storeLocation);
          setManagerName(res.data.manager.name || "Manager");
        }
      }

      if (user?.role === "store") {
        const res = await api.get("/auth/store/profile");
        if (res.data.success) {
          setStoreId(res.data.store.storeId);
          setStoreName(res.data.store.name);
          setStoreLocation(res.data.store.storeLocation);
          setManagerName("Store");
        }
      }
    } catch (error) {
      setAlertMessage("Failed to load profile.");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchProfile();
  }, []);

  const handleProcess = async () => {
    if (!vendorName) {
      setAlertMessage("Please select Vendor Name.");
      setAlertVisible(true);
      return;
    }

    try {
      setSendingLoading(true);

      const res = await api.post("/manager/transaction/add-transaction", {
        storeId,
        storeName,
        storeLocation,
        managerName,
        vendorName,
      });

      const transactionId = res.data?.transactionId;
      if (!transactionId) {
        throw new Error("Transaction failed");
      }

      await clearOldTransaction();
      await saveTodayTransaction(transactionId);

      navigation.navigate("ProcessTransactionScreen");
    } catch (error) {
      console.log("Transaction error:", error);
      setAlertMessage("Transaction failed!");
      setAlertVisible(true);
    } finally {
      setSendingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const today = new Date()
    .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back"
                size={26}
                color={colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Transaction</Text>
            <View style={{ width: 26 }} />
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Date</Text>
            <TextInput style={styles.input} value={today} editable={false} />

            <Text style={styles.label}>Store ID</Text>
            <TextInput style={styles.input} value={storeId} editable={false} />

            <Text style={styles.label}>Store Name</Text>
            <TextInput style={styles.input} value={storeName} editable={false} />

            <Text style={styles.label}>Store Location</Text>
            <TextInput
              style={styles.input}
              value={storeLocation}
              editable={false}
            />

            <Text style={styles.label}>Manager Name</Text>
            <TextInput
              style={styles.input}
              value={managerName}
              editable={false}
            />

            <Text style={styles.label}>Vendor Name</Text>

            <View style={{ zIndex: 3000, elevation: 3000 }}>
              <DropDownPicker
                open={vendorOpen}
                value={vendorName}
                items={vendorItems}
                setOpen={setVendorOpen}
                setValue={setVendorName}
                setItems={setVendorItems}
                loading={vendorsLoading}
                placeholder={
                  vendorsLoading ? "Loading vendors..." : "Select Vendor"
                }
                listMode="SCROLLVIEW"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <TouchableOpacity
              style={styles.processButton}
              onPress={handleProcess}
            >
              <MaterialIcons name="account-balance" size={22} color="#fff" />
              <Text style={styles.processText}>Process Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {sendingLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>
            Processing...
          </Text>
        </View>
      )}

      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

/* ---------- Styles ----------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  scrollContent: {
    paddingBottom: 60,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

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
  },

  form: {
    marginTop: 20,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 14,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: "#1f2937",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9fafb",
  },

  dropdown: {
    borderRadius: 10,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },

  dropdownContainer: {
    borderColor: "#d1d5db",
  },

  processButton: {
    backgroundColor: colors.primary,
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
});
