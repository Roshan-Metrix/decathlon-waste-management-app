import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
  FlatList,
  Animated,
  Easing,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../../../api/api";
import Alert from "../../../Components/Alert";
import { formatTimeStamp } from "../../../lib/formatTimeStamp";

const PRIMARY_COLOR = "#1e40af";
const LIGHT_BACKGROUND = "#f9fafb";
const CARD_COLOR = "#ffffff";
const EXPORT_COLOR = "#10b981";

// Client-side pagination size
const PAGE_SIZE = 10;

export default function ShowAllTransaction({ route, navigation }) {
  const { storeId } = route.params;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState({
    id: null,
    name: "Loading Store...",
  });

  // Filters & UI state
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState(null); // ISO yyyy-mm-dd
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Sorting
  const [sortType, setSortType] = useState("latest"); // latest | highest | az

  // Pagination (client-side)
  const [page, setPage] = useState(1);
  const [displayList, setDisplayList] = useState([]);

  // Animated dropdown
  const [sortOpen, setSortOpen] = useState(false);
  const animHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    // dropdown open/close
    Animated.timing(animHeight, {
      toValue: sortOpen ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [sortOpen]);

  // refetch and reset pagination when filters/sort change
  useEffect(() => {
    setPage(1);
  }, [searchText, fromDate, toDate, sortType, transactions]);

  // recompute displayList when filtered/sorted or page changes
  useEffect(() => {
    const base = getFilteredAndSorted();
    const slice = base.slice(0, page * PAGE_SIZE);
    setDisplayList(slice);
  }, [transactions, searchText, fromDate, toDate, sortType, page]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      if (!storeId) {
        // Alert.alert("Error", "Store ID not found.");
        setAlertMessage("Store ID not found.");
        setAlertVisible(true);
        setIsLoading(false);
        return;
      }

      setStoreInfo((prev) => ({ ...prev, id: storeId }));

      const response = await api.get(
        `/manager/transaction/store-total-transactions/${storeId}`
      );

      if (response.data?.success) {
        const txns = response.data.transactions || [];
        setTransactions(txns);

        setStoreInfo({
          id: storeId,
          name: response.data?.store?.storeName || "Store",
        });
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

  // Returns the fully filtered & sorted list (no pagination)
  const getFilteredAndSorted = () => {
    const filtered = transactions.filter((txn) => {
      // search match
      const idMatch = txn.transactionId
        .toString()
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const managerMatch = txn.managerName
        .toLowerCase()
        .includes(searchText.toLowerCase());

      // date match
      const createdAt = new Date(txn.createdAt);
      const fromOK = fromDate ? createdAt >= new Date(fromDate) : true;
      const toOK = toDate ? createdAt <= new Date(toDate + "T23:59:59") : true;

      return (idMatch || managerMatch) && fromOK && toOK;
    });

    const sorted = filtered.sort((a, b) => {
      if (sortType === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortType === "highest") {
        return b.items.length - a.items.length;
      }
      if (sortType === "az") {
        // transactionId is string per your confirmation
        return a.transactionId.localeCompare(b.transactionId);
      }
      return 0;
    });

    return sorted;
  };

  const loadMore = () => {
    const full = getFilteredAndSorted();
    if (displayList.length >= full.length) return; // nothing more
    setPage((p) => p + 1);
  };

  const onRefresh = () => {
    setPage(1);
    fetchTransactions();
  };

  const selectDate = (event, d, isFrom) => {
    // On Android event may be 'dismissed' -> d === undefined
    if (isFrom) {
      setShowFromPicker(false);
      if (d) setFromDate(d.toISOString().split("T")[0]);
    } else {
      setShowToPicker(false);
      if (d) setToDate(d.toISOString().split("T")[0]);
    }
  };

  // Export individual transaction
  const handleExportPress = (transactionId) => {
    navigation.navigate("BillingExportTransactionScreen", { transactionId });
  };

  const renderTxn = ({ item: txn }) => {
    return (
      <TouchableOpacity
        key={txn.transactionId}
        style={styles.transactionCard}
        onPress={() =>
          navigation.navigate("SelectedTransactionItems", {
            transactionId: txn.transactionId,
            NoOfitems: txn.item,
            managerName: txn.managerName,
            createdAt: txn.createdAt,
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.txnIdText}>ID: {txn.transactionId}</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* Export Button */}
            <TouchableOpacity
              onPress={(e) => {
                // stop propagation so it doesn't navigate
                e.stopPropagation && e.stopPropagation();
                handleExportPress(txn.transactionId);
              }}
              style={styles.exportButton}
            >
              <MaterialIcons name="ios-share" size={20} color={EXPORT_COLOR} />
            </TouchableOpacity>

            <MaterialIcons
              name="chevron-right"
              size={20}
              color={PRIMARY_COLOR}
            />
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.detailText}>
            Manager: <Text style={styles.bold}>{txn.managerName}</Text>
          </Text>

          <Text style={styles.detailText}>
            Date:{" "}
            <Text style={styles.bold}>{formatTimeStamp(txn.createdAt)}</Text>
          </Text>

          <Text style={styles.detailText}>
            Total Items:{" "}
            <Text style={styles.bold}>{txn.item ?? 0}</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Animated dropdown styles
  const dropdownHeight = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 110],
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={26} color={PRIMARY_COLOR} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Store Transactions</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity onPress={onRefresh}>
            <MaterialIcons name="refresh" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      {/* STORE INFO */}
      <View style={styles.storeInfoCard}>
        <Text style={styles.storeNameText}>{storeInfo.name}</Text>
        <Text style={styles.storeIdText}>Store ID: {storeInfo.id}</Text>
      </View>

      {/* FILTER BAR */}
      <View style={styles.filterContainer}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID or Manager Name..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Sorting */}
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
                ? "Highest"
                : "A–Z"}
            </Text>
            <MaterialIcons
              name={sortOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        {/* Dropdown */}
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
                <Text style={styles.sortTextSmall}>Latest</Text>
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
                <Text style={styles.sortTextSmall}>Highest Items</Text>
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
                <Text style={styles.sortTextSmall}>A–Z (Transaction ID)</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Date Filters */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowFromPicker(true)}
          >
            <Text style={styles.dateText}>
              {fromDate ? `From: ${fromDate}` : "From Date"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowToPicker(true)}
          >
            <Text style={styles.dateText}>
              {toDate ? `To: ${toDate}` : "To Date"}
            </Text>
          </TouchableOpacity>
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={fromDate ? new Date(fromDate) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(e, d) => selectDate(e, d, true)}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={toDate ? new Date(toDate) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(e, d) => selectDate(e, d, false)}
          />
        )}
      </View>

      {/* TRANSACTION LIST (FlatList with pagination) */}
      {isLoading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          size="large"
          color={PRIMARY_COLOR}
        />
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={(item) => item.transactionId.toString()}
          renderItem={renderTxn}
          contentContainerStyle={styles.content}
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          ListFooterComponent={() =>
            displayList.length < getFilteredAndSorted().length ? (
              <View style={{ padding: 12, alignItems: "center" }}>
                <ActivityIndicator size="small" color={PRIMARY_COLOR} />
              </View>
            ) : null
          }
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No transactions found.</Text>
          )}
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

