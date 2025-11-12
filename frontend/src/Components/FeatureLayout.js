import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function FeatureLayout({ navigation, title, icon }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <View>
        <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={{ width: 26 }} /> 
      </View>

      {/* Icon and Title */}
      <View style={styles.content}>
        <MaterialIcons name={icon} size={80} color="#2563eb" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>
          This is the {title} screen. We can design this feature’s full logic
          later.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
  },
  desc: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },
});
