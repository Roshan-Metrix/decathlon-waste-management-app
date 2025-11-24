import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";
import { clearOldTransaction } from "../utils/storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); 

  // AUTO LOGIN ON APP START
  useEffect(() => {
    const loadUserFromToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        let res;

        try {
          // Try manager profile first
          res = await api.get("/auth/manager/profile");
        } catch {
          // If manager API fails try admin
          try {
            res = await api.get("/auth/admin/profile");
          } catch {
            // Token invalid
            await AsyncStorage.removeItem("token");
            setUser(null);
            setLoading(false);
            return;
          }
        }

        if (res.data?.success) {
          setUser(res.data.manager || res.data.admin || res.data.user);
        } else {
          await AsyncStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        console.log("Auto-login error:", err);
        await AsyncStorage.removeItem("token");
        setUser(null);
      }

      setLoading(false);
    };

    loadUserFromToken();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (!data.success) {
        setError(data.message);
        return data;
      }

      // save token
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


// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/api"; 

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [error, setError] = useState("");

//   // Login
// const login = async (email, password) => {
//   try {
//     const { data } = await api.post("/auth/login", { email, password });

//     if (!data.success) {
//       setError(data.message);
//       return data;
//     }

//     await AsyncStorage.setItem("token", data.token);

//     if (!data.user.isApproved) {
//       setError("Your account is not approved yet.");
//       setUser(null);
//       return { success: false };
//     }

//     setUser(data.user);
//     setError("");

//     return { success: true, message: "Login successful" };
//   } catch (err) {
//     setError(err.message);
//     return { success: false, message: err.message };
//   }
// };


//   // Logout
//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem("token");
//       setUser(null);
//       setError("");
//     } catch (err) {
//       console.log("Logout error:", err.message);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         error,
//         setError,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
