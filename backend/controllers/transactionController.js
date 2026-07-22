import crypto from "crypto";
import { runOcrOnImage } from "../lib/ocrService.js";
import transactionModel from "../models/transactionModel.js";
import { generateTransactionId } from "../utils/generateTransactionId.js";
import { getImageUrl } from "../utils/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3.js";

// Add Transaction Detail Controller --
export const AddTransactionDetailController = async (req, res) => {
  try {
    const {
      storeId,
      storeName,
      storeLocation,
      storeState,
      managerName,
      vendorName,
    } = req.body;

    const createdBy = req.user.id;

    if (
      !storeId ||
      !storeName ||
      !storeLocation ||
      !storeState ||
      !managerName ||
      !vendorName
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const transactionId = await generateTransactionId(storeId);

    const newTransaction = await transactionModel.create({
      transactionId,
      store: {
        storeId,
        storeName,
        storeLocation,
        storeState,
      },
      managerName,
      vendorName,
      calibration: {
        image: "",
        error: 0,
      },
      items: [],
      createdBy,
      creatorModel: req.user.role,
    });

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transactionId: newTransaction.transactionId,
    });
  } catch (error) {
    console.error("Error in AddTransactionDetailController:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Transaction ID conflict occurred. Please try again.",
      });
    }

    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// export const TransactionItemsController = async (req, res) => {
//   try {
//     const { transactionId } = req.params;
//     const { materialType, image, weight, weightSource, materialRate } =
//       req.body;

//     if (!materialType) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Material Type is required" });
//     }
//     if (!weight) {
//       return res
//         .status(400)
//         .json({ success: false, message: "weight is required" });
//     }
//     if (!weightSource || !["manually", "system"].includes(weightSource)) {
//       return res.status(400).json({
//         success: false,
//         message: "weightSource must be 'manually' or 'system'",
//       });
//     }

//     const transactionMeta = await transactionModel
//       .findOne({ transactionId })
//       .select("calibration.error items.itemNo")
//       .lean();

//     if (!transactionMeta) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Transaction not found" });
//     }

//     const positiveWeight = Math.abs(Number(weight) || 0);
//     const calibrationError = Number(transactionMeta.calibration?.error || 0);

//     const finalWeight = parseFloat(
//       (positiveWeight - calibrationError).toFixed(3),
//     );

//     const nextItemNo = (transactionMeta.items?.length || 0) + 1;

//     const updatedTransaction = await transactionModel
//       .findOneAndUpdate(
//         { transactionId },
//         {
//           $push: {
//             items: {
//               itemNo: nextItemNo,
//               materialType,
//               materialRate: Number(materialRate) || 0,
//               image: image || "",
//               weight: finalWeight,
//               weightSource,
//             },
//           },
//         },
//         { new: true, select: "items" },
//       )
//       .lean();

//     return res.status(200).json({
//       success: true,
//       message: "Item added successfully",
//       items: updatedTransaction.items,
//     });
//   } catch (error) {
//     console.error("Error in TransactionItemsController:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal Server Error" });
//   }
// };

// Calibration GEMINI OCR Recognition

