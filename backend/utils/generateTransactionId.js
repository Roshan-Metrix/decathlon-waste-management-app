import counterModel from "../models/counterModel.js"; 

export const generateTransactionId = async (storeId) => {
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const dateString = `${day}${month}${year}`;  // e.g., 24112025

  const counter = await counterModel.findOneAndUpdate(
    { storeId, dateString },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();

  const transactionNumber = String(counter.seq).padStart(2, "0");
 
  const transactionId = `${storeId}${dateString}-${transactionNumber}`;
  
  return transactionId;
};


// import transactionModel from "../models/transactionModel.js"; 

// export const generateTransactionId = async (storeId) => {
// const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
// const day = String(today.getDate()).padStart(2, "0");
// const month = String(today.getMonth() + 1).padStart(2, "0");
// const year = today.getFullYear();
// const dateString = `${day}${month}${year}`;  // e.g. 24112025

//   const regex = new RegExp(`^${storeId}${dateString}-\\d{2}$`);
//   const count = await transactionModel.countDocuments();

//   const transactionNumber = String(count + 1).padStart(2, "0");
 
//   const transactionId = `${storeId}${dateString}-${transactionNumber}`;
  
//   return transactionId;
// };
