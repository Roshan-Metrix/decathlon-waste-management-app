import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

// Common Screens
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import UserScreen from "../screens/UserScreen";
import SavedDataScreen from "../screens/SavedDataScreen";
import SearchScreen from "../screens/SearchScreen";

// Admin Screens
import AddStoreScreen from "../screens/Admin/AddStoreScreen";
import ManageStoresScreen from "../screens/Admin/ManageStoresScreen";
import NotifyStoresScreen from "../screens/Admin/NotifyStoresScreen";
import DataAnalysisScreen from "../screens/Admin/DataAnalysisScreen";

// Manager Screens
import ExportDataScreen from "../screens/Manager/ExportDataScreen";
import ProcessTransactionScreen from "../screens/Manager/ProcessTransactionScreen";

// Staff Screens
import AddEntryScreen from "../screens/Staff/AddEntryScreen";
import CheckDataScreen from "../screens/Staff/CheckDataScreen";

import { AuthContext } from "../context/AuthContext";
import ManageManagerScreen from "../screens/Admin/ManageManagerScreen";
import ManageDataAdminScreen from "../screens/Admin/ManageDataAdminScreen";
import ManageDataManagerScreen from "../screens/Manager/ManageDataManagerScreen";
import ManageStaffScreen from "../screens/Manager/ManageStaffScreen";
import HistoryManagerScreen from "../screens/Manager/HistoryManagerScreen";
import HistoryStaffScreen from "../screens/Staff/HistoryStaffScreen";
import ViewTasksScreen from "../screens/Staff/ViewTasksScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
          </>
        ) : (
          <>
            {/* Main user home */}
            <Stack.Screen name="User" component={UserScreen} />
            <Stack.Screen name="SavedDataScreen" component={SavedDataScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />

            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />

            {/* Admin Screens */}
            <Stack.Screen name="AddStoreScreen" component={AddStoreScreen} />
            <Stack.Screen name="ManageDataAdminScreen" component={ManageDataAdminScreen} />
            <Stack.Screen name="ManageStoresScreen" component={ManageStoresScreen} />
            <Stack.Screen name="ManageManagerScreen" component={ManageManagerScreen} />
            <Stack.Screen name="NotifyStoresScreen" component={NotifyStoresScreen} />
            <Stack.Screen name="DataAnalysisScreen" component={DataAnalysisScreen} />

            {/* Manager Screens */}
            <Stack.Screen name="ManageDataManagerScreen" component={ManageDataManagerScreen} />
            <Stack.Screen name="ManageStaffScreen" component={ManageStaffScreen} />
            <Stack.Screen name="HistoryManagerScreen" component={HistoryManagerScreen} />
            <Stack.Screen name="ExportDataScreen" component={ExportDataScreen} />
            <Stack.Screen name="ProcessTransactionScreen" component={ProcessTransactionScreen} />

            {/* Staff Screens */}
            <Stack.Screen name="AddEntryScreen" component={AddEntryScreen} />
            <Stack.Screen name="ViewTasksScreen" component={ViewTasksScreen} />
            <Stack.Screen name="CheckDataScreen" component={CheckDataScreen} />
            <Stack.Screen name="HistoryStaffScreen" component={HistoryStaffScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

{/* <Stack.Screen
  name="AddStoreScreen"
  component={AddStoreScreen}
  options={{ headerShown: true, title: "Add Store" }}
/> */}
