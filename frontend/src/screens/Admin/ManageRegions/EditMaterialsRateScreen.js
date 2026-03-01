import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function EditMaterialsRateScreen({ route, navigation }) {
  const { stateName } = route.params;

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fetchMaterials = async () => {
    try {
      const { data } = await api.get(
        `/auth/get-regional-materials/${stateName}`
      );

      if (data.success) {
        const formatted = data.materials.map((item) => {
          const parts = item.split(":");
          return {
            materialType: parts[0].trim(),
            rate: parts[1]?.trim() || "",
          };
        });

        setMaterials(formatted);
      }
    } catch (error) {
      console.log("Fetch Materials Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const addMaterialField = () => {
    setMaterials([...materials, { materialType: "", rate: "" }]);
  };

  const handleSave = async () => {
    const validMaterials = materials
      .filter((m) => m.materialType && m.rate !== "")
      .map((m) => ({
        materialType: m.materialType.trim(),
        rate: Number(m.rate),
      }));

    if (validMaterials.length === 0) {
      setAlertMessage("Please add valid materials");
      setAlertVisible(true);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        state: stateName,
        materials: validMaterials,
      };

      const response = await api.post(
        "/auth/admin/add-materials",
        payload
      );

      if (response.data.success) {
        setAlertMessage(response.data.message);
      } else {
        setAlertMessage(response.data.message || "Update failed");
      }

      setAlertVisible(true);
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message || "Server error occurred";

      setAlertMessage(serverMessage);
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{stateName}</Text>

        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 40 }}
        />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>
              Material Types & Rates (per kg)
            </Text>

            {materials.map((item, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Material Type</Text>
                  <TextInput
                    style={styles.input}
                    value={item.materialType}
                    onChangeText={(text) =>
                      handleChange(index, "materialType", text)
                    }
                    placeholder="Enter material name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Rate</Text>
                  <View style={styles.rateRow}>
                    <TextInput
                      style={styles.rateInput}
                      keyboardType="numeric"
                      value={String(item.rate)}
                      onChangeText={(text) =>
                        handleChange(index, "rate", text)
                      }
                      placeholder="Enter rate"
                    />
                    <Text style={styles.unit}>₹ / kg</Text>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addBtn}
              onPress={addMaterialField}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.addText}>Add Material</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                saving && { opacity: 0.7 },
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    elevation: 8,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e40af",
  },

  content: {
    padding: 20,
    paddingBottom: 80,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#0f172a",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
    elevation: 4,
  },

  inputGroup: {
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },

  rateRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rateInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },

  unit: {
    marginLeft: 10,
    fontWeight: "600",
    color: "#2563eb",
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  addText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },

  saveBtn: {
    backgroundColor: "#1e3a8a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});