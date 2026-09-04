import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";
import { generatePassword } from "../../../lib/generatePassword";
import DropDownPicker from "react-native-dropdown-picker";

export default function AddStoreScreen({ navigation }) {
  const [storeId, setStoreId] = useState("");
  const [name, setName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(null);
  const [regionItems, setRegionItems] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);

  const [vendorOpen, setVendorOpen] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [vendorsName, setVendorsName] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(false);

  useEffect(() => {
    setPassword(generatePassword());
  }, []);

  const copyPassword = async () => {
    await Clipboard.setStringAsync(password);
    blink();
    setAlertMessage("Password copied to clipboard");
    setAlertVisible(true);
  };

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const blink = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.2,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSumbit = async () => {
    if (
      !storeId ||
      !name ||
      !storeLocation ||
      !state ||
      !contactNumber ||
      !email ||
      !password ||
      !vendor
    ) {
      setAlertMessage("Please fill all field.");
      setAlertVisible(true);
      return;
    }
    try {
      setLoading(true);

      const payload = {
        storeId,
        name,
        storeLocation,
        state,
        contactNumber,
        email,
        password,
        vendorName: vendor,
      };

      const { data } = await api.post("/auth/admin/registerStore", payload);

      if (data.success) {
        setAlertMessage(data.message || "Store created successfully.");
        setAlertVisible(true);

        setStoreId("");
        setName("");
        setStoreLocation("");
        setState("");
        setContactNumber("");
        setEmail("");
        setVendorsName([]);
      } else {
        setAlertMessage(data.message || "Something went wrong");
        setAlertVisible(true);
      }
    } catch (err) {
      console.log("Error in AddStoreScreen: ", err);
      setAlertMessage("Something went wrong");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      setRegionsLoading(true);
      const { data } = await api.get("/auth/get-regions");

      if (data.success) {
        const formatted = data.regions.map((r) => ({
          label: r,
          value: r,
        }));

        setRegionItems(formatted);
      }
    } catch (error) {
      console.log("Fetch Regions Error:", error.message);
    } finally {
      setRegionsLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setVendorLoading(true);
      const res = await api.get("/vendor/get-all-vendors");

      if (res.data?.success && Array.isArray(res.data.vendors)) {
        const vendors = res.data.vendors.map((v) => ({
          label: v.name,
          value: v.name,
        }));

        setVendorsName(vendors);
      }
    } catch (error) {
      console.log("Fetch Vendor Error:", error.message);
    } finally {
      setVendorLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
    fetchVendors();
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Store</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* KEYBOARD SAFE AREA */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.form}>
              <View style={styles.inputRow}>
                <MaterialIcons name="badge" size={22} color="#2563eb" />
                <TextInput
                  placeholder="Store ID"
                  placeholderTextColor="#7e7c7c"
                  value={storeId}
                  onChangeText={setStoreId}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="storefront" size={22} color="#2563eb" />
                <TextInput
                  placeholder="Store Name"
                  placeholderTextColor="#7e7c7c"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="location-on" size={22} color="#2563eb" />
                <TextInput
                  placeholder="Location"
                  placeholderTextColor="#7e7c7c"
                  value={storeLocation}
                  onChangeText={setStoreLocation}
                  style={styles.input}
                />
              </View>

              <View style={[styles.inputRow, styles.regionRow]}>
                <MaterialIcons name="location-city" size={22} color="#2563eb" />
                <DropDownPicker
                  open={open}
                  value={state}
                  items={regionItems}
                  setOpen={setOpen}
                  setValue={setState}
                  setItems={setRegionItems}
                  placeholder={
                    regionsLoading ? "Loading regions..." : "Select Region"
                  }
                  loading={regionsLoading}
                  listMode="SCROLLVIEW"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  animationType="slide"
                  arrowIconContainerStyle={styles.arrowIconContainer}
                />
              </View>

              <View style={[styles.inputRow, styles.vendorRow]}>
                <MaterialIcons
                  name="manage-accounts"
                  size={22}
                  color="#2563eb"
                />
                <DropDownPicker
                  open={vendorOpen}
                  value={vendor}
                  items={vendorsName}
                  setOpen={setVendorOpen}
                  setValue={setVendor}
                  setItems={setVendorsName}
                  placeholder={
                    vendorLoading ? "Loading vendors..." : "Select Vendor"
                  }
                  loading={vendorLoading}
                  listMode="SCROLLVIEW"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  animationType="slide"
                  arrowIconContainerStyle={styles.arrowIconContainer}
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="call" size={22} color="#2563eb" />
                <TextInput
                  placeholder="Contact Number"
                  placeholderTextColor="#7e7c7c"
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  keyboardType="numeric"
                  style={styles.input}
                  maxLength={10}
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="email" size={22} color="#2563eb" />
                <TextInput
                  placeholder="Store Email"
                  placeholderTextColor="#7e7c7c"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>

              <View style={styles.passwordBox}>
                <MaterialIcons name="lock" size={24} color="#2563eb" />

                <TouchableOpacity onPress={copyPassword} style={{ flex: 1 }}>
                  <Animated.Text
                    style={[styles.passwordText, { opacity: fadeAnim }]}
                  >
                    {password}
                  </Animated.Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPassword(generatePassword())}
                >
                  <MaterialIcons name="refresh" size={26} color="#2563eb" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addButton, loading && { opacity: 0.7 }]}
              onPress={handleSumbit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.addText}>Adding Store...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="add-business" size={20} color="#fff" />
                  <Text style={styles.addText}>Add Store</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

/*  STYLES  */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  passwordText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
  },

  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    gap: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 45,
    paddingBottom: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  iconCircle: {
    backgroundColor: "#e0e7ff",
    padding: 18,
    borderRadius: 100,
    marginBottom: 10,
  },

  form: {
    width: "100%",
    gap: 12,
  },

  // All normal input rows
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    position: "relative",
    width: "100%",
  },

  regionRow: { zIndex: 2000 },
  vendorRow: { zIndex: 1000 },

  dropdown: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: "transparent",
    minHeight: 40,
  },

  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    width: "96%",
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
  },

  dropdownText: {
    fontSize: 15,
    color: "#333",
  },

  arrowIconContainer: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
    color: "#333",
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 13,
    borderRadius: 12,
    width: "100%",
    marginTop: 18,
  },

  addText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});
