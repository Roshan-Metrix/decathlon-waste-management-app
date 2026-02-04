import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";
import { formatTimeStamp } from "../../../lib/formatTimeStamp";

const PRIMARY_COLOR = "#1e40af";
const EXPORT_COLOR = "#10b981";
const LIGHT_BACKGROUND = "#f9fafb";
const CARD_COLOR = "#ffffff";

const LIMIT = 3;

export default function ShowAllTransaction({ navigation }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [storeInfo, setStoreInfo] = useState({
    id: null,
    name: "Loading Store...",
  });

  useEffect(() => {
    fetchTransactions(false);
  }, []);

  const fetchTransactions = async (loadMore = false) => {
    if (loadingMore || (!hasMore && loadMore)) return;

    if (loadMore) {
      setLoadingMore(true);
    } else {
      setIsLoading(true);
      setPage(1);
      setHasMore(true);
      setTransactions([]);
    }

    try {
      const storeId = await AsyncStorage.getItem("storeId");
      if (!storeId) {
        setAlertMessage("Store ID not found in local storage.");
        setAlertVisible(true);
        return;
      }

      setStoreInfo((prev) => ({ ...prev, id: storeId }));

      const currentPage = loadMore ? page : 1;

      const response = await api.get(
        `/manager/transaction/store-total-transactions/${storeId}?page=${currentPage}&limit=${LIMIT}`
      );

      if (response.data?.success) {
        const newTxns = response.data.transactions || [];

        setTransactions((prev) =>
          loadMore ? [...prev, ...newTxns] : newTxns
        );

        setStoreInfo({
          id: storeId,
          name: response.data?.store?.storeName || "Store",
        });

        setHasMore(response.data.hasMore);
        setPage((p) => p + 1);
      } else {
        setAlertMessage(
          response.data?.message || "Failed to fetch transactions"
        );
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Fetch Transactions Error:", error);
      setAlertMessage("Network Error");
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const handleTransactionPress = (txn) => {
    navigation.navigate("SelectedTransactionItems", {
      transactionId: txn.transactionId,
      NoOfitems: txn.item,
      managerName: txn.managerName,
      createdAt: txn.createdAt,
    });
  };

  const handleExportPress = (transactionId) => {
    navigation.navigate("BillingExportTransactionScreen", { transactionId });
  };

  /** Sort once (backend already sorts, but safe) */
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [transactions]);

  const renderTransaction = ({ item: txn, index }) => (
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

        <TouchableOpacity onPress={() => fetchTransactions(false)}>
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

      {/* Transactions */}
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={PRIMARY_COLOR}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={sortedTransactions}
          keyExtractor={(item, index) =>
            `${item.transactionId}-${item.createdAt}-${index}`
          }
          renderItem={renderTransaction}
          contentContainerStyle={styles.content}
          onEndReached={() => fetchTransactions(true)}
          onEndReachedThreshold={0.6}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : null
          }
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
