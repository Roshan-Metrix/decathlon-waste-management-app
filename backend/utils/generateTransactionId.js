import transactionModel from "../models/transactionModel.js"; 

export const generateTransactionId = async (storeId) => {
 
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const dateString = `${day}${month}${year}`;  //e.g 22102025

  // Count existing transactions for this store on today's date
  const regex = new RegExp(`^${storeId}${dateString}-\\d{2}$`);
  const count = await transactionModel.countDocuments({ transactionId: { $regex: regex } });

  // Increment transaction number and pad to 2 digits
  const transactionNumber = String(count + 1).padStart(2, "0");

  const transactionId = `${storeId}${dateString}-${transactionNumber}`;
  
  // console.log("Generated Transaction ID:", transactionId);
  
  return transactionId;
};
