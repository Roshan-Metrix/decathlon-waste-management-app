import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // Dummy data for demonstration
  const allItems = [
    { id: "1", title: "Plastic Waste Entry", description: "24 kg recycled" },
    { id: "2", title: "Metal Scrap Entry", description: "10 kg stored" },
    { id: "3", title: "E-Waste Entry", description: "8 kg processed" },
    { id: "4", title: "Paper Waste Entry", description: "15 kg submitted" },
  ];

  const handleSearch = (text) => {
    setQuery(text);
    if (text.trim() === "") {
      setResults([]);
    } else {
      const filtered = allItems.filter((item) =>
        item.title.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={22} color="#2563eb" />
        <TextInput
          placeholder="Search entries..."
          value={query}
          onChangeText={handleSearch}
          style={styles.searchInput}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Search Results */}
      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultCard} activeOpacity={0.8}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="folder" size={24} color="#2563eb" />
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyBox}>
          <MaterialIcons name="inbox" size={70} color="#9ca3af" />
          <Text style={styles.emptyText}>
            {query ? "No results found" : "Start typing to search"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#111827",
  },
  resultCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  cardDesc: {
    fontSize: 14,
    color: "#374151",
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#6b7280",
    marginTop: 10,
    fontSize: 16,
  },
});
