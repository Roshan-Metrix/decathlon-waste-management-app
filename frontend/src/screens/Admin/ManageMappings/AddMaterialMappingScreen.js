import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

export default function AddMaterialMappingScreen({ navigation }) {
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

  return (
    <View style={styles.container}>
      {/*  Header  */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Remove Region</Text>

        <View style={{ width: 30 }} />
      </View>


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
    backgroundColor: "#f1f5f9",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e3a8a",
  },
});