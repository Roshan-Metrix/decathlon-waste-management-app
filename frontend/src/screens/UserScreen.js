// import { View, Text, TouchableOpacity, ScrollView, StyleSheet,Image } from "react-native";
// import { useState, useEffect, useContext } from "react";
// import { MaterialIcons } from "@expo/vector-icons";
// import { AuthContext } from "../context/AuthContext";
// import { SidebarMenu } from "../Components/SidebarMenu";
// import { FeatureBox } from "../Components/FeatureBox";

// export default function UserScreen({ navigation }) {
//   const { user, logout } = useContext(AuthContext);
//   const [role, setRole] = useState("");
//   const [sidebarVisible, setSidebarVisible] = useState(false);

//   useEffect(() => {
//     if (user?.role) setRole(user.role);
//     else setRole("User");
//   }, [user]);

//   //  Role-based boxes
//   const roleBoxes = {
//     admin: [
//       { title: "Add Store", icon: "store", screen: "AddStoreScreen" },
//       { title: "Manage Stores", icon: "storefront", screen: "ManageStoresScreen" },
//       { title: "Manage Admins", icon: "manage-accounts", screen: "ManageAdminScreen" },
//       { title: "Manage Managers", icon: "supervisor-account", screen: "ManageManagerScreen" },
//       { title: "Manage Data", icon: "folder", screen: "ManageDataAdminScreen" },
//       { title: "Notify Stores", icon: "notifications", screen: "NotifyStoresScreen" },
//       { title: "Data Analysis", icon: "query-stats", screen: "DataAnalysisScreen" },
//     ],
//     manager: [
//       { title: "Process Transaction", icon: "account-balance", screen: "AddTransactionScreen" },
//       { title: "Manage Data", icon: "folder", screen: "ManageDataManagerScreen" },
//       { title: "Manage Managers", icon: "supervisor-account", screen: "ManageOwnStoreManagersScreen" },
//       { title: "View Tasks", icon: "assignment", screen: "ViewTasksScreen" },
//       { title: "History", icon: "history", screen: "HistoryManagersScreen" },
//     ],
//   };

//   //  Optional default features (visible to all)
//   const optionalFeatures = [
//     { title: "Profile", icon: "person", screen: "ProfileScreen" },
//   ];

//   const features = [...(roleBoxes[role] || []),...optionalFeatures];

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => setSidebarVisible(true)}>
//           <MaterialIcons name="menu" size={30} color="#fff" style={{paddingTop:15}} />
//         </TouchableOpacity>
//         <Text style={styles.welcomeText}>Welcome, {user?.name || "User"}</Text>
//       </View>

//       {/* Sidebar */}
//       <SidebarMenu
//         visible={sidebarVisible}
//         onClose={() => setSidebarVisible(false)}
//         role={role}
//         user={user} 
//         navigation={navigation}
//         logout={logout}
//       />

//       {/* Feature Boxes */}
//       <ScrollView
//         contentContainerStyle={styles.featuresContainer}
//         showsVerticalScrollIndicator={false}
//       >
//         {features.map((item, index) => (
//           <FeatureBox
//             key={index}
//             icon={item.icon}
//             title={item.title}
//             onPress={() => navigation.navigate(item.screen)}
//           />
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8fafc",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#2563eb",
//     paddingHorizontal: 20,
//     paddingVertical: 18,
//   },
//   welcomeText: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "700",
//     marginTop:25,
//   },
//   featuresContainer: {
//     padding: 20,
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
// });


import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
import { useState, useEffect, useContext } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import { SidebarMenu } from "../Components/SidebarMenu";
import { FeatureBox } from "../Components/FeatureBox";

export default function UserScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [role, setRole] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    setRole(user?.role || "User");
  }, [user]);

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
      { title: "Process Transaction", icon: "account-balance", screen: "AddTransactionScreen" },
      { title: "Manage Data", icon: "folder", screen: "ManageDataManagerScreen" },
      { title: "Manage Managers", icon: "supervisor-account", screen: "ManageOwnStoreManagersScreen" },
      { title: "View Tasks", icon: "assignment", screen: "ViewTasksScreen" },
      { title: "History", icon: "history", screen: "HistoryManagersScreen" },
    ],
  };

  const optionalFeatures = [{ title: "Profile", icon: "person", screen: "ProfileScreen" }];

  const features = [...(roleBoxes[role] || []), ...optionalFeatures];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1e3a8a", "#2563eb"]} style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <MaterialIcons name="menu" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.userContainer}>
          {/* <Image
            source={{ uri: user?.profilePic || "https://i.pravatar.cc/80" }}
            style={styles.userImage}
          /> */}
             <MaterialIcons name="account-circle" size={45} color="#fff" />
          <Text style={styles.welcomeText}>Welcome, {user?.name || "User"}</Text>
        </View>
      </LinearGradient>

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
      <ScrollView contentContainerStyle={styles.featuresContainer}>
        {features.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.featureBox}
            onPress={() => navigation.navigate(item.screen)}
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

  userImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#fff",
    marginRight: 10,
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
