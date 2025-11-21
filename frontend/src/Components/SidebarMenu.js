// import { View, Text, TouchableOpacity, Animated, Dimensions } from "react-native";
// import { useRef, useEffect } from "react";
// import { MaterialIcons } from "@expo/vector-icons";

// const { width } = Dimensions.get("window");

// export const SidebarMenu = ({ visible, onClose, role, navigation, logout, user }) => {
//   const slideAnim = useRef(new Animated.Value(-width)).current;

//   useEffect(() => {
//     Animated.timing(slideAnim, {
//       toValue: visible ? 0 : -width,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, [visible]);

//   function roleReturn() {
//     if (role === "admin") return "Admin";
//     if (role === "manager") return "Manager";
//     return "Staff";
//   }

//   return (
//     <>
//       {/* Overlay */}
//       {visible && (
//         <TouchableOpacity
//           activeOpacity={1}
//           onPress={onClose}
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0,0,0,0.3)",
//             zIndex: 5,
//           }}
//         />
//       )}

//       {/* Sidebar */}
//       <Animated.View
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           bottom: 0,
//           width: width * 0.7,
//           backgroundColor: "#fff",
//           paddingTop: 60,
//           paddingHorizontal: 20,
//           transform: [{ translateX: slideAnim }],
//           zIndex: 10,
//         }}
//       >
//         <Text
//           style={{
//             fontSize: 20,
//             fontWeight: "700",
//             textAlign: "center",
//             color: "#2563eb",
//             marginBottom: 20,
//           }}
//         >
//           {roleReturn()}
//         </Text>

//         {/* Menu Items */}
//         {[
//           { label: "Home", screen: "UserScreen", icon: "home" },
//           { label: "Saved Data", screen: "SavedDataScreen", icon: "save" },
//           { label: "Search", screen: "SearchScreen", icon: "search" },
//         ].map((item, i) => (
//           <TouchableOpacity
//             key={i}
//             onPress={() => {
//               onClose();
//               if (item.screen !== "UserScreen") navigation.navigate(item.screen);
//             }}
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               paddingVertical: 12,
//               paddingHorizontal: 10,
//               borderRadius: 12,
//               marginBottom: 10,
//               backgroundColor: "#f3f4f6",
//             }}
//           >
//             <MaterialIcons name={item.icon} size={22} color="#2563eb" />
//             <Text style={{ marginLeft: 12, fontSize: 16, color: "#111827" }}>
//               {item.label}
//             </Text>
//           </TouchableOpacity>
//         ))}

//         {/* User Info Section */}
//         <View
//           style={{
//             position: "absolute",
//             bottom: 110,
//             left: 20,
//             right: 20,
//             flexDirection: "row",
//             alignItems: "center",
//             backgroundColor: "#f9fafb",
//             borderRadius: 12,
//             padding: 12,
//             elevation: 2,
//           }}
//         >
//           <MaterialIcons name="account-circle" size={40} color="#2563eb" />
//           <View style={{ marginLeft: 10 }}>
//             <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
//               {user?.name || "User Name"}
//             </Text>
//             <Text style={{ fontSize: 14, color: "#4b5563" }}>
//               {user?.email || "user@email.com"}
//             </Text>
//           </View>
//         </View>

//         {/* Logout Button */}
//         <TouchableOpacity
//           onPress={logout}
//           style={{
//             position: "absolute",
//             bottom: 40,
//             left: 20,
//             right: 20,
//             backgroundColor: "#dc2626",
//             paddingVertical: 14,
//             borderRadius: 12,
//           }}
//         >
//           <Text
//             style={{
//               color: "#fff",
//               textAlign: "center",
//               fontSize: 16,
//               fontWeight: "600",
//             }}
//           >
//             Logout
//           </Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </>
//   );
// };

import { View, Text, TouchableOpacity, Animated, Dimensions } from "react-native";
import { useRef, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export const SidebarMenu = ({ visible, onClose, role, navigation, logout, user }) => {
  const slideAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  function roleReturn() {
    if (role === "admin") return "Admin";
    if (role === "manager") return "Manager";
    return "Staff";
  }

  return (
    <>
      {/* Background Overlay */}
      {visible && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 5,
          }}
        />
      )}

      {/* Sidebar Panel */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: width * 0.72,
          backgroundColor: "#ffffff",
          paddingTop: 60,
          paddingHorizontal: 20,
          transform: [{ translateX: slideAnim }],
          zIndex: 10,
          elevation: 30,
        }}
      >
        {/* Role Header */}
        <View
          style={{
            backgroundColor: "#2563eb",
            paddingVertical: 12,
            borderRadius: 12,
            marginBottom: 25,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              textAlign: "center",
              color: "#fff",
            }}
          >
            {roleReturn()}
          </Text>
        </View>

        {/* Menu Items */}
        {[
          { label: "Home", screen: "UserScreen", icon: "home" },
          { label: "Saved Data", screen: "SavedDataScreen", icon: "save" },
          { label: "Search", screen: "SearchScreen", icon: "search" },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              onClose();
              if (item.screen !== "UserScreen") navigation.navigate(item.screen);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              paddingHorizontal: 12,
              borderRadius: 14,
              marginBottom: 12,
              backgroundColor: "#f3f6ff",
              elevation: 2,
            }}
          >
            <MaterialIcons name={item.icon} size={22} color="#2563eb" />
            <Text style={{ marginLeft: 12, fontSize: 16, color: "#1f2937" }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Profile Card */}
        <View
          style={{
            position: "absolute",
            bottom: 110,
            left: 20,
            right: 20,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f9fafc",
            borderRadius: 16,
            padding: 14,
            elevation: 4,
          }}
        >
          <MaterialIcons name="account-circle" size={45} color="#2563eb" />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
              {user?.name}
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280" }}>{user?.email}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={logout}
          style={{
            position: "absolute",
            bottom: 40,
            left: 20,
            right: 20,
            backgroundColor: "#dc2626",
            paddingVertical: 14,
            borderRadius: 14,
            elevation: 3,
          }}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};
