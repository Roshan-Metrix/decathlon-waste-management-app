import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";
import { clearOldTransaction } from "../utils/storage";
import { InternetContext } from "./InternetContext";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isConnected, checked } = useContext(InternetContext);

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [region, setRegion] = useState(null);

  // AUTO LOGIN ON APP START
useEffect(() => {
  if (!checked) return;

  const loadUserFromToken = async () => {
    if (!isConnected) {
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      let res;

      const endpoints = [
        "/auth/manager/profile",
        "/auth/admin/profile",
        "/auth/store/profile",
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          if (response?.data?.success) {
            res = response;
            break;
          }
        } catch (error) {
          // silently try next endpoint
        }
      }

      if (res?.data?.success) {
        setUser(res.data.manager || res.data.admin || res.data.store);
        setRegion(res.data.store.state);
      } else {
        await AsyncStorage.removeItem("token");
        setUser(null);
      }
    } catch (err) {
      console.log("Auto-login error:", err.message);
      await AsyncStorage.removeItem("token");
      setUser(null);
    }

    setLoading(false);
  };

  loadUserFromToken();
}, [isConnected, checked]);

  // LOGIN
  const login = async (email, password) => {
    if (!isConnected) {
      return { success: false, message: "No internet connection" };
    }

    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (!data.success) {
        setError(data.message);
        return data;
      }

      await AsyncStorage.setItem("token", data.token);

      if (!data.user.isApproved) {
        setError("Your account is not approved yet.");
        setUser(null);
        return { success: false };
      }

      setUser(data.user);
      setRegion(data.user.state);
      setError("");
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await clearOldTransaction();
      setUser(null);
      setError("");
    } catch (err) {
      console.log("Logout error:", err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setLoading,
        error,
        setError,
        login,
        logout,
        isConnected,
        region,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
