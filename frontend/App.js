import React, { useContext } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

import { AuthProvider } from "./src/context/AuthContext";
import {
  InternetProvider,
  InternetContext,
} from "./src/context/InternetContext";

import NoInternetModal from "./src/Components/NoInternetScreen";
import AppNavigator from "./src/navigation/AppNavigator";

function AppContent() {
  const { isConnected } = useContext(InternetContext);
  
  return (
    <>
      {/* Main App Navigation */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
        <AppNavigator />
      </KeyboardAvoidingView>

      {/* Global No Internet Overlay */}
      <NoInternetModal visible={!isConnected} />
    </>
  );
}

export default function App() {
  return (
    <InternetProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </InternetProvider>
  );
}
// import React from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   TouchableWithoutFeedback,
//   Keyboard,
// } from "react-native";
// import { AuthProvider } from "./src/context/AuthContext";
// import AppNavigator from "./src/navigation/AppNavigator";

// export default function App() {
//   return (
//     <AuthProvider>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <AppNavigator />
//         </TouchableWithoutFeedback>
//       </KeyboardAvoidingView>
//     </AuthProvider>
//   );
// }
