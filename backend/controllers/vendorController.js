import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import vendorModel from "../models/vendorModel.js";
import transactionModel from "../models/transactionModel.js";
import storeModel from "../models/storeModel.js";
import transporter from "../config/nodemailer.js";
import { VENDOR_ADDED_TEMPLATE } from "../config/emailTemplates.js";

// Vendor Registration by Admin only
export const vendorRegister = async (req, res) => {
  const { name, email, password, vendorLocation, contactNumber } = req.body;

  if (!name || !email || !password || !vendorLocation || !contactNumber) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    // Check if vendor already exists
    const existingVendor = await vendorModel.findOne({ email });
    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: "Vendor with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vendor
    const newVendor = new vendorModel({
      name,
      email,
      password: hashedPassword,
      vendorLocation,
      contactNumber,
      role: "vendor",
      isApproved: true,
    });

    await newVendor.save();

    // Generate token (optional, for instant login)
    const token = jwt.sign(
      { id: newVendor._id, role: newVendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Set cookie (optional: only if you want auto login after register)
    res.cookie("vendorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send welcome email with credentials
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome To Decathlon",
      html: VENDOR_ADDED_TEMPLATE.replace("{{email}}", email).replace(
        "{{password}}",
        password,
      ),
    };

    await transporter.sendMail(mailOption);

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully.",
    });
  } catch (error) {
    console.error("Vendor Registration Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const vendorLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    // Check if vendor exists
    const vendor = await vendorModel.findOne({ email });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    // Check password
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
      { expiresIn: "7d" },
    );

    // Set cookie for vendor
    res.cookie("vendorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response
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
      message: "Server error. Please try again later.",
    });
  }
};

