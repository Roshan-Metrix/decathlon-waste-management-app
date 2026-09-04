import React, { useState } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import Alert from "../../../Components/Alert";
const PRIMARY_COLOR = '#1e40af';

export default function AddProceedTransactionScreen({ navigation }) {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleSubmit = () => {
    navigation.navigate("AddTransactionScreen");
  };

  const handleProceed = async () => {
    const stored = await AsyncStorage.getItem("todayTransaction");

    if (!stored) {
      setAlertMessage("No recent transaction available.");
      setAlertVisible(true);
      return;
    }

    const parsed = JSON.parse(stored);
    const transactionId = parsed?.transactionId;

    navigation.navigate("ProcessTransactionScreen", {
      transactionId,
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View
        className="
          flex-row
          items-center
          justify-between
          bg-white
          px-5
          pb-[15px]
          pt-[60px]
          shadow
          shadow-black/10
          elevation-3
        "
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("UserScreen")}
          className="w-8"
        >
          <MaterialIcons name="arrow-back" size={32} color={PRIMARY_COLOR} />
        </TouchableOpacity>

        {/* Header Title */}
        <Text className="ml-[15px] text-[22px] font-bold text-primary">
          Add / Proceed Transaction
        </Text>

        {/* Right Spacer */}
        <View className="w-8" />
      </View>

      {/* CENTERED CONTENT */}
      <View className="flex-1 items-center justify-center px-[30px]">
        {/* Top Icon Circle */}
        <View
          className="
            mb-[10px]
            h-[120px]
            w-[120px]
            items-center
            justify-center
            rounded-full
            bg-blue-100
            shadow-lg
            shadow-black/25
            elevation-6
          "
        >
          <MaterialIcons
            name="playlist-add"
            size={60}
            color={PRIMARY_COLOR}
          />
        </View>

        {/* Title */}
        <Text className="mt-[2px] text-[22px] font-bold text-primary">
          Add / Proceed
        </Text>

        {/* Subtitle */}
        <Text className="mb-5 mt-[6px] text-center text-[15px] text-slate-500">
          Adding can erase previous save transactionId.
        </Text>

        {/* Add New Transaction */}
        <Pressable
          onPress={handleSubmit}
          className="
            mt-2
            w-full
            items-center
            rounded-[14px]
            bg-primary
            py-4
            shadow-md
            shadow-black/15
            elevation-3
          "
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text className="text-[18px] font-bold text-white">
            Add New Transaction
          </Text>
        </Pressable>

        {/* Proceed Recent Transaction */}
        <Pressable
          onPress={handleProceed}
          className="
            mt-2
            w-full
            items-center
            rounded-[14px]
            bg-blue-700
            py-4
            shadow-md
            shadow-black/15
            elevation-3
          "
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text className="text-[18px] font-bold text-white">
            Proceed Recent Transaction
          </Text>
        </Pressable>
      </View>
      <Alert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}
