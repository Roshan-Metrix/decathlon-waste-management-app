import storeModel from "../models/storeModel.js";
import dotenv from "dotenv";
import transactionModel from "../models/transactionModel.js";
dotenv.config();

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

export const getAllStores = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 4, 1);
  const skip = (page - 1) * limit;

  try {
    const allStore = await storeModel
      .find()
      .select("-password -__v")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await storeModel.countDocuments();

    const stores = [
      allStore.map((store) => ({
        storeId: store.storeId,
        name: store.name,
        storeLocation: store.storeLocation,
        contactNumber: store.contactNumber,
        email: store.email,
        createdAt: store.createdAt,
      })),
    ]

    return res.json({
      success: true,
      count: totalCount,
      page,
      hasMore: skip + stores.length < totalCount,
      stores,
    });
  } catch (error) {
    console.log("Error in getAllStores Controller:", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

// Get all stores with total transactions summary (paginated)
export const getStoreWithTotalTransactionsDetails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    // Aggregate store summary
    const stores = await transactionModel.aggregate([
      {
        $group: {
          _id: "$store.storeId",
          storeName: { $first: "$store.storeName" },
          storeLocation: { $first: "$store.storeLocation" },
          storeState: { $first: "$store.storeState"},
          transactionCount: { $sum: 1 },
          totalItems: { $sum: { $size: "$items" } }
        }
      },
      { $sort: { _id: 1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    // total stores count
    const totalStores = await transactionModel.distinct("store.storeId");

    // overall stats
    const allTransactions = await transactionModel.find();

    const formattedStores = stores.map((store) => ({
      storeId: store._id,
      storeName: store.storeName,
      storeLocation: store.storeLocation,
      storeState: store.storeState,
      transactionCount: store.transactionCount
    }));

    return res.json({
      success: true,
      message: "Stores fetched successfully",
      totalTransactions: allTransactions.length,
      totalItems: allTransactions.reduce((acc, txn) => acc + txn.items.length, 0),
      totalStores: totalStores.length,
      page,
      hasMore: skip + stores.length < totalStores.length,
      stores: formattedStores
    });

  } catch (error) {
    console.log("Error in getStoreWithTotalTransactionsDetails:", error);
    return res.json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Get total weights according to material type from date filter (from - to) of individual store
export const getStoreTotalWeightsByDates = async (req, res) => {
  try {
    const { storeId, from, to } = req.params;

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    if (!storeId || !from || !to) {
      return res.json({
        success: false,
        message: "storeId, from and to dates are required.",
      });
    }

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
      { $match: { "items.0": { $exists: true } } }
    ]);

    const materialStats = {};

    transactions.forEach((txn) => {
      txn.items.forEach((item) => {
        const type = item.materialType;
        const rate = parseFloat(item.materialRate || 0);
        const weight = parseFloat(item.weight || 0);

        if (!materialStats[type]) {
          materialStats[type] = {
            materialType: type,
            totalItems: 0,
            totalAmount: 0,
            weight: 0,
            rate,
          };
        }

        materialStats[type].totalItems += 1;
        materialStats[type].weight += weight;
        materialStats[type].totalAmount += weight * rate;
      });
    });

    // convert object to array
    const allItems = Object.values(materialStats).map((entry) => ({
      materialType: entry.materialType,
      totalItems: entry.totalItems,
      rate: parseFloat(entry.rate.toFixed(2)),
      totalAmount: parseFloat(entry.totalAmount.toFixed(2)),
      weight: parseFloat(entry.weight.toFixed(2)),
    }));

    // pagination
    const paginatedItems = allItems.slice(skip, skip + limit);

    return res.json({
      success: true,
      message: "Fetched successfully!",
      vendorName: transactions.length ? transactions[0].vendorName : null,
      storeName: transactions.length ? transactions[0].store.storeName : null,
      storeLocation: transactions.length
        ? transactions[0].store.storeLocation
        : null,

      page,
      hasMore: skip + paginatedItems.length < allItems.length,

      totalMaterials: allItems.length,
      items: paginatedItems,
    });
  } catch (error) {
    console.error(
      "Error in getStoreTotalWeightsByDates Controller:",
      error
    );
    return res.json({ success: false, message: "Internal Server Error" });
  }

};

export const deleteStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return res.json({
        success: false,
        message: "Store ID is required",
      });
    }

    const store = await storeModel.findOne({ storeId });

    if (!store) {
      return res.json({
        success: false,
        message: "Store not found",
      });
    }

    const result = await storeModel.deleteOne({ storeId });

    return res.json({
      success: true,
      message: "Store removed successfully",
      deletedStoreID: storeId,
    });
  } catch (error) {
    console.log("Error in deleteStore Controller : ", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

export const editStoreDetails = async (req, res) => {
  try {
    const { storeId } = req.params;
    console.log(storeId);
    const { name, storeLocation, states, contactNumber, email } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (storeLocation) updateData.storeLocation = storeLocation;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (states) updateData.states = states;
    if (email) updateData.email = email;

    const updatedStore = await storeModel.findByIdAndUpdate(
       storeId ,
      { $set: updateData },
      { new: true, select: "-password -__v" }
    );

    if (!updatedStore) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Store details updated successfully",
    });

  } catch (error) {
    console.error("Error in editStoreDetails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
