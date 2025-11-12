// import FeatureLayout from "../../Components/FeatureLayout";

// export default function DataAnalysisScreen({ navigation }) {
//   return <FeatureLayout navigation={navigation} title="Data Analysis" icon="query-stats" />;
// }

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width - 40;

export default function DataAnalysisScreen({ navigation }) {
  const [activeChart, setActiveChart] = useState("sales");

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#2563eb",
    },
  };

  const salesData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [220, 280, 210, 300, 250, 400, 380],
      },
    ],
  };

  const storeData = {
    labels: ["Store A", "Store B", "Store C", "Store D"],
    datasets: [
      {
        data: [90, 70, 80, 60],
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Analysis</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Scroll Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overview Cards */}
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <MaterialIcons name="bar-chart" size={28} color="#2563eb" />
            <Text style={styles.cardValue}>₹12,450</Text>
            <Text style={styles.cardLabel}>Total Sales</Text>
          </View>
          <View style={styles.card}>
            <MaterialIcons name="store" size={28} color="#2563eb" />
            <Text style={styles.cardValue}>48</Text>
            <Text style={styles.cardLabel}>Active Stores</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.card}>
            <MaterialIcons name="people" size={28} color="#2563eb" />
            <Text style={styles.cardValue}>126</Text>
            <Text style={styles.cardLabel}>Store Managers</Text>
          </View>
          <View style={styles.card}>
            <MaterialIcons name="trending-up" size={28} color="#2563eb" />
            <Text style={styles.cardValue}>+12%</Text>
            <Text style={styles.cardLabel}>Weekly Growth</Text>
          </View>
        </View>

        {/* Chart Switcher */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeChart === "sales" && styles.activeToggle,
            ]}
            onPress={() => setActiveChart("sales")}
          >
            <Text
              style={[
                styles.toggleText,
                activeChart === "sales" && styles.activeText,
              ]}
            >
              Sales Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeChart === "stores" && styles.activeToggle,
            ]}
            onPress={() => setActiveChart("stores")}
          >
            <Text
              style={[
                styles.toggleText,
                activeChart === "stores" && styles.activeText,
              ]}
            >
              Store Performance
            </Text>
          </TouchableOpacity>
        </View>

        {/* Charts */}
        <View style={styles.chartContainer}>
          {activeChart === "sales" ? (
            <LineChart
              data={salesData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chartStyle}
            />
          ) : (
            <BarChart
              data={storeData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              style={styles.chartStyle}
            />
          )}
        </View>

        {/* Insights */}
        <View style={styles.insightBox}>
          <MaterialIcons name="insights" size={22} color="#2563eb" />
          <Text style={styles.insightText}>
            Sales peaked on Saturday — consistent with the last 3 weeks. Store A
            continues to outperform others, contributing 32% of total revenue.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 6,
  },
  cardLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeToggle: {
    backgroundColor: "#2563eb",
  },
  toggleText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  chartStyle: {
    borderRadius: 16,
  },
  insightBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 25,
  },
  insightText: {
    color: "#1e3a8a",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
