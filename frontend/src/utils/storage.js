import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveTodayTransaction = async (transactionId) => {
  const today = new Date().toLocaleString("en-CA", { timeZone: "Asia/Kolkata" }).split(",")[0];
  await AsyncStorage.setItem("todayTransaction", JSON.stringify({
    date: today,
    transactionId
  }));
};

export const getTodayTransaction = async () => {
  const data = await AsyncStorage.getItem("todayTransaction");
  return data ? JSON.parse(data) : null;
};

export const clearOldTransaction = async () => {
  await AsyncStorage.removeItem("todayTransaction");
  await AsyncStorage.setItem("calibrationStatus","Pending");
  await AsyncStorage.setItem("credentialStatus","Pending");
  await AsyncStorage.removeItem("managerSignature");
  await AsyncStorage.removeItem("vendorSignature");
};
