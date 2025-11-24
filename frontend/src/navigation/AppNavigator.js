import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

// Common Screens
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import UserScreen from "../screens/UserScreen";
import SavedDataScreen from "../screens/SavedDataScreen";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";

// Admin Screens
import AddStoreScreen from "../screens/Admin/AddStoreScreen";
import ManageStoresScreen from "../screens/Admin/ManageStoresScreen";
import NotifyStoresScreen from "../screens/Admin/NotifyStoresScreen";
import DataAnalysisScreen from "../screens/Admin/DataAnalysisScreen";
import ManageManagerScreen from "../screens/Admin/ManageManagerScreen";
import ManageDataAdminScreen from "../screens/Admin/ManageDataAdminScreen";
import ManageAdminScreen from "../screens/Admin/ManageAdminScreen";
import ViewOtherAdminsScreen from "../screens/Admin/ManageAdmins/ViewOtherAdminsScreen";
import AddAdminsScreen from "../screens/Admin/ManageAdmins/AddAdminsScreen";
import ViewManagersScreen from "../screens/Admin/ManageManagers/ViewManagersScreen";
import RemoveStoresScreen from "../screens/Admin/ManageStores/RemoveStoresScreen";
import ViewAllStoresScreen from "../screens/Admin/ManageStores/ViewAllStoresScreen";
import AddManagersScreen from "../screens/Admin/ManageManagers/AddManagersScreen";

// Manager Screens
import ExportDataScreen from "../screens/Manager/ExportDataScreen";
import ManageDataManagerScreen from "../screens/Manager/ManageDataManagerScreen";
import HistoryManagersScreen from "../screens/Manager/HistoryManagersScreen";
import HistoryStaffScreen from "../screens/Manager/HistoryManagersScreen";
import ViewTasksScreen from "../screens/Manager/ViewTasksScreen";
import ManageOwnStoreManagersScreen from "../screens/Manager/ManageOwnStoreManagersScreen";
import ViewOwnStoreManagersScreen from "../screens/Manager/ManageOtherManagers/ViewOwnStoreManagersScreen";
import AddOtherManagersScreen from "../screens/Manager/ManageOtherManagers/AddOtherManagersScreen";
import AddTransactionScreen from "../screens/Manager/TransactionScreens/AddTransactionScreen";
import ProcessTransactionScreen from "../screens/Manager/TransactionScreens/ProcessTransactionScreen";
import CalibrationPhaseScreen from "../screens/Manager/TransactionScreens/CalibrationPhaseScreen";
import CredentialVerificationScreen from "../screens/Manager/TransactionScreens/CredentialVerificationScreen";
import VendorSignatureScreen from "../screens/Manager/TransactionScreens/VendorSignatureScreen";
import BillingExportTransactionScreen from "../screens/Manager/TransactionScreens/BillingExportTransactionScreen";
import ItemsTransactionScreen from "../screens/Manager/TransactionScreens/ItemsTransactionScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingScreen from "../Components/LoadingScreen";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
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
            <Stack.Screen name="UserScreen" component={UserScreen} />
            <Stack.Screen name="SavedDataScreen" component={SavedDataScreen} />
            <Stack.Screen name="SearchScreen" component={SearchScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />

            {/* Admin Screens */}
            <Stack.Screen name="AddStoreScreen" component={AddStoreScreen} />
            <Stack.Screen name="ManageDataAdminScreen" component={ManageDataAdminScreen} />
            <Stack.Screen name="ManageStoresScreen" component={ManageStoresScreen} />
            <Stack.Screen name="ManageManagerScreen" component={ManageManagerScreen} />
            <Stack.Screen name="ManageAdminScreen" component={ManageAdminScreen} />
            <Stack.Screen name="NotifyStoresScreen" component={NotifyStoresScreen} />
            <Stack.Screen name="DataAnalysisScreen" component={DataAnalysisScreen} />
            <Stack.Screen name="ViewOtherAdminsScreen" component={ViewOtherAdminsScreen} />
            <Stack.Screen name="AddAdminsScreen" component={AddAdminsScreen} />
            <Stack.Screen name="AddManagersScreen" component={AddManagersScreen} />
            <Stack.Screen name="ViewManagersScreen" component={ViewManagersScreen} />
            <Stack.Screen name="RemoveStoresScreen" component={RemoveStoresScreen} />
            <Stack.Screen name="ViewAllStoresScreen" component={ViewAllStoresScreen} />

            {/* Manager Screens */}
            <Stack.Screen name="ManageDataManagerScreen" component={ManageDataManagerScreen} />
            <Stack.Screen name="ManageOwnStoreManagersScreen" component={ManageOwnStoreManagersScreen} />
            <Stack.Screen name="HistoryManagersScreen" component={HistoryManagersScreen} />
            <Stack.Screen name="ExportDataScreen" component={ExportDataScreen} />
            <Stack.Screen name="AddTransactionScreen" component={AddTransactionScreen} />
            <Stack.Screen name="ViewTasksScreen" component={ViewTasksScreen} />
            <Stack.Screen name="HistoryStaffScreen" component={HistoryStaffScreen} />
            <Stack.Screen name="ViewOwnStoreManagersScreen" component={ViewOwnStoreManagersScreen} />
            <Stack.Screen name="AddOtherManagersScreen" component={AddOtherManagersScreen} />
            <Stack.Screen name="ProcessTransactionScreen" component={ProcessTransactionScreen} />
            <Stack.Screen name="CalibrationPhaseScreen" component={CalibrationPhaseScreen} />
            <Stack.Screen name="CredentialVerificationScreen" component={CredentialVerificationScreen} />
            <Stack.Screen name="VendorSignatureScreen" component={VendorSignatureScreen} />
            <Stack.Screen name="ItemsTransactionScreen" component={ItemsTransactionScreen} />
            <Stack.Screen name="BillingExportTransactionScreen" component={BillingExportTransactionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

