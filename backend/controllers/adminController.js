import adminModel from "../models/adminModel.js";
import materialRateModel from "../models/materialRateModel.js";

// Get all admins with count of approved and restricted admins --
export const getAllAdmins = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    // Run Metrics Accumulator and Paginated Fetch in Parallel
    const [statsResult, admins, totalCount] = await Promise.all([
      adminModel.aggregate([
        {
          $group: {
            _id: null,
            approvedCount: { $sum: { $cond: ["$isApproved", 1, 0] } },
            restrictedCount: { $sum: { $cond: ["$isApproved", 0, 1] } }
          }
        },
        {
          $project: { _id: 0, approvedCount: 1, restrictedCount: 1 }
        }
      ]),

      //  Paginated Document Fetch
      adminModel
        .find()
        .select("-password -__v")
        .skip(skip)
        .limit(limit)
        .lean(),
      adminModel.estimatedDocumentCount()
    ]);

    // Extract calculated data fields or fall back to zero states natively
    const stats = statsResult[0] || { approvedCount: 0, restrictedCount: 0 };

    return res.status(200).json({
      success: true,
      count: totalCount,
      approvedCount: stats.approvedCount,
      restrictedCount: stats.restrictedCount,
      admins,
      page,
      hasMore: skip + admins.length < totalCount
    });

  } catch (error) {
    console.error("Error in getAllAdmins: ", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addMaterialTypeAndRate = async (req, res) => {
  try {
    const { state, materials } = req.body;
    const adminId = req.user.id;

    if (!state || !materials || !Array.isArray(materials)) {
      return res.status(400).json({
        success: false,
        message: "State and materials are required",
      });
    }

    await materialRateModel.updateOne(
      { state },
      { 
        $setOnInsert: { 
          state, 
          materials: [], 
          createdBy: adminId 
        } 
      },
      { upsert: true }
    );

    const bulkOperations = materials.map((item) => {
      return {
        updateOne: {
          filter: { state, "materials.materialType": item.materialType },
          update: { 
            $set: { "materials.$.rate": item.rate } 
          }
        }
      };
    });

    // Run the bulk match operations matrix
    const bulkResult = await materialRateModel.bulkWrite(bulkOperations);

    const newMaterialsToPush = [];
    
    // bulkWrite tracks unmatched arrays dynamically. If an item was modified, it means it already existed.
    materials.forEach((item, index) => {
      // If a bulk match failed to find a pre-existing materialType field, we register it for an array push insertion
      if (bulkResult.matchedCount < materials.length) {
        newMaterialsToPush.push(item);
      }
    });

    if (newMaterialsToPush.length > 0) {
      await materialRateModel.updateOne(
        { state },
        {
          $addToSet: { 
            materials: { $each: newMaterialsToPush } 
          }
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Materials and rates synchronized successfully",
    });

  } catch (error) {
    console.error("Error in addMaterialTypeAndRate:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Regions (States) for which material rates are defined --
export const getAllRegions = async (req, res) => {
  try {
    const uniqueStates = await materialRateModel.distinct("state");

    return res.status(200).json({
      success: true,
      count: uniqueStates.length, 
      regions: uniqueStates,     
    });
  } catch (error) {
    console.error("Error in getAllRegions controller: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Material Types and Rates for a Region (State) --
export const getAllMaterialsWithRate = async (req, res) => {
  const { region } = req.params;

  try {
    const rateData = await materialRateModel
      .findOne({ state: region })
      .select("materials -_id")
      .lean();

    if (!rateData || !rateData.materials || rateData.materials.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No materials found for the specified region",
      });
    }

    const materials = rateData.materials.map(mat => `${mat.materialType}: ${mat.rate}`);

    return res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });

  } catch (error) {
    console.error("Error in getAllMaterialsWithRate controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete a Region (State) and its associated material rates --
export const deleteRegion = async (req, res) => {
  const { region } = req.params;
  
  try {
    const deletedRegion = await materialRateModel
      .findOneAndDelete({ state: region })
      .select("_id") 
      .lean();

    if (!deletedRegion) {
      return res.status(404).json({
        success: false,
        message: "Region not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Region deleted successfully",
    });

  } catch (error) {
    console.error("Error in deleteRegion controller: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};