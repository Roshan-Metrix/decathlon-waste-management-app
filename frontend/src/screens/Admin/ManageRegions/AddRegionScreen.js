import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Alert from "../../../Components/Alert";
import api from "../../../api/api";
import { ActivityIndicator } from "react-native";

export default function AddRegionScreen({ navigation }) {
  const [stateName, setStateName] = useState("");
  const [materials, setMaterials] = useState([{ materialType: "", rate: "" }]);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // Add new material row
  const addMaterialField = () => {
    setMaterials([...materials, { materialType: "", rate: "" }]);
  };

  // Handle material change
  const handleMaterialChange = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  // Remove material row
  const removeMaterialField = (index) => {
    const updated = materials.filter((_, i) => i !== index);
    setMaterials(updated);
  };

  const handleAddRegion = async () => {
    if (!stateName.trim()) {
      setAlertMessage("Please enter state name");
      setAlertVisible(true);
      return;
    }

    const formattedMaterials = materials
      .filter((m) => m.materialType && m.rate)
      .map((m) => ({
        materialType: m.materialType.trim(),
        rate: Number(m.rate),
      }));

    if (formattedMaterials.length === 0) {
      setAlertMessage("Please add at least one valid material");
      setAlertVisible(true);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        state: stateName.trim(),
        materials: formattedMaterials,
      };

      const response = await api.post("/auth/admin/add-materials", payload);

      if (response.data.success) {
        setAlertMessage(response.data.message);
        setAlertVisible(true);

        // Reset form
        setStateName("");
        setMaterials([{ materialType: "", rate: "" }]);
      } else {
        setAlertMessage(response.data.message || "Something went wrong");
        setAlertVisible(true);
      }
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message || "Server error occurred";

      setAlertMessage(serverMessage);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1e40af" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Region</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* State Input */}
        <Text style={styles.sectionTitle}>Region</Text>
        <View style={styles.inputBox}>
          <MaterialIcons name="map" size={22} color="#2563eb" />
          <TextInput
            style={styles.input}
            placeholder="Enter Region Name"
            placeholderTextColor="#7e7c7c"
            value={stateName}
            onChangeText={setStateName}
          />
        </View>

        {/* Materials Section */}
        <Text style={styles.sectionTitle}>Materials</Text>

        {materials.map((item, index) => (
          <View key={index} style={styles.materialCard}>
            <View style={styles.inputBox}>
              <MaterialIcons name="category" size={22} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Material Type"
                placeholderTextColor="#7e7c7c"
                value={item.materialType}
                onChangeText={(text) =>
                  handleMaterialChange(index, "materialType", text)
                }
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialIcons name="currency-rupee" size={22} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Rate (per kg)"
                placeholderTextColor="#7e7c7c"
                keyboardType="numeric"
                value={item.rate}
                onChangeText={(text) =>
                  handleMaterialChange(index, "rate", text)
                }
              />
              <Text style={styles.unitText}>/ kg</Text>
            </View>

            <Text style={styles.helperText}>* Rate is per kilogram</Text>

            {materials.length > 1 && (
              <TouchableOpacity
                style={styles.removeMaterialBtn}
                onPress={() => removeMaterialField(index)}
              >
                <MaterialIcons name="delete" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Add Material Button */}
        <TouchableOpacity
          style={styles.addMaterialBtn}
          onPress={addMaterialField}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
          <Text style={styles.addMaterialText}>Add More Material</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleAddRegion}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Save Region</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    shadowColor: "#1e40af",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e40af",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 10,
  },
  materialCard: {
    backgroundColor: "#eaf0ff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  addMaterialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  addMaterialText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  removeMaterialBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#ef4444",
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
  },
  submitBtn: {
    backgroundColor: "#1e40af",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  unitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },

  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 5,
  },
});
