import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const IS_MAINTENANCE_MODE = true;

export default function ViewTasksScreen({ navigation }) {
  const [tasks] = useState([
    {
      id: 1,
      title: "Check store inventory",
      status: "Pending",
      date: "12 Nov 2025",
    },
    {
      id: 2,
      title: "Update sales report",
      status: "Completed",
      date: "11 Nov 2025",
    },
    {
      id: 3,
      title: "Clean warehouse section",
      status: "In Progress",
      date: "10 Nov 2025",
    },
  ]);
  const handleRefresh = () => {
    console.log("Attempting refresh...");
    alert("Sorry, Not maintained");
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return [styles.statusBadge, styles.completedBadge];
      case "Pending":
        return [styles.statusBadge, styles.pendingBadge];
      default:
        return [styles.statusBadge, styles.progressBadge];
    }
  };

  const getStatusTextStyle = (status) => {
    switch (status) {
      case "Completed":
        return styles.completedText;
      case "Pending":
        return styles.pendingText;
      default:
        return styles.progressText;
    }
  };

  if (IS_MAINTENANCE_MODE) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.headerIcon}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color="#1877F2"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            System Status
          </Text>

          <View style={styles.headerIcon} />
        </View>
        <View style={styles.maintenanceWrapper}>
          <View style={styles.maintenanceCard}>

            <View style={styles.maintenanceIconContainer}>
              <MaterialIcons
                name="build-circle"
                size={64}
                color="#1877F2"
              />
            </View>

            <Text style={styles.maintenanceTitle}>
              System Under Maintenance
            </Text>

            <Text style={styles.maintenanceDescription}>
              We're improving the system to provide a faster,
              smoother and more reliable experience for everyone.
            </Text>
            <View style={styles.downtimeCard}>
              <MaterialIcons
                name="schedule"
                size={22}
                color="#1877F2"
              />

              <View style={styles.downtimeContent}>
                <Text style={styles.downtimeTitle}>
                  Estimated Downtime
                </Text>

                <Text style={styles.downtimeText}>
                  Approximately 2 hours
                </Text>

                <Text style={styles.downtimeSubText}>
                  Expected back at 1:00 AM IST
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <MaterialIcons
                name="refresh"
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.refreshButtonText}>
                Check Status
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.headerIcon}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color="#1877F2"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          View Tasks
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleRefresh}
          style={styles.headerIcon}
        >
          <MaterialIcons
            name="refresh"
            size={24}
            color="#1877F2"
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            activeOpacity={0.85}
            style={styles.taskCard}
          >
            <View style={styles.taskLeftSection}>
              <View style={styles.taskIconContainer}>
                <MaterialIcons
                  name="assignment"
                  size={26}
                  color="#1877F2"
                />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>
                  {task.title}
                </Text>

                <View style={styles.taskDateRow}>
                  <MaterialIcons
                    name="calendar-today"
                    size={14}
                    color="#8A8D91"
                  />
                  <Text style={styles.taskDate}>
                    {task.date}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.taskRightSection}>
              <View style={getStatusStyle(task.status)}>
                <Text style={getStatusTextStyle(task.status)}>
                  {task.status}
                </Text>
              </View>

              <MaterialIcons
                name="keyboard-arrow-right"
                size={26}
                color="#B0B3B8"
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.infoCard}>
        <MaterialIcons
          name="info"
          size={24}
          color="#1877F2"
        />

        <Text style={styles.infoText}>
          Tasks are assigned by your manager. Please update
          the status after completing each assigned task.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1E21",
    letterSpacing: 0.2,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 120,
  },
  taskLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  taskRightSection: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 12,
    height: 68,
  },
  taskIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E7F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  taskContent: {
    flex: 1,
    justifyContent: "center",
  },
  taskDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  taskDate: {
    marginLeft: 6,
    color: "#65676B",
    fontSize: 13,
    fontWeight: "500",
  },
  maintenanceWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  maintenanceCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 10,
    elevation: 5,
  },
  maintenanceIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#E7F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  maintenanceTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1E21",
    textAlign: "center",
    marginBottom: 14,
  },
  maintenanceDescription: {
    fontSize: 15,
    color: "#65676B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  downtimeCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 28,
  },
  downtimeContent: {
    flex: 1,
    marginLeft: 14,
  },
  downtimeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1E21",
    marginBottom: 4,
  },
  downtimeText: {
    fontSize: 14,
    color: "#1877F2",
    fontWeight: "700",
  },
  downtimeSubText: {
    marginTop: 4,
    fontSize: 12,
    color: "#8A8D91",
  },
  refreshButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#1877F2",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1877F2",
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 8,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1E21",
    marginBottom: 2,
    lineHeight: 22,
  },
  statusBadge: {
    minWidth: 105,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 10,
  },
  completedBadge: {
    backgroundColor: "#E7F6EC",
  },
  completedText: {
    color: "#1E8E3E",
    fontWeight: "700",
    fontSize: 13,
  },
  pendingBadge: {
    backgroundColor: "#FDECEC",
  },
  pendingText: {
    color: "#D93025",
    fontWeight: "700",
    fontSize: 13,
  },
  progressBadge: {
    backgroundColor: "#FFF4E5",
  },
  progressText: {
    color: "#F57C00",
    fontWeight: "700",
    fontSize: 13,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 8,
    elevation: 3,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: "#65676B",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
});