import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import Input from "../Components/Input";
import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register, error, setError } = useContext(AuthContext);
  const [role, setRole] = useState("staff");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password)
      return setError("Please fill all fields");
    setLoading(true);
    try {
      const res = await register(name, email, password, role);
      if (res.success) setError(res.data.message);
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Ionicons name="person-add-outline" size={70} color="#2563eb" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join and get started</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            icon={<Ionicons name="person-outline" size={22} color="#2563eb" />}
            placeholder="Full Name"
            onChangeText={setName}
          />
          <Input
            icon={<Ionicons name="mail-outline" size={22} color="#2563eb" />}
            placeholder="Email"
            onChangeText={setEmail}
          />
          <Input
            icon={<Ionicons name="lock-closed-outline" size={22} color="#2563eb" />}
            secure
            placeholder="Password"
            onChangeText={setPassword}
          />

          <View style={styles.pickerContainer}>
            <Ionicons
              name="briefcase-outline"
              size={20}
              color="#2563eb"
              style={{ marginRight: 8 }}
            />
            <Picker
              selectedValue={role}
              onValueChange={setRole}
              style={styles.picker}
            >
              <Picker.Item label="Manager" value="manager" />
              <Picker.Item label="Staff" value="staff" />
            </Picker>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.8 }]}
            onPress={handleSignup}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={{ fontWeight: "bold" }}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  formContainer: {
    gap: 14,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  picker: {
    flex: 1,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  linkText: {
    textAlign: "center",
    marginTop: 14,
    color: "#374151",
  },
  errorText: {
    color: "green",
    textAlign: "center",
    marginVertical: 8,
  },
});
