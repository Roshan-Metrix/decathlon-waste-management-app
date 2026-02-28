import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export const FeatureCard = ({ title, iconName, iconColor, onPress, description }) => (
  <TouchableOpacity
    style={[styles.cardContainer, { borderLeftColor: iconColor }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconWrapper, { backgroundColor: iconColor + "15" }]}>
      <MaterialIcons name={iconName} size={30} color={iconColor} />
    </View>
    <View style={styles.textWrapper}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
    <MaterialIcons
      name="arrow-forward-ios"
      size={16}
      color="#9ca3af"
      style={{ marginLeft: 10 }}
    />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  textWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
});