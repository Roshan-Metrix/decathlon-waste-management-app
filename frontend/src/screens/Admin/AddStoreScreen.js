// import FeatureLayout from "../../Components/FeatureLayout";

// export default function AddStoreScreen({ navigation }) {
//   return <FeatureLayout navigation={navigation} title="Add Store" icon="store" />;
// }
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function AddStoreScreen({ navigation }) {
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const handleAddStore = () => {
    if (!storeName || !storeLocation || !contactNumber) {
      alert("Please fill all fields!");
      return;
    }
    alert(`✅ Store "${storeName}" added successfully!`);
    setStoreName("");
    setStoreLocation("");
    setContactNumber("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Store</Text>
        <View style={{ width: 26 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <MaterialIcons name="store" size={60} color="#2563eb" />
        </View>

        <Text style={styles.subTitle}>Enter Store Details</Text>

        {/* Input Fields */}
        <View style={styles.form}>
          <TextInput
            placeholder="Store Name"
            value={storeName}
            onChangeText={setStoreName}
            style={styles.input}
          />
          <TextInput
            placeholder="Location"
            value={storeLocation}
            onChangeText={setStoreLocation}
            style={styles.input}
          />
          <TextInput
            placeholder="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddStore}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add-business" size={22} color="#fff" />
          <Text style={styles.addText}>Add Store</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

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
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
  },
  iconCircle: {
    backgroundColor: "#e0e7ff",
    padding: 20,
    borderRadius: 100,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
  },
  form: {
    width: "100%",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 15,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
  },
  addText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 8,
  },
});
