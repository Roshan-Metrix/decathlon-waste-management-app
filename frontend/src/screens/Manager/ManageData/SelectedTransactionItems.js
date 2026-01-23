import React, { use, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { formatTimeStamp } from "../../../lib/formatTimeStamp";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";

const PRIMARY_COLOR = "#1e40af";
const ACCENT_COLOR = "#00bcd4";
const LIGHT_BACKGROUND = "#f9fafb";
const CARD_COLOR = "#ffffff";
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function SelectedTransactionItems({ route, navigation }) {

  const transactionId = route.params?.transactionId || "N/A";
  const NoOfitems = route.params?.NoOfitems || [];
  const managerName = route.params?.managerName || "N/A";
  const createdAt = route.params?.createdAt || "N/A";

  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/manager/transaction/selected-transactions-items/${transactionId}`,
      );
      if (response.data?.success) {
        setTransaction(response.data);
      } else {
        setAlertMessage(response.data?.message || "Failed to load.");
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Fetch error", error);
      setAlertMessage("Network Error");
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const items = transaction?.items || [];

  const totalWeight = items.reduce(
    (sum, item) => sum + Number(item.weight || 0),
    0,
  );

  useEffect(() => {
    fetchTransactions();
  }, [transactionId]);

  const getImageSource = (base64Data) => {
    if (!base64Data || typeof base64Data !== "string") return null;
    if (base64Data.length < 50 || base64Data.includes(".")) {
      return {
        uri: `https://placehold.co/400x200/${PRIMARY_COLOR.substring(
          1,
        )}/ffffff?text=Image+Placeholder+for+${base64Data}`,
      };
    }

    return { uri: `data:image/jpeg;base64,${base64Data}` };
  };

  const renderItemCard = (item, index) => {
    const imageSource = getImageSource(item.image);

    return (
      <View key={index} style={styles.itemCard}>
        {/* Item Header */}
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>Item #{item.itemNo}</Text>
          <Text style={styles.materialText}>{item.materialType}</Text>
        </View>

        {/* Item Image */}
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="image-not-supported" size={40} color="#999" />
            <Text style={styles.placeholderText}>Image Not Available</Text>
          </View>
        )}

        {/* Item Details */}
        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight:</Text>
            <Text style={styles.weightValue}>{item.weight} kg</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Source:</Text>
            <Text
              style={
                item.weightSource === "system"
                  ? styles.systemSource
                  : styles.manualSource
              }
            >
              {item.weightSource.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.itemDate}>
            Added: {formatTimeStamp(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={26} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
         {transactionId || "Data"}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Transaction Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Transaction Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Manager:</Text>
            <Text style={styles.summaryValue}>{managerName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vendor:</Text>
            {/* <Text style={styles.summaryValue}>{transaction.vendorName || "N/A"}</Text> */}
            <Text style={styles.summaryValue}>{transaction?.vendorName || "N/A"}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{NoOfitems}</Text>
          </View>
          <View style={styles.summaryRowTotal}>
            <Text style={styles.totalLabel}>TOTAL WEIGHT:</Text>
            <Text style={styles.totalValue}>{totalWeight.toFixed(2)} kg</Text>
          </View>
          <Text style={styles.dateText}>
            Created On: {formatTimeStamp(createdAt)}
          </Text>
        </View>

        {isLoading ? (
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#787575" }}>Loading transaction items...</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Items ({items.length})</Text>
            {items.map(renderItemCard)}
          </View>
        )}

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
    backgroundColor: LIGHT_BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: CARD_COLOR,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },

  // Summary Card Styles
  summaryCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR + "30",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: PRIMARY_COLOR,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: PRIMARY_COLOR + "50",
    paddingTop: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#666",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: PRIMARY_COLOR,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: ACCENT_COLOR,
  },
  dateText: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 10,
    textAlign: "right",
  },

  // Item Card Styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
    marginBottom: 15,
  },
  itemCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  itemHeader: {
    padding: 10,
    backgroundColor: PRIMARY_COLOR,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    color: CARD_COLOR,
    fontSize: 15,
    fontWeight: "700",
  },
  materialText: {
    color: CARD_COLOR,
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
  itemImage: {
    width: "100%",
    height: SCREEN_WIDTH * 0.4,
    backgroundColor: "#e0e0e0",
  },
  imagePlaceholder: {
    width: "100%",
    height: SCREEN_WIDTH * 0.4,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  placeholderText: {
    marginTop: 5,
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  itemDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: "#555",
  },
  weightValue: {
    fontSize: 16,
    fontWeight: "700",
    color: ACCENT_COLOR,
  },
  systemSource: {
    fontSize: 14,
    fontWeight: "600",
    color: "green",
    backgroundColor: "#e6ffe6",
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  manualSource: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_COLOR,
    backgroundColor: "#e0e6ff",
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  itemDate: {
    fontSize: 10,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
});
