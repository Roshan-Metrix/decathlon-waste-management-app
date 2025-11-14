import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ViewTasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Check store inventory", status: "Pending", date: "12 Nov 2025" },
    { id: 2, title: "Update sales report", status: "Completed", date: "11 Nov 2025" },
    { id: 3, title: "Clean warehouse section", status: "In Progress", date: "10 Nov 2025" },
  ]);

  const handleRefresh = () => {
    // Later you can fetch data from API
    console.log("Refreshing task list...");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Tasks</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <MaterialIcons name="assignment" size={26} color="#2563eb" />
              <Text style={styles.taskTitle}>{task.title}</Text>
            </View>

            <View style={styles.taskInfo}>
              <Text style={styles.taskDate}>📅 {task.date}</Text>
              <View
                style={[
                  styles.statusBadge,
                  task.status === "Completed"
                    ? styles.completed
                    : task.status === "Pending"
                    ? styles.pending
                    : styles.inProgress,
                ]}
              >
                <Text style={styles.statusText}>{task.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Info Footer */}
      <View style={styles.infoBox}>
        <MaterialIcons name="info-outline" size={22} color="#2563eb" />
        <Text style={styles.infoText}>
          Tasks are assigned by your manager. Please update the status once each task is completed.
        </Text>
      </View>
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
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  taskInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskDate: {
    color: "#6b7280",
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  completed: {
    backgroundColor: "#dcfce7",
  },
  pending: {
    backgroundColor: "#fee2e2",
  },
  inProgress: {
    backgroundColor: "#fef9c3",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    margin: 20,
  },
  infoText: {
    color: "#1e3a8a",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
