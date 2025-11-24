import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

export default function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [managerData, setManagerData] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch manager profile only if role == manager
  const loadManagerProfile = async () => {
    try {
      if (user?.role === "manager") {
        const res = await api.get("/auth/manager/profile");

        if (res.data.success) {
          setManagerData(res.data.manager);
          setStoreData(res.data.store);
        }
      }
    } catch (error) {
      console.log("Manager Profile Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Profile Box */}
      <View style={styles.profileBox}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={90} color="#2563eb" />
        </View>

        {/* Show Admin Data */}
        {user?.role === "admin" && (
          <>
            <Text style={styles.nameText}>{user?.name}</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
            <Text style={styles.roleText}>
              Role: <Text style={styles.roleHighlight}>ADMIN</Text>
            </Text>
          </>
        )}

        {/* Show Manager Data */}
        {user?.role === "manager" && (
          <>
            <Text style={styles.nameText}>{managerData?.name || user.name}</Text>
            <Text style={styles.emailText}>{managerData?.email || user.email}</Text>
            <Text style={styles.roleText}>
              Role: <Text style={styles.roleHighlight}>MANAGER</Text>
            </Text>

            {/* Store Info */}
            <View style={styles.storeBox}>
              <Text style={styles.storeTitle}>Store Details</Text>

              <Text style={styles.storeText}>
                Id: <Text style={styles.storeHighlight}>{storeData?.storeId}</Text>
              </Text>

              <Text style={styles.storeText}>
                Store Name: <Text style={styles.storeHighlight}>{storeData?.name}</Text>
              </Text>

              <Text style={styles.storeText}>
                Location: <Text style={styles.storeHighlight}>{storeData?.storeLocation}</Text>
              </Text>

              <Text style={styles.storeText}>
                Contact: <Text style={styles.storeHighlight}>{storeData?.contactNumber}</Text>
              </Text>

              <Text style={styles.storeText}>
                Email: <Text style={styles.storeHighlight}>{storeData?.email}</Text>
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Change Password */}
      <TouchableOpacity
        style={styles.changePasswordBtn}
        onPress={() => navigation.navigate("ChangePasswordScreen")}
        activeOpacity={0.8}
      >
        <MaterialIcons name="lock-reset" size={24} color="#fff" />
        <Text style={styles.changePasswordText}>Change Password</Text>
      </TouchableOpacity>

      {/* Info Note */}
      {/* <View style={styles.infoBox}>
        <MaterialIcons name="info" size={22} color="#2563eb" />
        <Text style={styles.infoText}>This profile is linked to your Decathlon internal account.</Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  profileBox: {
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    backgroundColor: "#e0e7ff",
    borderRadius: 100,
    padding: 10,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  emailText: {
    fontSize: 16,
    color: "#374151",
    marginTop: 4,
  },
  roleText: {
    fontSize: 16,
    color: "#4b5563",
    marginTop: 8,
  },
  roleHighlight: {
    fontWeight: "bold",
    color: "#2563eb",
  },

  /* Store Box */
  storeBox: {
    width: "100%",
    backgroundColor: "#e0f2fe",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1d4ed8",
    marginBottom: 8,
  },
  storeText: {
    fontSize: 16,
    color: "#1e3a8a",
    marginTop: 4,
  },
  storeHighlight: {
    fontWeight: "600",
    color: "#2563eb",
  },

  /* Change Password Button */
  changePasswordBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 25,
    justifyContent: "center",
    shadowColor: "#2563eb",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  changePasswordText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 30,
  },
  infoText: {
    color: "#1e3a8a",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
});
