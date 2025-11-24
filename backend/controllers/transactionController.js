import transactionModel from "../models/transactionModel.js";
import {
  CheckTodaysTransactionId,
  generateTransactionId,
} from "../utils/generateTransactionId.js";

// Add Transaction Detail Controller
export const AddTransactionDetailController = async (req, res) => {
  try {
    const { storeId, storeName, storeLocation, managerName, vendorName } =
      req.body;

    if (
      !storeId ||
      !storeName ||
      !storeLocation ||
      !managerName ||
      !vendorName
    ) {
      return res.status(400).json({ success:false, message: "All fields are required" });
    }

    // Generate unique transactionId
    const transactionIdWithoutCount = await CheckTodaysTransactionId(storeId);
    
    // Check for existing open transaction for the store
    const existingTransaction = await transactionModel.findOne({
      transactionId: { $regex: `^${transactionIdWithoutCount}` },
    });
    
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: "Transaction already exists for today",
        transactionId : existingTransaction.transactionId
      });
    }
    
    const transactionId = await generateTransactionId(storeId);
    
    const newTransaction = new transactionModel({
      transactionId,
      store: {
        storeId,
        storeName,
        storeLocation,
      },
      managerName,
      vendorName,
      calibration: {
        image: "", 
      },
      items: [], 
    });

    await newTransaction.save();

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transactionId,
    });
  } catch (error) {
    console.log("Error in AddTransactionDetailController:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Transaction Items Controller
export const TransactionItemsController = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { materialType, image, weight, weightSource } = req.body;

    // Validate required fields
    if (!materialType) {
      return res.status(400).json({ success:false, message: "materialType is required" });
    }
    if (!weight) {
      return res.status(400).json({ success:false, message: "weight is required" });
    }
    if (!weightSource || !["manually", "system"].includes(weightSource)) {
      return res.status(400).json({
        success: false,
        message: "weightSource must be 'manually' or 'system'",
      });
    }

    // Find transaction
    const transaction = await transactionModel.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Auto-generate item number
    const itemNo = transaction.items.length + 1;

    // Push item
    transaction.items.push({
      itemNo,
      materialType,
      image,
      weight,
      weightSource,
    });

    // Save transaction
    await transaction.save();

    return res.status(200).json({
      success: true,
      message: "Item added successfully",
      items: transaction.items
    });
  } catch (error) {
    console.log("Error in TransactionItemsController:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Calibration Controller
export const TransactionCalibrationController = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { image, fetchWeight } = req.body;

    if (!image || !fetchWeight) {
      return res.status(400).json({ success:false, message: "All fields are required" });
    }

    if (fetchWeight < 0 || fetchWeight > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Calibration failed, Try again!" });
    }

    const transaction = await transactionModel.findOne({ transactionId });

    if (!transaction) {
      return res.status(404).json({ success:false, message: "Transaction not found" });
    }

    transaction.calibration = { image };

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: "Calibration added successfully",
      calibration: transaction.calibration,
    });
  } catch (error) {
    console.log("Error in TransactionCalibrationController:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Today's Transaction Controller
export const TodaysTransactionController = async (req, res) => {
  const transactionId = req.params.transactionId;

  try {
    const transactions = await transactionModel.find({ transactionId });

    const formattedTransactions = transactions.map((txn) => ({
      transactionId: txn.transactionId,
      managerName: txn.managerName,
      vendorName: txn.vendorName,
      calibration: {
        image: txn.calibration?.image || null,
      },
      store: {
        storeId: txn.store?.storeId || null,
        storeName: txn.store?.storeName || null,
        storeLocation: txn.store?.storeLocation || null,
      },
      items: txn.items.map((item) => ({
        itemNo: item.itemNo,
        materialType: item.materialType,
        image: item.image,
        weight: item.weight,
        weightSource: item.weightSource,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: txn.createdAt,
      updatedAt: txn.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Today's transactions fetched successfully",
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.log("Error in TodaysTransactionController:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Not is use , but kept for reference or future use
// All Today's Transactions Controller
export const AllStoreTodaysTransactionsController = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await transactionModel.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const formattedTransactions = transactions.map((txn) => ({
      transactionId: txn.transactionId,
      managerName: txn.managerName,
      vendorName: txn.vendorName,
      calibration: {
        image: txn.calibration?.image || null,
      },
      store: {
        storeId: txn.store?.storeId || null,
        storeName: txn.store?.storeName || null,
        storeLocation: txn.store?.storeLocation || null,
      },
      items: txn.items.map((item) => ({
        itemNo: item.itemNo,
        materialType: item.materialType,
        image: item.image,
        weight: item.weight,
        weightSource: item.weightSource,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: txn.createdAt,
      updatedAt: txn.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Today's transactions fetched successfully",
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.log("Error in AllStoreTodaysTransactionsController:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
