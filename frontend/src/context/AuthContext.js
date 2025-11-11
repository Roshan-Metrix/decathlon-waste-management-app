import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Check if token exists and load user profile
  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.get("/auth/profile"); // token auto-added via interceptor
      if (!res.data.user.isApproved) {
        setError("Your account is not approved yet.");
        setUser(null);
      } else {
        setUser(res.data.user);
        setError("");
      }
    } catch (err) {
      console.log("Load user error:", err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Register
  const register = async (name, email, password, role) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password, role });
      if (data.success) {
        setError("Registration successful. Waiting for approval.");
      } else {
        setError(data.message);
      }
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (!data.success) {
        setError(data.message);
        return data;
      }

      // Save token
      await AsyncStorage.setItem("token", data.token);

      // Fetch profile
      const profileRes = await api.get("/auth/profile");
      if (!profileRes.data.user.isApproved) {
        setError("Your account is not approved yet.");
        setUser(null);
        return { success: false, message: "Not approved" };
      }

      setUser(profileRes.data.user);
      setError("");

      return { success: true, message: "Login successful"};
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
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
        error,
        setError,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
