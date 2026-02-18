import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import colors from "../../../colors";
import Alert from "../../../Components/Alert";
import useImagePreview from "../../../lib/useImagePreview";

export default function BillingExportTransactionScreen({ navigation }) {
  const route = useRoute();
  const [store, setStore] = useState(null);
  const [profile, setProfile] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openImage, ImagePreviewModal } = useImagePreview();

  const [managerSignature, setManagerSignature] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Converts ISO string to IST formatted date and time.
  const formatISTDateTime = (isoString) => {
    if (!isoString) return { date: "N/A", time: "N/A" };
    try {
      const date = new Date(isoString);

      const optionsDate = {
        year: "numeric",
        month: "short",
        day: "2-digit",
        timeZone: "Asia/Kolkata",
      };

      const optionsTime = {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      };

      const formattedDate = date.toLocaleDateString("en-IN", optionsDate);
      const formattedTime = date.toLocaleTimeString("en-IN", optionsTime);

      return { date: formattedDate, time: formattedTime };
    } catch (e) {
      console.error("Date formatting error:", e);
      return { date: "Invalid Date", time: "Invalid Time" };
    }
  };

  // Helper to show image URI for item.
  const getItemImageUri = (imageField) => {
    if (!imageField) return null;
    if (typeof imageField !== "string") return null;

    if (imageField.startsWith("data:")) return imageField;
    if (/^[A-Za-z0-9+/=]+$/.test(imageField) && imageField.length > 200) {
      return `data:image/png;base64,${imageField}`;
    }

    const base = api?.defaults?.baseURL || "";
    return `${base.replace(/\/$/, "")}/uploads/${imageField}`;
  };

  // Calculates the grand total weight of all items.
  const calculateGrandTotal = (items) => {
    return items
      .reduce((total, item) => {
        const weight = parseFloat(item.weight) || 0;
        return total + weight;
      }, 0)
      .toFixed(2);
  };

  // --- DATA FETCHING ---

  // Fetch store + manager profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let transactionId;
        if (route.params?.transactionId) {
          transactionId = route.params.transactionId;
        } else {
          const stored = await AsyncStorage.getItem("todayTransaction");
          const parsed = JSON.parse(stored);
          transactionId = parsed?.transactionId;
        }

        const res = await api.get(
          `/manager/transaction/todays-transactions/${transactionId}`,
        );
        setProfile(res.data.transactions[0].managerName);
        setStore(res.data.transactions[0].store);
      } catch (err) {
        console.log("Profile Error: ", err);
      }
    };
    fetchProfile();
  }, []);

  // Fetch transaction data and items
  const fetchTransactionData = async () => {
    setLoading(true);

    try {
      let transactionId;
      if (route.params?.transactionId) {
        transactionId = route.params.transactionId;
        // console.log("Using transaction ID from route params:", transactionId);
      } else {
        const stored = await AsyncStorage.getItem("todayTransaction");
        const parsed = JSON.parse(stored);
        transactionId = parsed?.transactionId;
        // console.log("Using transaction ID from AsyncStorage:", transactionId);
      }

      if (!transactionId) {
        setLoading(false);
        setAlertMessage("No active transaction ID found");
        setAlertVisible(true);
        return;
      }

      const res = await api.get(
        `/manager/transaction/todays-transactions/${transactionId}`,
      );

      if (res.data?.success && res.data?.transactions?.[0]) {
        const transaction = res.data.transactions[0];
        setTransactionData(transaction);

        // Reverse the items list so the newest item appears first (SN 1)
        const reversedItems = [...(transaction.items || [])].reverse();
        setItemsList(reversedItems);
      }
    } catch (e) {
      console.log(
        "Fetch transaction data error:",
        e?.response?.data || e.message,
      );
      setAlertMessage("Failed to fetch transaction data.");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Load signatures and transaction data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadSignatures = async () => {
        const managerSig = await AsyncStorage.getItem("managerSignature");
        if (managerSig) setManagerSignature(managerSig);
      };

      loadSignatures();
      fetchTransactionData();
    }, []),
  );

  const ITEM_RATES = {
    "Recycling Metal": 20,
    "Recycling Rubber": 2,
    "Recycling Paper": 7,
    "Recycling Glass": 12,
    "Recycling E Waste": 7,
    "Recycling Cardboard": 7,
    "Recycling Textile": 5,
    "Recycling Soft Plastics": 20,
    "Hazardous Waste": 16,
    "Recycling Organic": 4,
    "Mixed Packaging": 8,
    "Defective Products": 7,
    "Recycling Hangers": 0,
    "Return Hangers": 6,
    "Recycling Mixed Packaging": 8,
    "Recycling Soft Plastic": 20,
    "Recycling Wood": 2,
    "Unsegregated Waste": 16,
    "Recycling Hard Plastic": 13,
    "Food Waste - Expired Products": 16,
    "Recycling Metal Mixed": 20,
    "Recycling Wood Pallet Wood": 3,
    "Nonrecycling Wood(Furniture)": 3,
    "Recycling Metal Fixtures Truck Load": 27,
    "Aluminium < 1000 kgs /> 1000 kgs": 65,
    "LED Strips": 16,
    "Energy Recovery": 16,
    "Incineration" : 16
  };

  const grandTotalWeight = calculateGrandTotal(itemsList);

  // const groupedItemsSummary = useMemo(() => {
  //   const summary = itemsList.reduce((acc, item) => {
  //     const type = item.materialType || "Unknown Material";
  //     const weight = parseFloat(item.weight) || 0;

  //     if (!acc[type]) {
  //       acc[type] = { count: 0, totalWeight: 0 };
  //     }

  //     acc[type].count += 1;
  //     acc[type].totalWeight += weight;

  //     return acc;
  //   }, {});

  //   return Object.keys(summary).map((type) => ({
  //     materialType: type,
  //     itemCount: summary[type].count,
  //     totalWeight: summary[type].totalWeight.toFixed(2),
  //   }));
  // }, [itemsList]);

  const groupedItemsSummary = useMemo(() => {
    const summary = itemsList.reduce((acc, item) => {
      const type = item.materialType || "Unknown Material";
      const weight = parseFloat(item.weight) || 0;

      if (!acc[type]) {
        acc[type] = { count: 0, totalWeight: 0 };
      }

      acc[type].count += 1;
      acc[type].totalWeight += weight;

      return acc;
    }, {});

    return Object.keys(summary).map((type) => {
      const totalWeight = summary[type].totalWeight;
      const rate = ITEM_RATES[type] || 0;
      const totalAmount = totalWeight * rate;

      return {
        materialType: type,
        itemCount: summary[type].count,
        totalWeight: totalWeight.toFixed(2),
        rate,
        totalAmount: totalAmount.toFixed(2),
      };
    });
  }, [itemsList]);

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading Transaction Details...</Text>
      </View>
    );
  }

  // Helper to get today's IST date for the header
  const todayISTDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  // Function to prepare and pass data to export screen
  const navigateToExport = () => {
    const dataToExport = {
      transactionId: transactionData?.transactionId,
      storeName: store?.storeName || "Store N/A",
      storeLocation: store?.storeLocation || "Location N/A",
      managerEmail: profile || "Manager N/A",
      vendorName: transactionData?.vendorName || "Vendor N/A",
      grandTotalWeight: grandTotalWeight,
      billDate: todayISTDate,
      items: itemsList.map((item, index) => ({
        sn: index + 1,
        materialType: item.materialType,
        weight: parseFloat(item.weight).toFixed(2),
        weightSource: item.weightSource,
        createdAt: item.createdAt,
      })),
      itemSummary: groupedItemsSummary,
      managerSignature: managerSignature,
    };

    navigation.navigate("ExportDataScreen", { transactionData: dataToExport });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Billing Transaction</Text>

        <TouchableOpacity onPress={navigateToExport}>
          <MaterialIcons
            name="file-download"
            size={26}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* BILL AREA */}
        <View style={styles.billBox}>
          <Text style={styles.storeName}>
            {store?.storeName || "Store Name N/A"}
          </Text>
          <Text style={styles.storeLocation}>
            {store?.storeLocation || "Location N/A"}
          </Text>

          {/* Transaction Info */}
          <View style={styles.rowBetween}>
            <Text style={styles.label}>
              <Text style={styles.labelBold}>Date :</Text> {todayISTDate}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.labelBold}>Transaction ID :</Text>{" "}
              {transactionData?.transactionId || "N/A"}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>
              <Text style={styles.labelBold}>Manager :</Text>{" "}
              {profile || "Loading..."}
            </Text>
            <Text style={styles.label}>
              <Text style={styles.labelBold}>Vendor :</Text>{" "}
              {transactionData?.vendorName || "N/A"}
            </Text>
          </View>

          <Text style={styles.subHeading}>Transaction Items</Text>

          {/* TABLE */}
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>SN</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>
                Material
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  { flex: 0.9, textAlign: "center" },
                ]}
              >
                Weight (kg)
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  { flex: 1, textAlign: "center" },
                ]}
              >
                Time & Source
              </Text>
            </View>

            {itemsList.length === 0 ? (
              <Text style={styles.noItemsText}>
                No items added to this transaction.
              </Text>
            ) : (
              itemsList.map((item, index) => {
                const imgUri = getItemImageUri(item.image);
                const { date, time } = formatISTDateTime(item.createdAt);
                const serialNumber = index + 1;
                const weightSourceTag =
                  item.weightSource === "system" ? "Sys" : "Man";
                const weightSourceColor =
                  item.weightSource === "system" ? "#10b981" : "#f59e0b";
                const weightSourceBg =
                  item.weightSource === "system" ? "#d1fae5" : "#fef3c7";

                return (
                  <View key={item._id || index} style={styles.tableRow}>
                    <Text style={[styles.tableData, { flex: 0.5 }]}>
                      {serialNumber}
                    </Text>
                    <View style={[styles.itemDetailWrapper, { flex: 3 }]}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() =>
                          openImage(
                            imgUri
                              ? { uri: imgUri }
                              : require("../../../../assets/icon.png"),
                          )
                        }
                      >
                        <Image
                          source={
                            imgUri
                              ? { uri: imgUri }
                              : require("../../../../assets/icon.png")
                          }
                          style={styles.itemImage}
                        />
                      </TouchableOpacity>
                      <Text style={styles.materialText}>
                        {item.materialType}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.tableData,
                        { flex: 1.5, fontWeight: "700", textAlign: "center" },
                      ]}
                    >
                      {parseFloat(item.weight).toFixed(2)}
                    </Text>
                    <View style={[styles.dateTimeSourceWrapper, { flex: 2.5 }]}>
                      <Text style={styles.dateTimeText}>{date}</Text>
                      <View style={styles.dateTimeRow}>
                        <Text style={styles.dateTimeText}>{time}</Text>
                        <View
                          style={[
                            styles.sourceTag,
                            { backgroundColor: weightSourceBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.sourceText,
                              { color: weightSourceColor },
                            ]}
                          >
                            {weightSourceTag}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}

            {/* Grand Total Row */}
            <View style={styles.tableRowTotal}>
              <Text
                style={[
                  styles.tableTotalText,
                  { flex: 7.5, textAlign: "right", paddingRight: 10 },
                ]}
              >
                Grand Total Weight:
              </Text>
              <Text
                style={[
                  styles.tableTotalValue,
                  { flex: 2.5, textAlign: "center" },
                ]}
              >
                {grandTotalWeight} kg
              </Text>
            </View>
          </View>
          {/* END TABLE */}

          {/* <Text style={styles.subHeading}>Material Type Summary</Text>
          <View style={styles.summaryContainer}>
            {groupedItemsSummary.map((summary, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryMaterial}>
                  {summary.materialType} :
                </Text>
                <Text style={styles.summaryItems}>
                  {summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""}
                </Text>
                <Text style={styles.summaryWeight}>
                  (Total Weight: {summary.totalWeight} kg)
                </Text>
              </View>
            ))}
          </View> */}

          <Text style={styles.subHeading}>Material Type Summary</Text>
          <View style={styles.summaryContainer}>
            {groupedItemsSummary.map((summary, index) => {
              const rate = ITEM_RATES[summary.materialType] || 0;
              const totalWeight = parseFloat(summary.totalWeight) || 0;
              const totalAmount = totalWeight * rate;

              return (
                <View key={index} style={styles.summaryRow}>
                  <Text style={styles.summaryMaterial}>
                    {summary.materialType} :
                  </Text>

                  <Text style={styles.summaryItems}>
                    {summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""} × Rs. {rate} /kg
                  </Text>

                  <Text style={styles.summaryWeight}>
                    (Total Weight: {summary.totalWeight} kg)
                  </Text>

                  <Text style={styles.summaryWeight}>
                    Total Amount: Rs. {totalAmount.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.disclaimer}>
            * Above bill is true and correct *
          </Text>
        </View>

        {/* Export */}
        <TouchableOpacity style={styles.exportBtn} onPress={navigateToExport}>
          <MaterialIcons
            name="file-download"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.exportText}>Export Bill</Text>
        </TouchableOpacity>
      </ScrollView>
      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
      <ImagePreviewModal />
    </View>
  );
}

/*  STYLES  */
const styles = StyleSheet.create({
  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#fff",
    elevation: 3,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.primary },
  billBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  storeName: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    color: "#1e40af",
  },
  storeLocation: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    color: "#555",
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: "#374151",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginVertical: 4,
    paddingHorizontal: 5,
  },
  label: { fontSize: 14, color: "#333", paddingTop: 5, width: "50%" },
  labelBold: { fontWeight: "700" },

  table: { borderWidth: 1, borderColor: "#ccc", marginTop: 5 },

  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#eef2ff",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "800",
    fontSize: 13,
    color: "#1e40af",
    textAlign: "left",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  tableData: { flex: 1, fontSize: 13, color: "#1f2937" },

  itemDetailWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 5,
  },
  itemImage: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: "#f3f4f6",
  },
  materialText: {
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
  },

  dateTimeSourceWrapper: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 5,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 2,
  },
  dateTimeText: {
    fontSize: 11,
    color: "#4b5563",
  },
  sourceTag: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    marginLeft: 1,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: "700",
  },

  tableRowTotal: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderTopWidth: 2,
    borderColor: "#1e40af",
    backgroundColor: "#e0f2fe",
    alignItems: "center",
  },
  tableTotalText: { fontWeight: "800", fontSize: 14, color: "#1e40af" },
  tableTotalValue: { fontWeight: "800", fontSize: 15, color: "#b91c1c" },

  noItemsText: {
    textAlign: "center",
    padding: 15,
    color: "#6b7280",
    fontStyle: "italic",
  },

  summaryContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  summaryMaterial: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginRight: 5,
  },
  summaryItems: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginRight: 10,
  },
  summaryWeight: {
    fontSize: 14,
    fontWeight: "700",
    color: "#b91c1c",
  },

  totalWords: {
    marginTop: 15,
    fontSize: 13,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },

  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 10,
  },

  signatureImg: {
    width: 100,
    height: 60,
    borderBottomWidth: 1,
    borderColor: "#aaa",
    backgroundColor: "#f3f4f6",
    resizeMode: "contain",
    marginTop: 5,
  },
  signaturePlaceholder: {
    width: 100,
    height: 60,
    borderBottomWidth: 1,
    borderColor: "#aaa",
    marginTop: 5,
  },
  signatureLabel: {
    marginTop: 5,
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "600",
  },

  disclaimer: {
    marginTop: 25,
    fontSize: 12,
    textAlign: "center",
    color: "#777",
    fontStyle: "italic",
  },

  exportBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    elevation: 3,
  },
  exportText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
