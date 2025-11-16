import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Login
const login = async (email, password) => {
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
    setError("");

    return { success: true, message: "Login successful" };
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
        error,
        setError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
