import { View, Text, TouchableOpacity, ScrollView, StyleSheet,Image } from "react-native";
import { useState, useEffect, useContext } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { SidebarMenu } from "../Components/SidebarMenu";
import { FeatureBox } from "../Components/FeatureBox";

export default function UserScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [role, setRole] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (user?.role) setRole(user.role);
    else setRole("User");
  }, [user]);

  //  Role-based boxes
  const roleBoxes = {
    admin: [
      { title: "Add Store", icon: "store", screen: "AddStoreScreen" },
      { title: "Manage Stores", icon: "storefront", screen: "ManageStoresScreen" },
      { title: "Manage Admins", icon: "manage-accounts", screen: "ManageAdminScreen" },
      { title: "Manage Managers", icon: "supervisor-account", screen: "ManageManagerScreen" },
      { title: "Manage Data", icon: "folder", screen: "ManageDataAdminScreen" },
      { title: "Notify Stores", icon: "notifications", screen: "NotifyStoresScreen" },
      { title: "Data Analysis", icon: "query-stats", screen: "DataAnalysisScreen" },
    ],
    manager: [
      { title: "Manage Data", icon: "folder", screen: "ManageDataManagerScreen" },
      // { title: "Manage Staff", icon: "supervisor-account", screen: "ManageStaffScreen" },
      { title: "Manage Managers", icon: "supervisor-account", screen: "ManageManagerScreen" },
      { title: "History", icon: "history", screen: "HistoryManagersScreen" },
      { title: "Export Data", icon: "import-export", screen: "ExportDataScreen" },
      { title: "Process Transaction", icon: "account-balance", screen: "ProcessTransactionScreen" },
      { title: "Add Entry", icon: "playlist-add", screen: "AddEntryScreen" },
      { title: "View Tasks", icon: "assignment", screen: "ViewTasksScreen" },
      { title: "Datas", icon: "assignment", screen: "CheckDataScreen" },
    ],
  };

  //  Optional default features (visible to all)
  const optionalFeatures = [
    { title: "Profile", icon: "person", screen: "ProfileScreen" },
  ];

  const features = [...(roleBoxes[role] || []),...optionalFeatures];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <MaterialIcons name="menu" size={30} color="#fff" style={{paddingTop:15}} />
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Welcome, {user?.name || "User"}</Text>
      </View>

      {/* Sidebar */}
      <SidebarMenu
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        role={role}
        user={user} 
        navigation={navigation}
        logout={logout}
      />

      {/* Feature Boxes */}
      <ScrollView
        contentContainerStyle={styles.featuresContainer}
        showsVerticalScrollIndicator={false}
      >
        {features.map((item, index) => (
          <FeatureBox
            key={index}
            icon={item.icon}
            title={item.title}
            onPress={() => navigation.navigate(item.screen)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop:25,
  },
  featuresContainer: {
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
