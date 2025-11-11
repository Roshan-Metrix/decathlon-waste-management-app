import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Input from "../Components/Input";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Picker } from "@react-native-picker/picker";

export default function RegisterScreen({ navigation }) {
  const { register, error, setError } = useContext(AuthContext);
  const [role, setRole] = useState("staff");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const res = await register(name, email, password, role);
    if (res.success) {
      setError(res.data.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Input placeholder="Full Name" onChangeText={setName} />
      <Input placeholder="Email" onChangeText={setEmail} />
      <Input secure placeholder="Password" onChangeText={setPassword} />

      <Picker
        selectedValue={role}
        onValueChange={setRole}
        style={styles.picker}
      >
        <Picker.Item label="Manager" value="manager" />
        <Picker.Item label="Staff" value="staff" />
        <Picker.Item label="Vendor" value="vendor" />
      </Picker>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000000",
  },
  picker: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  button: {
    backgroundColor: "#1e40af",
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  loginText: {
    color: "#ffffff",
    textAlign: "center",
    marginTop: 16,
  },
  errorText: {
    color: "green",
    marginBottom: 16,
  },
  linkText: {
    color: "#1e40af",
    textAlign: "center",
    marginTop: 16,
  },
});
