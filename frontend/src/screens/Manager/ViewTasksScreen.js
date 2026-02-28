import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const IS_MAINTENANCE_MODE = true; 

export default function ViewTasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Check store inventory", status: "Pending", date: "12 Nov 2025" },
    { id: 2, title: "Update sales report", status: "Completed", date: "11 Nov 2025" },
    { id: 3, title: "Clean warehouse section", status: "In Progress", date: "10 Nov 2025" },
  ]);

  const handleRefresh = () => {
    console.log("Attempting refresh...");
    // alert("Checking system status...");
    alert("Sorry , Not maintained")
  };

  // --- MAINTENANCE RENDERING FUNCTION ---
  if (IS_MAINTENANCE_MODE) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>System Status</Text>
            <View style={{ width: 26 }} /> 
        </View>

        <View style={styles.maintenanceContainer}>
          <MaterialIcons 
            name="build" 
            size={80} 
            color="#f59e0b" 
            style={styles.maintenanceIcon}
          />
          <Text style={styles.maintenanceTitle}>
            System Under Maintenance
          </Text>
          <Text style={styles.maintenanceMessage}>
            We're currently performing scheduled maintenance to improve system performance and add new features.
          </Text>
          <Text style={styles.maintenanceDetail}>
            Estimated downtime: **2 hours**
            <Text style={{ fontWeight: '700', color: '#dc2626' }}> (Expected back at 1:00 AM IST)</Text>
          </Text>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.refreshButtonText}>Check Status Now</Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  }
  // --- END OF MAINTENANCE RENDERING ---

  // --- NORMAL RENDERING (if IS_MAINTENANCE_MODE is false) ---
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

// --- STYLES ---

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
  
  maintenanceContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  maintenanceIcon: {
    marginBottom: 20,
    backgroundColor: '#fffbe5', 
    padding: 15,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fcd34d',
  },
  maintenanceTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#b45309", 
    marginBottom: 10,
    textAlign: 'center',
  },
  maintenanceMessage: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  maintenanceDetail: {
    fontSize: 14,
    color: "#dc2626", 
    textAlign: "center",
    marginBottom: 30,
    fontWeight: '500'
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  // --- NORMAL TASK STYLES (Keep existing styles for when maintenance is off) ---
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