//    STYLES

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BACKGROUND,
  },

  /*  HEADER  */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 55,
    paddingBottom: 18,
    backgroundColor: CARD_COLOR,
    elevation: 6,
    justifyContent: "space-between",
  },

  backButton: {
    padding: 6,
    borderRadius: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginLeft: 12,
  },

  /*  STORE INFO CARD  */
  storeInfoCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 14,
    elevation: 3,
  },

  storeNameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  storeIdText: {
    color: "#e2e8f0",
    marginTop: 4,
    fontSize: 14,
  },

  /*  FILTERS  */
  filterContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    gap: 14,
  },

  /* Search */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },

  /* Sort Row */
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  sortToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
    justifyContent: "space-between",
  },

  sortToggleText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#333",
  },

  /* Dropdown */
  dropdown: {
    overflow: "hidden",
    marginTop: -4,
  },

  dropdownInner: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
  },

  sortButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: "#f4f4f5",
  },

  sortActiveSmall: {
    backgroundColor: PRIMARY_COLOR,
  },

  sortTextSmall: {
    fontWeight: "600",
    color: "#111",
    fontSize: 15,
  },

  /* Date Row */
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },

  dateInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  dateText: {
    color: "#444",
    fontSize: 15,
  },

  /*  LIST  */
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 80,
  },

  transactionCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },

  /* Header inside each card */
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#f1f1f1",
    paddingBottom: 8,
    marginBottom: 10,
  },

  txnIdText: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },

  /* Export */
  exportButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#e6fff3",
  },

  /* Body */
  cardBody: {},

  detailText: {
    color: "#4b5563",
    fontSize: 14.5,
    marginBottom: 6,
  },

  bold: {
    fontWeight: "700",
    color: "#111",
  },

  /* Empty Text */
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 40,
    fontSize: 16,
  },
});