export const logoutVendor = async (req, res) => {
  try {
    res.clearCookie("vendorToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
    });

    return res.json({
      success: true,
      message: "Vendor logged out successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//  Get logged in vendor details
export const getVendorLoggedInDetails = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendor = await vendorModel
      .findById(vendorId)
      .select("-password -__v");

    if (!vendor) {
      return res.json({ success: false, message: "Vendor not found" });
    }

    return res.json({
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
    return res.json({ success: false, message: error.message });
  }
};

// Get all stores related to particular vendor
export const getAllRelatedStores = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendor = await vendorModel
      .findById(vendorId)
      .select("-password -__v");

    if (!vendor) {
      return res.json({ success: false, message: "Vendor not found" });
    }

    const transactions = await transactionModel
      .find({ vendorName: vendor.name })
      .select("-password -__v");

    const uniqueStores = [];
    const seenStoreIds = new Set();

    transactions.forEach((txn) => {
      if (!seenStoreIds.has(txn.store.storeId)) {
        seenStoreIds.add(txn.store.storeId);
        uniqueStores.push({
          storeId: txn.store.storeId,
          storeName: txn.store.storeName,
          storeLocation: txn.store.storeLocation,
          transactionCount: transactions.filter(
            (t) => t.store.storeId === txn.store.storeId,
          ).length,
        });
      }
    });

    return res.json({
      success: true,
      message: "Related stores fetched successfully",
      totalTransactions: transactions.length,
      totalStores:
        new Set(transactions.map((txn) => txn.store.storeId)).size || 0,
      totalItems:
        transactions.reduce((acc, txn) => acc + txn.items.length, 0) || 0,
      totalStores: uniqueStores.length,
      stores: uniqueStores,
    });
  } catch (error) {
    console.log("Error in getAllStores Controller : ", error);
    return res.json({ success: false, message: error.message });
  }
};

// Get all transactions of particular stores
export const getAllRelatedStoresTransactions = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendor = await vendorModel
      .findById(vendorId)
      .select("-password -__v");
    if (!vendor) {
      return res.json({ success: false, message: "Vendor not found" });
    }

    const storeId = req.params.storeId;

    const transactions = await transactionModel
      .find({ "store.storeId": storeId, vendorName: vendor.name })
      .select("-password -__v");

    if (transactions.length === 0) {
      return res.json({
        success: false,
        message: "No transactions found for this store",
      });
    }

    const formattedTransactions = transactions.map((txn) => ({
      transactionId: txn.transactionId,
      storeName: txn.store.storeName,
      managerName: txn.managerName,
      createdAt: txn.createdAt,
      updatedAt: txn.updatedAt,
      totalItems: txn.items.length || 0,
    }));

    return res.json({
      success: true,
      message: "Related transactions fetched successfully",
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.log("Error in getAllStores Controller : ", error);
    return res.json({ success: false, message: error.message });
  }
};

// Get total transaction of all store related to particular vendor
export const AllTransactionsVendorController = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendor = await vendorModel
      .findById(vendorId)
      .select("-password -__v");

    if (!vendor) {
      return res.json({ success: false, message: "Vendor not found" });
    }

    const transactions = await transactionModel
      .find({ vendorName: vendor.name })
      .select("-password -__v");

    const formattedTransactions = transactions.map((txn) => ({
      transactionId: txn.transactionId,
      storeName: txn.store.storeName,
      managerName: txn.managerName,
      calibration: {
        image: txn.calibration?.image || null,
        error: txn.calibration?.error || null,
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
      message: "All transactions fetched successfully",
      totalTransactions: formattedTransactions.length,
      totalStores:
        new Set(formattedTransactions.map((txn) => txn.store.storeId)).size ||
        0,
      totalItems:
        formattedTransactions.reduce((acc, txn) => acc + txn.items.length, 0) ||
        0,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.log("Error in AllTransactionsVendors\Controller:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Get all vendors for Admin
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await vendorModel.find().select("-password -__v");

    return res.json({
      success: true,
      message: "Vendors fetched successfully",
      count: vendors.length,
      vendors: vendors,
    });
  } catch (error) {
    console.log("Error in getAllVendors Controller:", error);
    return res.json({ success: false, message: error.message });
  }
};

// Get total weights according to material type from date filter (from - to)
export const getTotalWeightsByDates = async (req, res) => {
  try {
    const { storeId, from, to } = req.params;

    // Example: { storeId: 'ST-123', from: '2025-12-31', to: '2025-12-31' }

    if (!storeId || !from || !to) {
      return res.json({
        success: false,
        message: "storeId, from and to dates are required.",
      });
    }

    // From 00:00:00 to 23:59:59 on the given dates
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const transactions = await transactionModel.aggregate([
      { $match: { "store.storeId": storeId } },
      {
        $addFields: {
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: {
                $and: [
                  { $gte: ["$$item.createdAt", fromDate] },
                  { $lte: ["$$item.createdAt", toDate] },
                ],
              },
            },
          },
        },
      },
      { $match: { "items.0": { $exists: true } } },
      // Only include docs with at least one matching item
    ]);

    const materialStats = {};

    transactions.forEach((txn) => {
      txn.items.forEach((item) => {
        const type = item.materialType;
        const weight = parseFloat(item.weight || 0);

        if (!materialStats[type]) {
          materialStats[type] = {
            materialType: type,
            totalItems: 0,
            weight: 0,
          };
        }
        materialStats[type].totalItems += 1;
        materialStats[type].weight += weight;
      });
    });

    // Format and round weights to two decimal places
    const items = Object.values(materialStats).map((entry) => ({
      materialType: entry.materialType,
      totalItems: entry.totalItems,
      weight: parseFloat(entry.weight.toFixed(2)),
    }));

    return res.json({
      success: true,
      message: "Fetched successfully!",
      vendorName: transactions.length > 0 ? transactions[0].vendorName : null,
      storeName:
        transactions.length > 0 ? transactions[0].store.storeName : null,
      storeLocation:
        transactions.length > 0 ? transactions[0].store.storeLocation : null,
      items,
    });
  } catch (error) {
    console.error("Error in getTotalWeightsByDates Controller:", error);
    return res.json({ success: false, message: error.message });
  }
};

// const fromDate = new Date(from).toISOString().split("T")[0];
// const toDate = new Date(to).toISOString().split("T")[0];
// console.log(fromDate, toDate);
