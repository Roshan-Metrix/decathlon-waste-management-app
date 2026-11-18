import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";
import { formatTimeStamp } from "../../../lib/formatTimeStamp";

const PRIMARY_COLOR = "#1e40af";
const EXPORT_COLOR = "#10b981";
const LIGHT_BACKGROUND = "#f9fafb";
const CARD_COLOR = "#ffffff";

const LIMIT = 10;

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

  // Filters & Search state
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState(null); // YYYY-MM-DD
  const [toDate, setToDate] = useState(null); // YYYY-MM-DD
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [sortType, setSortType] = useState("latest"); // latest | highest | az
  const [sortOpen, setSortOpen] = useState(false);
  const animHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTransactions(false);
  }, []);

  useEffect(() => {
    Animated.timing(animHeight, {
      toValue: sortOpen ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [sortOpen]);

  const dropdownHeight = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 125],
  });

  const formatDateString = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const selectDate = (event, selectedDate, isFrom) => {
    if (isFrom) {
      setShowFromPicker(false);
      if (event?.type !== "dismissed" && selectedDate) {
        setFromDate(formatDateString(selectedDate));
      }
    } else {
      setShowToPicker(false);
      if (event?.type !== "dismissed" && selectedDate) {
        setToDate(formatDateString(selectedDate));
      }
    }
  };

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
        `/transaction/store-total-transactions/${storeId}?page=${currentPage}&limit=${LIMIT}`
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
        setPage(currentPage + 1);
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

  // Filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const filtered = transactions.filter((txn) => {
      // Search match (by ID or Manager name)
      const idMatch = query
        ? (txn.transactionId || "").toString().toLowerCase().includes(query)
        : true;
      const managerMatch = query
        ? (txn.managerName || "").toLowerCase().includes(query)
        : true;

      // Date match
      const createdAt = new Date(txn.createdAt);
      const fromOK = fromDate
        ? createdAt >= new Date(fromDate + "T00:00:00")
        : true;
      const toOK = toDate
        ? createdAt <= new Date(toDate + "T23:59:59.999")
        : true;

      return (idMatch || managerMatch) && fromOK && toOK;
    });

    return filtered.sort((a, b) => {
      if (sortType === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortType === "highest") {
        return (b.item ?? 0) - (a.item ?? 0);
      }
      if (sortType === "az") {
        return (a.transactionId || "")
          .toString()
          .localeCompare((b.transactionId || "").toString());
      }
      return 0;
    });
  }, [transactions, searchText, fromDate, toDate, sortType]);

  const hasActiveFilters = Boolean(
    searchText || fromDate || toDate || sortType !== "latest"
  );

  const resetFilters = () => {
    setSearchText("");
    setFromDate(null);
    setToDate(null);
    setSortType("latest");
  };

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

      {/* Filter & Search Bar */}
      <View style={styles.filterContainer}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID or Manager Name..."
            placeholderTextColor="#7e7c7c"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Sorting & Reset */}
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={styles.sortToggle}
            onPress={() => setSortOpen((s) => !s)}
          >
            <Text style={styles.sortToggleText}>
              Sort:{" "}
              {sortType === "latest"
                ? "Latest"
                : sortType === "highest"
                  ? "Highest Items"
                  : "A–Z"}
            </Text>
            <MaterialIcons
              name={sortOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <MaterialIcons name="filter-alt-off" size={18} color="#ef4444" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown Options */}
        <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
          {sortOpen && (
            <View style={styles.dropdownInner}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortType === "latest" && styles.sortActiveSmall,
                ]}
                onPress={() => {
                  setSortType("latest");
                  setSortOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.sortTextSmall,
                    sortType === "latest" && styles.sortTextSmallActive,
                  ]}
                >
                  Latest
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortType === "highest" && styles.sortActiveSmall,
                ]}
                onPress={() => {
                  setSortType("highest");
                  setSortOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.sortTextSmall,
                    sortType === "highest" && styles.sortTextSmallActive,
                  ]}
                >
                  Highest Items
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortButton,
                  sortType === "az" && styles.sortActiveSmall,
                ]}
                onPress={() => {
                  setSortType("az");
                  setSortOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.sortTextSmall,
                    sortType === "az" && styles.sortTextSmallActive,
                  ]}
                >
                  A–Z (Transaction ID)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Date Filters */}
        <View style={styles.dateRow}>
          <View style={styles.dateInputContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowFromPicker(true)}
            >
              <MaterialIcons
                name="calendar-today"
                size={16}
                color={fromDate ? PRIMARY_COLOR : "#666"}
              />
              <Text
                style={[styles.dateText, fromDate && styles.dateTextActive]}
                numberOfLines={1}
              >
                {fromDate ? `From: ${fromDate}` : "From Date"}
              </Text>
            </TouchableOpacity>
            {fromDate && (
              <TouchableOpacity
                style={styles.clearDateBtn}
                onPress={() => setFromDate(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="close" size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dateInputContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowToPicker(true)}
            >
              <MaterialIcons
                name="calendar-today"
                size={16}
                color={toDate ? PRIMARY_COLOR : "#666"}
              />
              <Text
                style={[styles.dateText, toDate && styles.dateTextActive]}
                numberOfLines={1}
              >
                {toDate ? `To: ${toDate}` : "To Date"}
              </Text>
            </TouchableOpacity>
            {toDate && (
              <TouchableOpacity
                style={styles.clearDateBtn}
                onPress={() => setToDate(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="close" size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={fromDate ? new Date(fromDate + "T00:00:00") : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(e, d) => selectDate(e, d, true)}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={toDate ? new Date(toDate + "T00:00:00") : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(e, d) => selectDate(e, d, false)}
          />
        )}
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
          data={filteredAndSortedTransactions}
          keyExtractor={(item, index) =>
            `${item.transactionId}-${item.createdAt}-${index}`
          }
          renderItem={renderTransaction}
          contentContainerStyle={styles.content}
          onEndReached={() => fetchTransactions(true)}
          onEndReachedThreshold={0.6}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={PRIMARY_COLOR}
                style={{ paddingVertical: 10 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {hasActiveFilters
                ? "No matching transactions found."
                : "No transactions recorded for this store."}
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
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
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

  /* Filters */
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111",
    marginLeft: 8,
    paddingVertical: 0,
  },

  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sortToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: CARD_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
  },

  sortToggleText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#333",
  },

  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },

  resetButtonText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 13,
  },

  dropdown: {
    overflow: "hidden",
    marginTop: -4,
  },

  dropdownInner: {
    backgroundColor: CARD_COLOR,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#f4f4f5",
  },

  sortActiveSmall: {
    backgroundColor: PRIMARY_COLOR,
  },

  sortTextSmall: {
    fontWeight: "600",
    color: "#555",
    fontSize: 13,
  },

  sortTextSmallActive: {
    color: "#fff",
  },

  dateRow: {
    flexDirection: "row",
    gap: 10,
  },

  dateInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_COLOR,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },

  dateInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  dateText: {
    color: "#666",
    fontSize: 13,
    marginLeft: 6,
  },

  dateTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: "600",
  },

  clearDateBtn: {
    padding: 2,
    marginLeft: 4,
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
