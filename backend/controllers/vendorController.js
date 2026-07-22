import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import vendorModel from "../models/vendorModel.js";
import transactionModel from "../models/transactionModel.js";
import transporter from "../config/nodemailer.js";
import { VENDOR_ADDED_TEMPLATE } from "../config/emailTemplates.js";
import { getReportRecipientsByState } from "../config/reportRecipientsByState.js";
import { fetchTransactionsByDateRange } from "../services/transactionService.js";
import { generatePDF, deletePDF } from "../services/pdfService.js";
import { sendDailyReportEmail } from "../services/emailService.js";
import { formatDateTime } from "../utils/reportUtils.js";
import { getImageUrl } from "../utils/s3.js";

// Vendor Registration by Admin only --
export const vendorRegister = async (req, res) => {
  const { name, email, password, vendorLocation, contactNumber } = req.body;
  const createdBy = req.user.id;

  if (!name || !email || !password || !vendorLocation || !contactNumber) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    const existingVendor = await vendorModel
      .findOne({ email })
      .select("_id") 
      .lean();

    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: "Vendor with this email already exists.",
      });
    }

    // Hashing the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    const newVendor = await vendorModel.create({
      name,
      email,
      password: hashedPassword,
      vendorLocation,
      contactNumber,
      role: "vendor",
      isApproved: true,
      createdBy,
    });

    // Generate token for instant session confirmation
    const token = jwt.sign(
      { id: newVendor._id, role: newVendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie state
    res.cookie("vendorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // layout notification envelope
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome To Decathlon",
      html: VENDOR_ADDED_TEMPLATE.replace("{{email}}", email).replace(
        "{{password}}",
        password
      ),
    };

    // Background Non-Blocking execution stream (Kept isolated as requested)
    transporter.sendMail(mailOption)
      .then((result) => {
        console.log("Email sent:", result.accepted);
      })
      .catch((err) => {
        console.error("Email failed:", err);
      });

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully.",
    });
  } catch (error) {
    console.error("Vendor Registration Error:", error.message);

    // Guard against race conditions using MongoDB native indexing validation keys
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Vendor with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Vendor Login --
export const vendorLogin = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  if(role != 'vendor'){
   return res.status(400).json({
      success: false,
      message: "Vendor can only authorize.",
    });
  }

  try {
    const vendor = await vendorModel
      .findOne({ email })
      .select("password role name email") 
      .lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    // Check password match against the isolated hash field string
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: vendor._id, role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    // Set cookie state securely
    res.cookie("vendorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    // Send optimized response
    return res.status(200).json({
      success: true,
      message: "Vendor login successful.",
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
      },
    });
  } catch (error) {
    console.error("Vendor Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Vendor Logout --
export const logoutVendor = async (req, res) => {
  try {
    res.clearCookie("vendorToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Vendor logged out successfully",
    });
  } catch (error) {
    console.error("Vendor Logout Error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

//  Get logged in vendor details --
export const getVendorLoggedInDetails = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendor = await vendorModel
      .findById(vendorId)
      .select("name email vendorLocation contactNumber role isApproved createdAt updatedAt")
      .lean();

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor details fetched successfully",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        vendorLocation: vendor.vendorLocation,
        contactNumber: vendor.contactNumber,
        role: vendor.role,
        isApproved: vendor.isApproved,
      },
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    });
  } catch (error) {
    console.error("Error in Get Vendor Details:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all stores related to particular vendor --
export const getAllRelatedStores = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendor = await vendorModel.findById(vendorId).select("name").lean();

    if (!vendor) {
      return res.json({ success: false, message: "Vendor not found" });
    }

    const stats = await transactionModel.aggregate([
      { 
        $match: { vendorName: vendor.name } 
      },
      {
        $facet: {
          "totals": [
            {
              $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalItems: { $sum: { $size: { $ifNull: ["$items", []] } } }
              }
            }
          ],
          "stores": [
            {
              $group: {
                _id: "$store.storeId",
                storeName: { $first: "$store.storeName" },
                storeLocation: { $first: "$store.storeLocation" },
                transactionCount: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                storeId: "$_id",
                storeName: 1,
                storeLocation: 1,
                transactionCount: 1
              }
            }
          ]
        }
      }
    ]);

    const resultTotals = stats[0].totals[0] || { totalTransactions: 0, totalItems: 0 };
    const uniqueStores = stats[0].stores || [];

    return res.json({
      success: true,
      message: "Related stores fetched successfully",
      totalTransactions: resultTotals.totalTransactions,
      totalItems: resultTotals.totalItems,
      totalStores: uniqueStores.length,
      stores: uniqueStores,
    });
  } catch (error) {
    console.error("Error in getAllStores Controller: ", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

// Get all transactions of particular stores --
export const getAllRelatedStoresTransactions = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const storeId = req.params.storeId;

    const vendor = await vendorModel.findById(vendorId).select("name").lean();
    if (!vendor) {
      return res.json({ success: false, message: "Vendor not found" });
    }

    // - Uses the compound index instantly
    const transactions = await transactionModel
      .find({ "store.storeId": storeId, vendorName: vendor.name })
      .select("transactionId store.storeName managerName createdAt updatedAt items")
      .lean();

    if (!transactions || transactions.length === 0) {
      return res.json({
        success: false,
        message: "No transactions found for this store",
      });
    }

    const formattedTransactions = transactions.map((txn) => ({
      transactionId: txn.transactionId,
      storeName: txn.store?.storeName || "",
      managerName: txn.managerName,
      createdAt: txn.createdAt,
      updatedAt: txn.updatedAt,
      totalItems: txn.items ? txn.items.length : 0,
    }));

    return res.json({
      success: true,
      message: "Related transactions fetched successfully",
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error("Error in getAllRelatedStoresTransactions Controller: ", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

// Get total transaction of all store related to particular vendor --
export const AllTransactionsVendorController = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const vendor = await vendorModel.findById(vendorId).select("name").lean();
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const [statsResult, transactions] = await Promise.all([
      transactionModel.aggregate([
        { $match: { vendorName: vendor.name } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            uniqueStores: { $addToSet: "$store.storeId" },
            totalItems: { $sum: { $size: { $ifNull: ["$items", []] } } }
          }
        },
        {
          $project: {
            _id: 0,
            totalTransactions: 1,
            totalStores: { $size: "$uniqueStores" },
            totalItems: 1
          }
        }
      ]),

      transactionModel.find({ vendorName: vendor.name })
        .select({
          transactionId: 1,
          "store.storeId": 1,
          "store.storeName": 1,
          "store.storeLocation": 1,
          managerName: 1,
          "calibration.image": 1,
          "calibration.error": 1,
          items: 1,
          createdAt: 1,
          updatedAt: 1
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    // Extract calculated stats or fall back to zeros if no records exist
    const stats = statsResult[0] || { totalTransactions: 0, totalStores: 0, totalItems: 0 };

    // Format only the paginated slice
    const formattedTransactions = transactions.map((txn) => ({
      transactionId: txn.transactionId,
      storeName: txn.store?.storeName || null,
      managerName: txn.managerName,
      calibration: {
        image: getImageUrl(txn.calibration?.image) || null,
        error: txn.calibration?.error ?? null,
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
      totalTransactions: stats.totalTransactions,
      totalStores: stats.totalStores,
      totalItems: stats.totalItems,
      transactions: formattedTransactions,
      page,
      hasMore: skip + transactions.length < stats.totalTransactions
    });
  } catch (error) {
    console.error("Error in AllTransactionsVendorController:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Get all vendors for Admin --
export const getAllVendors = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1); 
    const skip = (page - 1) * limit;

    const [vendors, totalCount] = await Promise.all([
      vendorModel
        .find()
        .select("-password -__v") 
        .skip(skip)
        .limit(limit)
        .lean(), 

      vendorModel.estimatedDocumentCount() 
    ]);

    return res.status(200).json({
      success: true,
      message: "Vendors fetched successfully",
      count: totalCount, 
      vendors: vendors,
      page,
      hasMore: skip + vendors.length < totalCount
    });
  } catch (error) {
    console.error("Error in getAllVendors Controller:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get total weights according to material type from date filter (from - to) of individual store --
export const getTotalWeightsByDates = async (req, res) => {
  try {
    const { storeId, from, to } = req.params;

    if (!storeId || !from || !to) {
      return res.status(400).json({
        success: false,
        message: "storeId, from and to dates are required.",
      });
    }

    // Standardize dates to cover the entire day window cleanly
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const statsPipeline = await transactionModel.aggregate([
      {
        $match: {
          "store.storeId": storeId,
          createdAt: { $gte: fromDate, $lte: toDate } 
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.materialType",
          totalItems: { $sum: 1 },
          totalWeight: { $sum: "$items.weight" },
          totalAmount: { $sum: { $multiply: ["$items.weight", "$items.materialRate"] } },
          rate: { $first: "$items.materialRate" },
          vendorName: { $first: "$vendorName" },
          storeName: { $first: "$store.storeName" },
          storeLocation: { $first: "$store.storeLocation" }
        }
      },
      {
        $project: {
          _id: 0,
          materialType: "$_id",
          totalItems: 1,
          rate: { $round: ["$rate", 2] },
          totalAmount: { $round: ["$totalAmount", 2] },
          weight: { $round: ["$totalWeight", 2] },
          meta: {
            vendorName: "$vendorName",
            storeName: "$storeName",
            storeLocation: "$storeLocation"
          }
        }
      }
    ]);

    // Handle scenario where no data exists for the selected date range
    if (!statsPipeline || statsPipeline.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Fetched successfully!",
        vendorName: null,
        storeName: null,
        storeLocation: null,
        items: []
      });
    }

    // Extract common metadata from the first calculated row
    const firstRowMeta = statsPipeline[0].meta;

    // Clean up the item objects by removing the temporary internal meta tags
    const formattedItems = statsPipeline.map(({ meta, ...itemData }) => itemData);

    return res.status(200).json({
      success: true,
      message: "Fetched successfully!",
      vendorName: firstRowMeta.vendorName,
      storeName: firstRowMeta.storeName,
      storeLocation: firstRowMeta.storeLocation,
      items: formattedItems,
    });
  } catch (error) {
    console.error("Error in getTotalWeightsByDates Controller:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete vendor by Admin only --
export const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "vendorId is required",
      });
    }

    const vendor = await vendorModel.findByIdAndDelete(vendorId).select("_id").lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor deleted successfully!",
    });
  } catch (error) {
    console.error("Error in deleteVendor controller: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Generate and send daily transaction report manually
// Can be called via API endpoint for testing or manual report generation --
export const generateDailyReportManual = async (req, res) => {
  const { storeId, from, to, vendorName, sendEmail = true } = req.body;
  
  let pdfFilePath = null; 

  if (!storeId || !from || !to) {
    return res.status(400).json({
      success: false,
      message: "storeId, from, and to (date in YYYY-MM-DD format) are required.",
    });
  }

  try {
    // Standardize dates to cover the full UTC window cleanly
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const reportData = await fetchTransactionsByDateRange(
      storeId,
      fromDate,
      toDate,
      vendorName || null
    );

    if (!reportData || !reportData.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch transaction data",
      });
    }

    //  Multiple vendor validation guard
    if (!vendorName && reportData.vendorNames?.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Multiple vendors were found for this store and date range. Please provide vendorName to generate a vendor-specific report.",
        vendors: reportData.vendorNames,
      });
    }

    // Emptiness guard clauses
    if (!reportData.items || reportData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No transactions found for the specified date range and store",
      });
    }

    reportData.reportDate = from;
    reportData.storeId = storeId;

    const recipientEmails = getReportRecipientsByState(reportData.storeState) || [];

    if (sendEmail && recipientEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No report recipient emails configured for state "${reportData.storeState}"`,
      });
    }

    //  File generation 
    const pdfFileName = `daily-report-${storeId}-${from}.pdf`;
    pdfFilePath = await generatePDF(reportData, pdfFileName);

    let emailSent = false;

    if (sendEmail) {
      try {
        const emailResult = await sendDailyReportEmail(
          recipientEmails,
          reportData.storeState,
          reportData,
          pdfFilePath
        );
        emailSent = emailResult?.success || false;
      } catch (emailError) {
        console.error("Background Mail Service Failure:", emailError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Report generated successfully",
      data: {
        reportDate: from,
        vendorName: reportData.vendorName,
        storeName: reportData.storeName,
        storeLocation: reportData.storeLocation,
        storeState: reportData.storeState,
        totalTransactions: reportData.totalTransactions,
        totalItems: reportData.totalItems,
        totalWeight: reportData.totalWeight,
        totalAmount: reportData.totalAmount,
        items: reportData.items,
        emailSent,
        recipientEmails,
        generatedAt: formatDateTime(new Date()),
      },
    });
  } catch (error) {
    console.error("Error in generateDailyReportManual:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (pdfFilePath) {
      try {
        deletePDF(pdfFilePath);
      } catch (cleanupError) {
        console.error("Failed to delete temp PDF file:", cleanupError);
      }
    }
  }
};

// const fromDate = new Date(from).toISOString().split("T")[0];
// const toDate = new Date(to).toISOString().split("T")[0];
// console.log(fromDate, toDate);
