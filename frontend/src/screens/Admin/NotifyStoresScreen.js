// import FeatureLayout from "../../Components/FeatureLayout";

// export default function NotifyStoresScreen({ navigation }) {
//   return <FeatureLayout navigation={navigation} title="Notify Stores" icon="notifications" />;
// }

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function NotifyStoresScreen({ navigation }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message before sending.");
      return;
    }
    Alert.alert("Success", "Notification sent successfully!");
    setMessage("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notify Stores</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconCircle}>
          <MaterialIcons name="notifications-active" size={60} color="#2563eb" />
        </View>

        <Text style={styles.subTitle}>Send Notifications</Text>
        <Text style={styles.desc}>
          Use this feature to instantly notify all store managers or staff about
          important updates, announcements, or events.
        </Text>

        {/* Message Box */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Notification Message</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={5}
            placeholder="Type your message here..."
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.button, !message.trim() && { opacity: 0.5 }]}
          activeOpacity={0.8}
          onPress={handleSend}
        >
          <MaterialIcons name="send" size={22} color="#fff" />
          <Text style={styles.buttonText}>Send Notification</Text>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={22} color="#2563eb" />
          <Text style={styles.infoText}>
            Notifications will appear instantly in each store’s dashboard. Use
            wisely for urgent updates only.
          </Text>
        </View>
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
    marginBottom: 10,
  },
  desc: {
    fontSize: 15,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 25,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  inputBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    height: 120,
    textAlignVertical: "top",
    fontSize: 15,
    color: "#111827",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 40,
  },
  infoText: {
    color: "#1e3a8a",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
});
