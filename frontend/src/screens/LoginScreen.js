import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Input from "../Components/Input";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await login(email, password);
    alert(res.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Input placeholder="Email" onChangeText={setEmail} />
      <Input secure placeholder="Password" onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText}>Create an account</Text>
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
  button: {
    backgroundColor: "#1e40af",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  linkText: {
    color: "#1e40af",
    textAlign: "center",
    marginTop: 16,
  },
});
