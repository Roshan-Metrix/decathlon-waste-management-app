import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../../api/api";

export default function ViewRegionScreen({ navigation }) {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegions = async () => {
    try {
      const { data } = await api.get("/auth/get-regions");

      if (data.success) {
        setRegions(data.regions);
      }
    } catch (error) {
      console.log("Fetch Regions Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleRegionClick = (regionName) => {
    navigation.navigate("EditMaterialsRateScreen", {
      stateName: regionName, 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>All Regions</Text>

        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 40 }}
        />
      ) : regions.length === 0 ? (
        <Text style={styles.noData}>No regions found.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Total Count */}
          <View style={styles.countBox}>
            <MaterialIcons name="map" size={50} color="#2563eb" />
            <Text style={styles.countText}>Total Regions</Text>
            <Text style={styles.countNumber}>{regions.length}</Text>
          </View>

          {/* Region List */}
          {regions.map((region, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleRegionClick(region)}
            >
              <View style={styles.row}>
                <MaterialIcons
                  name="location-city"
                  size={22}
                  color="#2563eb"
                />
                <Text style={styles.regionName}>
                  {region}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#ffffff",
    shadowColor: "#1e40af",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e40af",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  countBox: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
  },
  countText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    color: "#1e40af",
  },
  countNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2563eb",
    marginTop: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  regionName: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
    color: "#1e293b",
  },
  noData: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#6b7280",
  },
});