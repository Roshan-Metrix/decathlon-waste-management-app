import managerModel from "../models/managerModel.js";
import storeModel from "../models/storeModel.js";

// Get All Managers --> For Admin --
export const getAllManagers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const [managerStats, totalCount] = await Promise.all([
      managerModel.aggregate([
        { $sort: { createdAt: -1 } },
        
        { $skip: skip },
        { $limit: limit },
        
        // Relational Left-Outer Join matching store configurations
        {
          $lookup: {
            from: "stores",          
            localField: "storeId",    
            foreignField: "storeId",  
            as: "storeDetails"
          }
        },
        
        {
          $addFields: {
            matchedStore: { $arrayElemAt: ["$storeDetails", 0] }
          }
        },
        
        {
          $project: {
            _id: 1,
            storeId: 1,
            name: 1,
            email: 1,
            role: 1,
            isApproved: 1, // Added back to ensure full admin management visibility
            createdAt: 1,
            updatedAt: 1,
            storeName: { $ifNull: ["$matchedStore.name", "Unknown Store"] },
            storeLocation: { $ifNull: ["$matchedStore.storeLocation", ""] }
          }
        }
      ]),

      managerModel.estimatedDocumentCount()
    ]);

    return res.status(200).json({
      success: true,
      count: totalCount,
      managers: managerStats,
      page,
      hasMore: skip + managerStats.length < totalCount
    });
  } catch (error) {
    console.error("Error in getAllManagers Controller:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getManagerProfile = async (req, res) => {
  try {
    const manager = req.manager;
    const store = req.store;

    return res.json({ success: true, manager, store });
  } catch (error) {
    console.log("Error in getManagerProfile Controller:", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

// Get Managers of a Particular Store --> For Managers --
export const getParticularStoreManagers = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "storeId is required.",
      });
    }

    const [managers, store] = await Promise.all([
      managerModel
        .find({ storeId })
        .select("-password -__v")
        .lean(),

      storeModel
        .findOne({ storeId })
        .select("name storeLocation") 
        .lean()
    ]);

    // If the store itself doesn't exist, terminate early to keep data clean
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store profile data not found",
      });
    }

    // Map the pre-fetched metadata strings onto the managers array cleanly in memory
    const managersWithStore = managers.map((m) => ({
      ...m,
      storeName: store.name || "Unknown Store",
      storeLocation: store.storeLocation || "N/A",
    }));

    return res.status(200).json({
      success: true,
      count: managersWithStore.length,
      managers: managersWithStore,
    });

  } catch (error) {
    console.error("Error in getParticularStoreManagers:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

// Delete Manager --> For Admin --
export const deleteManager = async (req, res) => {
  try {
    const { managerId } = req.params;

    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: "ManagerId is required",
      });
    }

    const manager = await managerModel.findByIdAndDelete(managerId).select("_id").lean();

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Manager deleted successfully!",
    });
  } catch (error) {
    console.error("Error in deleteManager controller: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
