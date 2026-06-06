import storeModel from "../models/storeModel.js";
import dotenv from "dotenv";
import transactionModel from "../models/transactionModel.js";
dotenv.config();

// Get store profile
export const getStoreProfile = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role !== "store") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden Access" });
    }

    const store = await storeModel
      .findOne({ _id: id })
      .select("-password -__v");

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found." });
    }

    return res.json({ success: true, store });

  } catch (error) {
    console.log("Error in getStoreProfile:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error" });
  }
};

// Get all stores --
export const getAllStores = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 4, 1);
  const skip = (page - 1) * limit;

  try {
    const allStoresRaw = await storeModel
      .find()
      .select("storeId name storeLocation contactNumber email createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await storeModel.countDocuments();

    const formattedStores = allStoresRaw.map((store) => ({
      storeId: store.storeId,
      name: store.name,
      storeLocation: store.storeLocation,
      contactNumber: store.contactNumber,
      email: store.email,
      createdAt: store.createdAt,
    }));

    return res.json({
      success: true,
      count: totalCount,
      page,
      hasMore: skip + formattedStores.length < totalCount,
      stores: formattedStores,
    });
  } catch (error) {
    console.error("Error in getAllStores Controller:", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

// Get store details along with total transactions detail(with pagination) --
export const getStoreWithTotalTransactionsDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const result = await transactionModel.aggregate([
      {
        $facet: {
          // Meta-pipeline: Calculated global network statistics safely
          "globalStats": [
            {
              $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalItems: { $sum: { $size: { $ifNull: ["$items", []] } } }
              }
            }
          ],
          // Data-pipeline: Handles grouping, sorting, and pagination
          "paginatedStores": [
            {
              $group: {
                _id: "$store.storeId",
                storeName: { $first: "$store.storeName" },
                storeLocation: { $first: "$store.storeLocation" },
                storeState: { $first: "$store.storeState" },
                transactionCount: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } },
            { $skip: skip },
            { $limit: limit }
          ],
          // Count-pipeline: Gets total unique stores efficiently
          "storeCount": [
            {
              $group: { _id: "$store.storeId" }
            },
            {
              $count: "count"
            }
          ]
        }
      }
    ]);

    // Extracted facet arrays safely with clean defaults
    const stats = result[0]?.globalStats[0] || { totalTransactions: 0, totalItems: 0 };
    const rawStores = result[0]?.paginatedStores || [];
    const totalStores = result[0]?.storeCount[0]?.count || 0;

    const formattedStores = rawStores.map((store) => ({
      storeId: store._id,
      storeName: store.storeName,
      storeLocation: store.storeLocation,
      storeState: store.storeState,
      transactionCount: store.transactionCount
    }));

    return res.json({
      success: true,
      message: "Stores fetched successfully",
      totalTransactions: stats.totalTransactions,
      totalItems: stats.totalItems,
      totalStores: totalStores,
      page,
      hasMore: skip + formattedStores.length < totalStores,
      stores: formattedStores
    });

  } catch (error) {
    console.error("Error in getStoreWithTotalTransactionsDetails:", error);
    return res.json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get total weights according to material type from date filter (from - to) of individual store --
export const getStoreTotalWeightsByDates = async (req, res) => {
  try {
    const { storeId, from, to } = req.params;

    if (!storeId || !from || !to) {
      return res.json({
        success: false,
        message: "storeId, from and to dates are required.",
      });
    }

    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T23:59:59.999Z`);

    const stats = await transactionModel.aggregate([
      { 
        // Matching parent document using the compound index (Store + Date Range)
        $match: { 
          "store.storeId": storeId,
          createdAt: { $gte: fromDate, $lte: toDate }
        } 
      },
      {
        $unwind: "$items"
      },
      {
        $match: {
          "items.createdAt": { $gte: fromDate, $lte: toDate }
        }
      },
      {
        $group: {
          _id: "$items.materialType",
          totalItems: { $sum: 1 },
          weight: { $sum: { $convert: { input: "$items.weight", to: "double", onError: 0 } } },
          totalAmount: { 
            $sum: { 
              $multiply: [
                { $convert: { input: "$items.weight", to: "double", onError: 0 } },
                { $convert: { input: "$items.materialRate", to: "double", onError: 0 } }
              ] 
            } 
          },
          vendorName: { $first: "$vendorName" },
          storeName: { $first: "$store.storeName" },
          storeLocation: { $first: "$store.storeLocation" },
          rate: { $first: { $convert: { input: "$items.materialRate", to: "double", onError: 0 } } }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        message: "No data found for the given criteria.",
        vendorName: null,
        storeName: null,
        storeLocation: null,
        items: []
      });
    }

    const formattedItems = stats.map((entry) => ({
      materialType: entry._id,
      totalItems: entry.totalItems,
      rate: parseFloat(entry.rate.toFixed(2)),
      totalAmount: parseFloat(entry.totalAmount.toFixed(2)),
      weight: parseFloat(entry.weight.toFixed(2)),
    }));

    const meta = stats[0];

    return res.json({
      success: true,
      message: "Fetched successfully!",
      vendorName: meta.vendorName,
      storeName: meta.storeName,
      storeLocation: meta.storeLocation,
      items: formattedItems,
    });
  } catch (error) {
    console.error("Error in getTotalWeightsByDates Controller:", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

// only Admin can delete store --
export const deleteStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return res.json({
        success: false,
        message: "Store ID is required",
      });
    }

    const deletedStore = await storeModel
      .findOneAndDelete({ storeId })
      .select("storeId")
      .lean();

    if (!deletedStore) {
      return res.json({
        success: false,
        message: "Store not found or already removed",
      });
    }

    await transactionModel.deleteMany({ "store.storeId": storeId });

    return res.json({
      success: true,
      message: "Store and all associated transactions removed successfully",
      deletedStoreID: storeId,
    });
  } catch (error) {
    console.error("Error in deleteStore Controller : ", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

// only Admin can edit store details --
export const editStoreDetails = async (req, res) => {
  try {
    const { storeId } = req.params; 
    const { name, storeLocation, state, contactNumber, email } = req.body; 

    if (!storeId) {
      return res.status(400).json({ success: false, message: "Store ID is required" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (storeLocation) updateData.storeLocation = storeLocation;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (state) updateData.state = state;
    if (email) updateData.email = email;

    const updatedStore = await storeModel
      .findOneAndUpdate(
        { storeId }, 
        { $set: updateData },
        { new: true, select: "-password -__v" }
      )
      .lean();

    if (!updatedStore) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    if (name || storeLocation || state) {
      const transactionUpdate = {};
      if (name) transactionUpdate["store.storeName"] = name;
      if (storeLocation) transactionUpdate["store.storeLocation"] = storeLocation;
      if (state) transactionUpdate["store.storeState"] = state;

      transactionModel.updateMany(
        { "store.storeId": storeId },
        { $set: transactionUpdate }
      ).catch(err => console.error("Background Transaction Sync Error:", err));
    }

    return res.status(200).json({
      success: true,
      message: "Store details updated successfully",
      store: updatedStore
    });

  } catch (error) {
    console.error("Error in editStoreDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};