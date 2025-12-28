import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { useState, useEffect, useContext } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import { SidebarMenu } from "../Components/SidebarMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from '../api/api'

export default function UserScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [role, setRole] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    setRole(user?.role || "User");
  }, [user]);


useEffect(() => {
  const addStoreId = async () => {
    if (user?.role === "manager") {
      try {
        const res = await api.get("/auth/manager/profile");
        if (res.data.success) {
          await AsyncStorage.setItem("storeId", res.data.store.storeId);
        }
      } catch (error) {
        console.log("Manager Profile Fetch Error:", error.message);
      } finally {
        setLoading(false);
      }
    }
    if (user?.role === "store") {
      try {
        const res = await api.get("/auth/store/profile");
        if (res.data.success) {
          await AsyncStorage.setItem("storeId", res.data.store.storeId);
        }
      } catch (error) {
        console.log("Store Profile Fetch Error:", error.message);
      } finally {
        setLoading(false);
      }
    }

  };

  addStoreId();
}, [user]);

  const roleBoxes = {
    admin: [
      { 
        title: "Add Store", 
        icon: "store", 
        screen: "AddStoreScreen" 
      },
      {
        title: "Data Analysis",
        icon: "query-stats",
        screen: "ViewAllStoresScreen",
      },
      {
        title: "Manage Stores",
        icon: "storefront",
        screen: "ManageStoresScreen",
      },
      {
        title: "Manage Admins",
        icon: "admin-panel-settings",
        screen: "ManageAdminScreen",
      },
      {
        title: "Manage Managers",
        icon: "supervisor-account",
        screen: "ManageManagerScreen",
      },
      {
        title: "Manage Vendors",
        icon: "manage-accounts",
        screen: "ManageVendorScreen",
      },
      {
        title: "Notify Stores",
        icon: "notifications",
        screen: "NotifyStoresScreen",
      },
    ],

    manager: [
      {
        title: "Process Transaction",
        icon: "account-balance",
        screen: "AddProceedTransactionScreen",
      },
      {
        title: "Manage Data",
        icon: "folder",
        screen: "ManageDataScreen",
      },
      {
        title: "Manage Managers",
        icon: "supervisor-account",
        screen: "ManageOwnStoreManagersScreen",
      },
      { title: "View Tasks", icon: "assignment", screen: "ViewTasksScreen" },
    ],
    store: [
      {
        title: "Process Transaction",
        icon: "account-balance",
        screen: "AddProceedTransactionScreen",
      },
      {
        title: "Manage Data",
        icon: "folder",
        screen: "ManageDataScreen",
      },
      {
        title: "Manage Managers",
        icon: "supervisor-account",
        screen: "ManageOwnStoreManagersScreen",
      },
      { title: "View Tasks", icon: "assignment", screen: "ViewTasksScreen" },
    ],
  };

  const optionalFeatures = [
    { title: "Profile", icon: "person", screen: "ProfileScreen" },
  ];

  const features = [...(roleBoxes[role] || []), ...optionalFeatures];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#1e3a8a", "#2563eb"]} style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <MaterialIcons name="menu" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.userContainer}>
          {/* <MaterialIcons name="account-circle" size={45} color="#fff" /> */}
          <Text style={styles.welcomeText}>
            Welcome, {user?.name || "User"}
          </Text>
        </View>
      </LinearGradient>

      {/* SIDEBAR */}
      <SidebarMenu
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        role={role}
        user={user}
        navigation={navigation}
        logout={logout}
      />

      {/* FEATURE BOXES */}
      <ScrollView contentContainerStyle={styles.featuresContainer}>
        {features.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.featureBox}
            onPress={() =>
              typeof item.screen === "function"
                ? item.screen()
                : navigation.navigate(item.screen)
            }
          >
            <View style={styles.iconCircle}>
              <MaterialIcons name={item.icon} size={32} color="#2563eb" />
            </View>
            <Text style={styles.featureTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  welcomeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  featuresContainer: {
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  featureBox: {
    width: "48%",
    backgroundColor: "#fff",
    paddingVertical: 25,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  iconCircle: {
    backgroundColor: "#e0e7ff",
    padding: 15,
    borderRadius: 50,
    marginBottom: 12,
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
  },
});
