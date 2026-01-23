import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";
import { formatTimeStamp } from "../../../lib/formatTimeStamp";

const PRIMARY_COLOR = "#1e40af";
const LIGHT_BACKGROUND = "#f9fafb";
const CARD_COLOR = "#ffffff";
const EXPORT_COLOR = "#10b981";

export default function ShowAllTransaction({ navigation }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState({
    id: null,
    name: "Loading Store...",
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const getStoreId = await AsyncStorage.getItem("storeId");
      if (!getStoreId) {
        setAlertMessage("Store ID not found in local storage.");
        setAlertVisible(true);
        return;
      }

      setStoreInfo((prev) => ({ ...prev, id: getStoreId }));

      const response = await api.get(
        `/manager/transaction/store-total-transactions/${getStoreId}`,
      );

      if (response.data?.success) {
        setTransactions(response.data.transactions || []);

        if (response.data.transactions?.length > 0) {
          setStoreInfo({
            id: getStoreId,
            name: response.data.store.storeName,
          });
        } else {
          setStoreInfo((prev) => ({
            ...prev,
            name: "No Transactions Found",
          }));
        }
      } else {
        setAlertMessage(
          response.data?.message || "Failed to fetch transactions",
        );
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Fetch Transactions Error:", error);
      setAlertMessage("Network Error");
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionPress = (transactionData) => {
    navigation.navigate("SelectedTransactionItems", { 
      transactionId: transactionData.transactionId,
      NoOfitems: transactionData.item,
      managerName: transactionData.managerName,
      createdAt: transactionData.createdAt,
     });
  };

  const handleExportPress = (transactionId) => {
    navigation.navigate("BillingExportTransactionScreen", { transactionId });
  };

  /** Sort transactions once */
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [transactions]);

  const renderTransaction = ({ item: txn }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => handleTransactionPress(txn)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.txnIdContainer}>
          <Text style={styles.txnIdText}>ID: {txn.transactionId}</Text>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleExportPress(txn.transactionId);
            }}
            style={styles.exportButton}
          >
            <MaterialIcons name="ios-share" size={24} color={EXPORT_COLOR} />
          </TouchableOpacity>
        </View>

        <MaterialIcons name="chevron-right" size={24} color={PRIMARY_COLOR} />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.detailText}>
          Manager: <Text style={{ fontWeight: "600" }}>{txn.managerName}</Text>
        </Text>
        <Text style={styles.detailText}>
          Date:{" "}
          <Text style={{ fontWeight: "600" }}>
            {formatTimeStamp(txn.createdAt)}
          </Text>
        </Text>
        <Text style={styles.detailText}>
          Total Items:{" "}
          <Text style={{ fontWeight: "600" }}>{txn.item}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color={PRIMARY_COLOR} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Store Transactions</Text>

        <TouchableOpacity onPress={fetchTransactions}>
          <MaterialIcons name="refresh" size={26} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      {/* Store Info */}
      <View style={styles.storeInfoCard}>
        <Text style={styles.storeNameText}>{storeInfo.name}</Text>
        <Text style={styles.storeIdText}>
          Store ID: {storeInfo.id || "---"}
        </Text>
      </View>

      {/* Transactions List */}
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={PRIMARY_COLOR}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={sortedTransactions}
          keyExtractor={(item) => item.transactionId.toString()}
          renderItem={renderTransaction}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No transactions recorded for this store.
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
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
  container: { flex: 1, backgroundColor: LIGHT_BACKGROUND },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: CARD_COLOR,
    elevation: 5,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },

  storeInfoCard: {
    margin: 20,
    padding: 15,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
  },

  storeNameText: {
    fontSize: 18,
    fontWeight: "800",
    color: CARD_COLOR,
  },

  storeIdText: {
    fontSize: 14,
    color: CARD_COLOR,
    opacity: 0.8,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  transactionCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 10,
  },

  txnIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  txnIdText: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },

  exportButton: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#e6fff3",
  },

  cardBody: {
    paddingVertical: 5,
  },

  detailText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#888",
    fontSize: 16,
  },
});

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import { MaterialIcons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../../../api/api";
// import Alert from "../../../Components/Alert";

// const PRIMARY_COLOR = "#1e40af";
// const LIGHT_BACKGROUND = "#f9fafb";
// const CARD_COLOR = "#ffffff";
// const EXPORT_COLOR = "#10b981";

// export default function ShowAllTransaction({ navigation }) {
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
//   const [transactions, setTransactions] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [storeInfo, setStoreInfo] = useState({
//     id: null,
//     name: "Loading Store...",
//   });

//   useEffect(() => {
//     fetchTransactions();
//   }, []);

//   const fetchTransactions = async () => {
//     setIsLoading(true);
//     try {
//       const getStoreId = await AsyncStorage.getItem("storeId");
//       if (!getStoreId) {
//         setAlertMessage("Store ID not found in local storage.");
//         setAlertVisible(true);
//         setIsLoading(false);
//         return;
//       }

//       setStoreInfo((prev) => ({ ...prev, id: getStoreId }));

//       const response = await api.get(
//         `/manager/transaction/store-total-transactions/${getStoreId}`
//       );

//       if (response.data && response.data.success) {
//         setTransactions(response.data.transactions);
//         if (response.data.transactions.length > 0) {
//           setStoreInfo({
//             id: getStoreId,
//             name: response.data.transactions[0].store.storeName,
//           });
//         } else {
//           setStoreInfo((prev) => ({ ...prev, name: "No Transactions Found" }));
//         }
//       } else {
//         setAlertMessage(
//           "API Error",
//           response.data?.message || "Failed to fetch transactions."
//         );
//         setAlertVisible(true);
//       }
//     } catch (error) {
//       console.error("Fetch Transactions Error:", error);
//       setAlertMessage("Network Error");
//       setAlertVisible(true);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleTransactionPress = (transactionData) => {
//     navigation.navigate("SelectedTransactionItems", { transactionData });
//   };

//   const handleExportPress = (transactionId) => {
//     navigation.navigate("BillingExportTransactionScreen", { transactionId });
//   };

//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return "N/A";
//     const date = new Date(timestamp);
//     return date.toLocaleString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <MaterialIcons name="arrow-back" size={26} color={PRIMARY_COLOR} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Store Transactions</Text>

//         {/* Right side buttons - Only Refresh remains */}
//         <View style={styles.headerRightButtons}>
//           {/* Refresh Button */}
//           <TouchableOpacity
//             onPress={fetchTransactions}
//             style={styles.headerButton}
//           >
//             <MaterialIcons name="refresh" size={26} color={PRIMARY_COLOR} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Store Info Card */}
//       <View style={styles.storeInfoCard}>
//         <Text style={styles.storeNameText}>{storeInfo.name}</Text>
//         <Text style={styles.storeIdText}>
//           Store ID: {storeInfo.id || "---"}
//         </Text>
//       </View>

//       {/* Content */}
//       <ScrollView contentContainerStyle={styles.content}>
//         {isLoading ? (
//           <ActivityIndicator
//             size="large"
//             color={PRIMARY_COLOR}
//             style={{ marginTop: 50 }}
//           />
//         ) : transactions.length === 0 ? (
//           <Text style={styles.emptyText}>
//             No transactions recorded for this store.
//           </Text>
//         ) : (
//           [...transactions]
//           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//           .map((txn, index) => (
//             <TouchableOpacity
//               key={txn.transactionId}
//               style={styles.transactionCard}
//               onPress={() => handleTransactionPress(txn)}
//             >
//               <View style={styles.cardHeader}>
//                 <View style={styles.txnIdContainer}>
//                   <Text style={styles.txnIdText}>ID: {txn.transactionId}</Text>

//                   {/* Export Button inside the card header */}
//                   <TouchableOpacity
//                     onPress={(e) => {
//                       e.stopPropagation();
//                       handleExportPress(txn.transactionId);
//                     }}
//                     style={styles.exportButton}
//                   >
//                     <MaterialIcons
//                       name="ios-share"
//                       size={24}
//                       color={EXPORT_COLOR}
//                     />
//                   </TouchableOpacity>
//                 </View>
//                 <MaterialIcons
//                   name="chevron-right"
//                   size={24}
//                   color={PRIMARY_COLOR}
//                 />
//               </View>
//               <View style={styles.cardBody}>
//                 <Text style={styles.detailText}>
//                   Manager:{" "}
//                   <Text style={{ fontWeight: "600" }}>{txn.managerName}</Text>
//                 </Text>
//                 <Text style={styles.detailText}>
//                   Date:{" "}
//                   <Text style={{ fontWeight: "600" }}>
//                     {formatTimestamp(txn.createdAt)}
//                   </Text>
//                 </Text>
//                 <Text style={styles.detailText}>
//                   Total Items:{" "}
//                   <Text style={{ fontWeight: "600" }}>{txn.items.length}</Text>
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           ))
//         )}
//       </ScrollView>
//       <Alert
//         visible={alertVisible}
//         message={alertMessage}
//         onClose={() => setAlertVisible(false)}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: LIGHT_BACKGROUND,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 15,
//     backgroundColor: CARD_COLOR,
//     borderBottomLeftRadius: 10,
//     borderBottomRightRadius: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   backButton: {
//     padding: 4,
//   },
//   headerRightButtons: {
//     flexDirection: "row",
//     gap: 10,
//   },
//   headerButton: {
//     padding: 4,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: PRIMARY_COLOR,
//   },
//   storeInfoCard: {
//     marginHorizontal: 20,
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: PRIMARY_COLOR,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   storeNameText: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: CARD_COLOR,
//   },
//   storeIdText: {
//     fontSize: 14,
//     color: CARD_COLOR,
//     opacity: 0.8,
//     marginTop: 4,
//   },
//   content: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//     paddingBottom: 40,
//   },
//   transactionCard: {
//     backgroundColor: CARD_COLOR,
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//     paddingBottom: 10,
//     marginBottom: 10,
//   },
//   txnIdContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   txnIdText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: PRIMARY_COLOR,
//   },
//   exportButton: {
//     padding: 5,
//     borderRadius: 8,
//     backgroundColor: "#e6fff3",
//   },
//   cardBody: {
//     paddingVertical: 5,
//   },
//   detailText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 22,
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#888",
//     marginTop: 50,
//     fontSize: 16,
//   },
// });
