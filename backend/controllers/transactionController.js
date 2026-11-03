import crypto from "crypto";
import { runOcrOnImage } from "../lib/ocrService.js";
import transactionModel from "../models/transactionModel.js";
import { generateTransactionId } from "../utils/generateTransactionId.js";
import { getImageUrl } from "../utils/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3.js";
import materialRateModel from "../models/materialRateModel.js";
import vendorModel from "../models/vendorModel.js";

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

    const vendorId = await vendorModel.findOne({ name: vendorName }).select("_id").lean();

    const materialId = await materialRateModel.findOne({ vendor: vendorId }).select("_id").lean();

    const newTransaction = await transactionModel.create({
      transactionId,
      store: {
        storeId,
        storeName,
        storeLocation,
        storeState,
      },
      materialRateId: materialId,
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

// Add Transaction Items Controller --
export const TransactionItemsController = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const {
      materialType,
      weight,
      weightSource,
      materialRate,
      materialRateId,
    } = req.body;

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

    if (
      weight === undefined ||
      weight === null ||
      weight === "" ||
      !Number.isFinite(Number(weight)) ||
      Number(weight) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid positive weight is required",
      });
    }

    if (
      materialRate === undefined ||
      materialRate === null ||
      materialRate === "" ||
      !Number.isFinite(Number(materialRate))
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid material rate is required",
      });
    }

    if (
      !weightSource ||
      !["manually", "system"].includes(weightSource)
    ) {
      return res.status(400).json({
        success: false,
        message: "weightSource must be 'manually' or 'system'",
      });
    }

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

    const positiveWeight = Math.abs(Number(weight));

    const calibrationError = Number(
      transactionMeta.calibration?.error || 0
    );

    const finalWeight = Number(
      (positiveWeight - calibrationError).toFixed(3)
    );

    if (!Number.isFinite(finalWeight) || finalWeight <= 0) {
      return res.status(400).json({
        success: false,
        message: "Corrected weight must be greater than zero",
      });
    }

    const nextItemNo =
      (transactionMeta.items?.length || 0) + 1;

    const rate = Number(materialRate);

    const itemAmount = Number(
      (rate * finalWeight).toFixed(2)
    );

    const extension =
      imageFile.originalname.split(".").pop() ||
      imageFile.mimetype.split("/")[1] ||
      "jpg";

    const imageKey =
      `transactions/${transactionId}/items/` +
      `item-${nextItemNo}-${crypto.randomUUID()}.${extension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: imageKey,
        Body: imageFile.buffer,
        ContentType: imageFile.mimetype,
      })
    );

    const updateFields = {};

    if (materialRateId) {
      updateFields.materialRateId = materialRateId;
    }

    const updatedTransaction = await transactionModel.findOneAndUpdate(
      { transactionId },
      {
        $push: {
          items: {
            itemNo: nextItemNo,
            materialType,
            materialRate: rate,
            image: imageKey,
            weight: finalWeight,
            weightSource,
          },
        },
        ...(Object.keys(updateFields).length > 0
          ? { $set: updateFields }
          : {}),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    let total = 0;
    let receivable = 0;
    let payable = 0;

    for (const item of updatedTransaction.items) {
      const amount = Number(
        (Number(item.materialRate) * Number(item.weight)).toFixed(2)
      );

      total += amount;

      if (amount > 0) {
        receivable += amount;
      } else if (amount < 0) {
        payable += Math.abs(amount);
      }
    }

    total = Number(total.toFixed(2));
    receivable = Number(receivable.toFixed(2));
    payable = Number(payable.toFixed(2));

    const net = Number(
      (receivable - payable).toFixed(2)
    );

    updatedTransaction.total = total;
    updatedTransaction.receivable = receivable;
    updatedTransaction.payable = payable;
    updatedTransaction.net = net;

    await updatedTransaction.save();

    return res.status(200).json({
      success: true,
      message: "Item added successfully",
      itemAmount,
      items: updatedTransaction.items
    });

  } catch (error) {
    console.error(
      "Error in TransactionItemsController:",
      error
    );

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

// Transaction Summary Controller
export const TransactionSummaryController = async (req, res) => {
  try {
    const { from, to } = req.query;

    const matchStage = {};

    if ((from && !to) || (!from && to)) {
      return res.status(400).json({
        success: false,
        message: "Please provide both 'from' and 'to' dates.",
      });
    }

    if (from && to) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      if (!datePattern.test(from) || !datePattern.test(to)) {
        return res.status(400).json({
          success: false,
          message: "Dates must use YYYY-MM-DD format.",
        });
      }

      const startDate = new Date(`${from}T00:00:00.000Z`);
      const endDate = new Date(`${to}T00:00:00.000Z`);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        startDate.toISOString().slice(0, 10) !== from ||
        endDate.toISOString().slice(0, 10) !== to
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid date. Please provide valid calendar dates.",
        });
      }

      if (startDate > endDate) {
        return res.status(400).json({
          success: false,
          message: "'from' date cannot be later than 'to' date.",
        });
      }

      const endExclusive = new Date(endDate);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

      matchStage.createdAt = {
        $gte: startDate,
        $lt: endExclusive,
      };
    }

    const [summary] = await transactionModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: null,
          transactionCount: { $sum: 1 },
          total: { $sum: { $ifNull: ["$total", 0] } },
          receivable: { $sum: { $ifNull: ["$receivable", 0] } },
          payable: { $sum: { $ifNull: ["$payable", 0] } },
          net: { $sum: { $ifNull: ["$net", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          transactionCount: 1,
          total: { $round: ["$total", 2] },
          receivable: { $round: ["$receivable", 2] },
          payable: { $round: ["$payable", 2] },
          net: { $round: ["$net", 2] },
        },
      },
    ]);

    const result = summary || {
      transactionCount: 0,
      total: 0,
      receivable: 0,
      payable: 0,
      net: 0,
    };

    return res.status(200).json({
      success: true,
      message: from && to
        ? "Transaction summary fetched for the selected date range."
        : "Transaction summary fetched successfully.",
      dateRange: from && to ? { from, to } : null,
      summary: result,
    });
  } catch (error) {
    console.error("Error in TransactionSummaryController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Invoice Transaction Controller 
export const TransactionInvoiceController = async (req, res) => {
  try {
    const { from, to } = req.query;

    const matchStage = {};

    // Both dates must be provided together.
    if ((from && !to) || (!from && to)) {
      return res.status(400).json({
        success: false,
        message: "Please provide both 'from' and 'to' dates.",
      });
    }

    if (from && to) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      if (!datePattern.test(from) || !datePattern.test(to)) {
        return res.status(400).json({
          success: false,
          message: "Dates must use YYYY-MM-DD format.",
        });
      }

      const startDate = new Date(`${from}T00:00:00.000Z`);
      const endDate = new Date(`${to}T00:00:00.000Z`);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        startDate.toISOString().slice(0, 10) !== from ||
        endDate.toISOString().slice(0, 10) !== to
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid calendar dates.",
        });
      }

      if (startDate > endDate) {
        return res.status(400).json({
          success: false,
          message: "'from' date cannot be later than 'to' date.",
        });
      }

      const endExclusive = new Date(endDate);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

      matchStage.createdAt = {
        $gte: startDate,
        $lt: endExclusive,
      };
    }

    const groupedItems = await transactionModel.aggregate([
      // Filter transactions before processing their items.
      { $match: matchStage },

      // One transaction may contain multiple items.
      { $unwind: "$items" },

      // Combine the same material across transactions
      // belonging to the same store.
      {
        $group: {
          _id: {
            storeId: "$store.storeId",
            materialType: "$items.materialType",
          },
          quantity: {
            $sum: { $ifNull: ["$items.weight", 0] },
          },
        },
      },

      {
        $sort: {
          "_id.storeId": 1,
          "_id.materialType": 1,
        },
      },
    ]);

    // Return the exact column names expected by the Excel template.
    // Fields without a defined source are currently left blank.
    const rows = groupedItems.map((item) => ({
      "Cost Center": "",
      "Store Code": item._id.storeId ?? "",
      "gstin_of_consignee": "",
      "legal_name_of_consignee": "",
      "address1_of_consignee": "",
      "address2_of_consignee": "",
      "place_of_consignee": "",
      "pincode_of_consignee": "",
      "state_of_supply": "",
      "document_number": "",
      "document_date": "",
      "ref_document_number": "",
      "note_type": "",
      "reason": "",
      "original_document_number": "",
      "original_document_date": "",
      "po_number": "",
      "order_dt": "",
      "p_due_date": "",
      "s_dt": "",
      "item_code": "",
      "payment_type": "",
      "hsn_code": "",
      "product_name_item": item._id.materialType ?? "",
      "product_description_item": item._id.materialType ?? "",
      "unit_of_product_item": "Kgs",
      "quantity_item": Number(item.quantity.toFixed(3)),
      "taxable_amount_item": "",
      "discount": "",
      "gst_rate_item": "",
      "cess_amount_item": "",
      "freight_amount": "",
      "ins_amount": "",
      "pack_for_amount": "",
      "supply_type": "",
      "sub_supply_type": "",
      "document_type": "",
      "transporter_id": "",
      "transporter_name": "",
      "approximate_distance": "",
      "transportation_mode": "",
      "vehicle_number": "",
      "vehicle_type": "",
      "transporter_doc_no": "",
      "transporter_doc_date": "",
      "order_id": "",
      "ref_order_id": "",
      "original_order_id": "",
      "is_amended": "",
      "return_period": "",
      "delivery_challan": "",
      "dispatch_date": "",
      "actual_to_state": "",
      "tcs_rate": "",
      "Including Tax": "",
    }));

    return res.status(200).json({
      success: true,
      message: "Transaction export data fetched successfully.",
      dateRange: from && to ? { from, to } : null,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error in TransactionExportController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Transaction Summary Controller by StoreId
export const TransactionStoreSummaryController = async (req, res) => {
  try {
    const { storeId, from, to } = req.query;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "storeId is required.",
      });
    }

    if ((from && !to) || (!from && to)) {
      return res.status(400).json({
        success: false,
        message: "Please provide both 'from' and 'to' dates.",
      });
    }

    const matchStage = {
      "store.storeId": storeId,
    };

    if (from && to) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      if (!datePattern.test(from) || !datePattern.test(to)) {
        return res.status(400).json({
          success: false,
          message: "Dates must use YYYY-MM-DD format.",
        });
      }

      const startDate = new Date(`${from}T00:00:00.000Z`);
      const endDate = new Date(`${to}T00:00:00.000Z`);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        startDate.toISOString().slice(0, 10) !== from ||
        endDate.toISOString().slice(0, 10) !== to
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid calendar dates.",
        });
      }

      if (startDate > endDate) {
        return res.status(400).json({
          success: false,
          message: "'from' date cannot be later than 'to' date.",
        });
      }

      const endExclusive = new Date(endDate);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

      matchStage.createdAt = {
        $gte: startDate,
        $lt: endExclusive,
      };
    }

    const [summary] = await transactionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          transactionCount: { $sum: 1 },
          total: { $sum: { $ifNull: ["$total", 0] } },
          receivable: { $sum: { $ifNull: ["$receivable", 0] } },
          payable: { $sum: { $ifNull: ["$payable", 0] } },
          net: { $sum: { $ifNull: ["$net", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          transactionCount: 1,
          total: { $round: ["$total", 2] },
          receivable: { $round: ["$receivable", 2] },
          payable: { $round: ["$payable", 2] },
          net: { $round: ["$net", 2] },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Store transaction summary fetched successfully.",
      storeId,
      dateRange: from && to ? { from, to } : null,
      summary: summary || {
        transactionCount: 0,
        total: 0,
        receivable: 0,
        payable: 0,
        net: 0,
      },
    });
  } catch (error) {
    console.error("Error in TransactionStoreSummaryController:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
