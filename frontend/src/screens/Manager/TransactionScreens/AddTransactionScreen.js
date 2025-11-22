import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import api from "../../../api/api";

export default function AddTransactionScreen({ navigation }) {
  const [loading, setLoading] = useState(true);

  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [managerName, setManagerName] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Vendor Dropdown
  const [vendorOpen, setVendorOpen] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [vendorItems, setVendorItems] = useState([
    { label: "Hulas Steel", value: "Hulas Steel" },
    { label: "CG Suppliers", value: "CG Suppliers" },
    { label: "Global Traders", value: "Global Traders" },
    { label: "Others", value: "Others" },
  ]);

  const [otherVendor, setOtherVendor] = useState("");

  // Fetch manager profile
  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/manager/profile");

      if (res.data.success) {
        setStoreId(res.data.store.storeId);
        setStoreName(res.data.store.name);
        setStoreLocation(res.data.store.storeLocation);
        setManagerName(res.data.manager.name || "Manager");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load manager profile.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // const handleProcess = async () => {
  //   if (!vendor) {
  //     return Alert.alert("Missing", "Please select Vendor Name.");
  //   }

  //   if (vendor === "Others" && !otherVendor.trim()) {
  //     return Alert.alert("Missing Field", "Please enter Vendor Name.");
  //   }

  //   try {
  //     const res = await api.post("/manager/transaction/add-transaction", {
  //       storeId,
  //       storeName,
  //       storeLocation,
  //       managerName,
  //       vendorName: vendor === "Others" ? otherVendor : vendor,
  //     });

  //     if (res.data.transactionId) {
  //       setTransactionId(res.data.transactionId);

  //       navigation.navigate("ProcessTransactionScreen", {
  //         transactionId: res.data.transactionId,
  //       });
  //     } else {
  //       Alert.alert("Error", "Failed to create transaction.");
  //     }
  //   } catch (error) {
  //     console.log("Transaction Create Error:", error);
  //     Alert.alert("Error", "Something went wrong while creating transaction.");
  //   }
  // };

  const handleProcess = async () => {
  if (!vendor) {
    return Alert.alert("Missing", "Please select Vendor Name.");
  }

  if (vendor === "Others" && !otherVendor.trim()) {
    return Alert.alert("Missing Field", "Please enter Vendor Name.");
  }

  try {
    const payload = {
      storeId: storeId,                  // must be string
      storeName: storeName,              // must be string
      storeLocation: storeLocation,      // must be string
      managerName: managerName,          // must be string
      vendorName: vendor === "Others" ? otherVendor : vendor,
    };

    console.log("Sending Payload:", payload);

    const res = await api.post("/manager/transaction/add-transaction", payload);

    if (res.data?.transactionId) {
      setTransactionId(res.data.transactionId);

      navigation.navigate("ProcessTransactionScreen", {
        transactionId: res.data.transactionId,
      });
    } else {
      Alert.alert("Error", "Failed to create transaction.");
    }
  } catch (error) {
    console.log("Transaction Create Error:", error?.response?.data || error);
    Alert.alert("Error", "Something went wrong while creating transaction.");
  }
};


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.form}>
        {/* Store ID */}
        <Text style={styles.label}>Store ID</Text>
        <TextInput style={styles.input} value={storeId} editable={false} />

        {/* Store Name */}
        <Text style={styles.label}>Store Name</Text>
        <TextInput style={styles.input} value={storeName} editable={false} />

        {/* Store Location */}
        <Text style={styles.label}>Store Location</Text>
        <TextInput
          style={styles.input}
          value={storeLocation}
          editable={false}
        />

        {/* Manager Name */}
        <Text style={styles.label}>Manager Name</Text>
        <TextInput style={styles.input} value={managerName} editable={false} />
        {/* Vendor */}
        <Text style={styles.label}>Vendor Name</Text>

        <View style={{ zIndex: 1000 }}>
          <DropDownPicker
            open={vendorOpen}
            value={vendor}
            items={vendorItems}
            setOpen={setVendorOpen}
            setValue={setVendor}
            setItems={setVendorItems}
            placeholder="Select Vendor"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>

        {vendor === "Others" && (
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Enter Vendor Name"
            value={otherVendor}
            onChangeText={setOtherVendor}
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.processButton}
          onPress={() => handleProcess()}
        >
          <MaterialIcons name="account-balance" size={22} color="#fff" />
          <Text style={styles.processText}>Process Transaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
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
    color: "#2563eb",
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
    zIndex: 1000,
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
});