export const TransactionItemsController = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { materialType, weight, weightSource, materialRate } = req.body;

    const imageFile = req.file;

    if (!materialType) {
      return res.status(400).json({
        success: false,
        message: "Material Type is required",
      });
    }

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Item image is required",
      });
    }

    if (!weight) {
      return res.status(400).json({
        success: false,
        message: "Weight is required",
      });
    }

    if (!weightSource || !["manually", "system"].includes(weightSource)) {
      return res.status(400).json({
        success: false,
        message: "weightSource must be 'manually' or 'system'",
      });
    }

    // Get transaction details
    const transactionMeta = await transactionModel
      .findOne({ transactionId })
      .select("calibration.error items.itemNo")
      .lean();

    if (!transactionMeta) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Calculate corrected weight
    const positiveWeight = Math.abs(Number(weight) || 0);
    const calibrationError = Number(transactionMeta.calibration?.error || 0);

    const finalWeight = parseFloat(
      (positiveWeight - calibrationError).toFixed(3)
    );

    const nextItemNo = (transactionMeta.items?.length || 0) + 1;

    // Upload image to S3

    const extension =
      imageFile.originalname.split(".").pop() ||
      imageFile.mimetype.split("/")[1] ||
      "jpg";

    const imageKey = `transactions/${transactionId}/items/item-${nextItemNo}-${crypto.randomUUID()}.${extension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: imageKey,
        Body: imageFile.buffer,
        ContentType: imageFile.mimetype,
      })
    );

    // Saving in MongoDB

    const updatedTransaction = await transactionModel
      .findOneAndUpdate(
        { transactionId },
        {
          $push: {
            items: {
              itemNo: nextItemNo,
              materialType,
              materialRate: Number(materialRate) || 0,
              image: imageKey, // Save S3 key
              weight: finalWeight,
              weightSource,
            },
          },
        },
        {
          new: true,
          select: "items",
        }
      )
      .lean();

    return res.status(200).json({
      success: true,
      message: "Item added successfully",
      items: updatedTransaction.items,
    });

  } catch (error) {
    console.error("Error in TransactionItemsController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const recognizeWithGeminiController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const weight = await runOcrOnImage(req.file.buffer);

    res.json({
      success: true,
      weight,
    });
  } catch (err) {
    console.error("Error in recognizeWithGeminiController:", err);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// Transaction Calibration Controller --
// export const TransactionCalibrationController = async (req, res) => {
//   try {
//     const { transactionId } = req.params;
//     const { image, fetchWeight, enterWeight } = req.body;

//     if (!image || !fetchWeight || !enterWeight) {
//       return res
//         .status(400)
//         .json({ success: false, message: "All fields are required" });
//     }

//     const fw = parseFloat(fetchWeight) || 0;
//     const ew = parseFloat(enterWeight) || 0;
//     const error = parseFloat(Math.abs(fw - ew).toFixed(3));

//     if (error > 0.1) {
//       return res.status(400).json({
//         success: false,
//         message: "Zero error must be less than or equal to 0.1 kg",
//       });
//     }

//     const updatedTransaction = await transactionModel
//       .findOneAndUpdate(
//         { transactionId },
//         {
//           $set: {
//             calibration: { image, error },
//           },
//         },
//         { new: true, select: "calibration" },
//       )
//       .lean();

//     if (!updatedTransaction) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Transaction not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Calibration added successfully",
//       calibration: updatedTransaction.calibration,
//       error: updatedTransaction.calibration.error.toFixed(3),
//     });
//   } catch (error) {
//     console.error("Error in TransactionCalibrationController:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal Server Error" });
//   }
// };

export const TransactionCalibrationController = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { fetchWeight, enterWeight } = req.body;

    const imageFile = req.file;

    if (!imageFile || !fetchWeight || !enterWeight) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const fw = parseFloat(fetchWeight) || 0;
    const ew = parseFloat(enterWeight) || 0;
    const error = parseFloat(Math.abs(fw - ew).toFixed(3));

    if (error > 0.1) {
      return res.status(400).json({
        success: false,
        message: "Zero error must be less than or equal to 0.1 kg",
      });
    }

    //  Upload calibration image to S3 

    const extension =
      imageFile.originalname.split(".").pop() ||
      imageFile.mimetype.split("/")[1] ||
      "jpg";

    const imageKey = `transactions/${transactionId}/calibration.${extension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: imageKey,
        Body: imageFile.buffer,
        ContentType: imageFile.mimetype,
      })
    );

    // Update MongoDB 

    const updatedTransaction = await transactionModel
      .findOneAndUpdate(
        { transactionId },
        {
          $set: {
            calibration: {
              image: imageKey,
              error,
            },
          },
        },
        {
          new: true,
          select: "calibration",
        }
      )
      .lean();

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Calibration added successfully",
      calibration: updatedTransaction.calibration,
      error: updatedTransaction.calibration.error.toFixed(3),
    });

  } catch (error) {
    console.error("Error in TransactionCalibrationController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Store Total Transaction Controller with pagination and store details --
export const StoreTotalTransactionController = async (req, res) => {
  const { storeId } = req.params;

  // Pagination parameters
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 4, 1);
  const skip = (page - 1) * limit;

  try {
    const transactions = await transactionModel
      .find({ "store.storeId": storeId })
      .select({
        transactionId: 1,
        managerName: 1,
        createdAt: 1,
        "store.storeId": 1,
        "store.storeName": 1,
        createdBy: 1,
        creatorModel: 1,
        itemsCount: { $size: "$items" },
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        transactions: [],
        hasMore: false,
      });
    }

    const totalCount = await transactionModel.countDocuments({
      "store.storeId": storeId,
    });

    const StoreDetail = {
      storeId: transactions[0].store.storeId,
      storeName: transactions[0].store.storeName,
    };

    const formattedTransactions = transactions.map((txn) => ({
      transactionId: txn.transactionId,
      managerName: txn.managerName,
      item: txn.itemsCount,
      createdAt: txn.createdAt,
      creatorType: txn.creatorModel,
    }));

    formattedTransactions.reverse();

    return res.status(200).json({
      success: true,
      message: "Store transactions fetched successfully",
      transactions: formattedTransactions,
      store: StoreDetail,
      page,
      hasMore: skip + transactions.length < totalCount,
    });
  } catch (error) {
    console.error("Error in StoreTotalTransactionController:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Particular Transaction Controller with all details --
export const ParticularTransactionController = async (req, res) => {
  const transactionId = req.params.transactionId;

  try {
    const txn = await transactionModel
      .findOne({ transactionId })
      .select(
        "transactionId managerName vendorName calibration store items createdAt updatedAt",
      )
      .lean();

    // If no transaction is found, return a 404 immediately
    if (!txn) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const formattedTransaction = {
      transactionId: txn.transactionId,
      managerName: txn.managerName,
      vendorName: txn.vendorName,
      calibration: {
        image: getImageUrl(txn.calibration?.image) || null,
        error: txn.calibration?.error || null,
      },
      store: {
        storeId: txn.store?.storeId || null,
        storeName: txn.store?.storeName || null,
        storeLocation: txn.store?.storeLocation || null,
      },

      items: Array.isArray(txn.items)
        ? txn.items.map((item) => ({
            itemNo: item.itemNo,
            materialType: item.materialType,
            materialRate: item.materialRate,
            image: getImageUrl(item.image) || null,
            weight: item.weight,
            weightSource: item.weightSource,
            aiWeight: item.aiWeight,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }))
        : [],
      createdAt: txn.createdAt,
      updatedAt: txn.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      transactions: [formattedTransaction],
    });
  } catch (error) {
    console.error("Error in ParticularTransactionController:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Get total transaction of all store --
export const AllTransactionsController = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 3, 1);
    const skip = (page - 1) * limit;

    const transactions = await transactionModel
      .find()
      .select({
        transactionId: 1,
        managerName: 1,
        vendorName: 1,
        "calibration.image": 1,
        "store.storeId": 1,
        "store.storeName": 1,
        "store.storeLocation": 1,
        items: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .allowDiskUse()
      .lean();

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        transactions: [],
        hasMore: false,
      });
    }


    const totalCount = await transactionModel.estimatedDocumentCount(); 

    const formattedTransactions = transactions.map((txn) => ({
      transactionId: txn.transactionId,
      managerName: txn.managerName,
      vendorName: txn.vendorName,
      calibration: {
        image: getImageUrl(txn.calibration?.image) || null,
      },
      store: {
        storeId: txn.store?.storeId || null,
        storeName: txn.store?.storeName || null,
        storeLocation: txn.store?.storeLocation || null,
      },
      items: (txn.items || []).map((item) => ({
        itemNo: item.itemNo,
        materialType: item.materialType,
        image: getImageUrl(item.image) || null,
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
      message: "All transactions fetched successfully",
      transactions: formattedTransactions,
      page,
      hasMore: skip + transactions.length < totalCount,
    });
  } catch (error) {
    console.error("Error in AllTransactionController:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Selected Transaction Items Controller --
export const SelectedTransactionItemsController = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await transactionModel
      .findOne({ transactionId })
      .select({
        vendorName: 1,
        items: 1,
        _id: 0,
      })
      .lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    transaction.items = transaction.items.map((item) => ({
      ...item,
      image: getImageUrl(item.image),
    }));

    return res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      vendorName: transaction.vendorName,
      items: transaction.items,
    });

  } catch (error) {
    console.error("Error in SelectedTransactionItemsController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
