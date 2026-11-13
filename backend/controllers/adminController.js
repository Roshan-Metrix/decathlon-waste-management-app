import adminModel from "../models/adminModel.js";
import materialMappingModel from "../models/materialMappingModel.js";
import materialRateModel from "../models/materialRateModel.js";
import vendorModel from "../models/vendorModel.js";

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
    const { state, vendorName, materials } = req.body;
    const adminId = req.user?.id;

    if (
      !state ||
      !vendorName ||
      !materials ||
      !Array.isArray(materials) ||
      materials.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing details.",
      });
    }

    const vendor = await vendorModel.findOne({
      name: vendorName,
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    const materialRate = await materialRateModel.findOne({
      state,
      vendor: vendor._id,
    });

    // CASE 1: State + Vendor configuration doesn't exist

    if (!materialRate) {
      const newMaterialRate = await materialRateModel.create({
        state,
        vendor: vendor._id,
        materials,
        createdBy: adminId,
      });

      return res.status(201).json({
        success: true,
        message: "Material rates created successfully.",
        data: newMaterialRate,
      });
    }

    // CASE 2: State + Vendor configuration already exists

    for (const item of materials) {
      const existingMaterial = materialRate.materials.find(
        (material) =>
          material.materialType === item.materialType
      );

      if (existingMaterial) {
        existingMaterial.rate = item.rate;
      } else {
        materialRate.materials.push({
          materialType: item.materialType,
          rate: item.rate,
        });
      }
    }

    await materialRate.save();

    return res.status(200).json({
      success: true,
      message: "Materials and rates synchronized successfully.",
      data: materialRate,
    });

  } catch (error) {
    console.error("Error in addMaterialTypeAndRate:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

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
  const { region, vendor } = req.params;

  try {
    const rateData = await materialRateModel
      .findOne({ state: region, vendor })
      .select("materials _id")
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
      materialRateId: rateData._id,
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

// Add Material Mapping
export const addMaterialMapping = async (req, res) => {
  const { materials } = req.body;
  const adminId = req.user?.id;

  try {
    if (!Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Materials list is required and cannot be empty.",
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    // Validate each material entry
    for (const material of materials) {
      if (
        !material.materialType ||
        !material.officialMaterialType ||
        typeof material.materialType !== "string" ||
        typeof material.officialMaterialType !== "string" ||
        !material.materialType.trim() ||
        !material.officialMaterialType.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each material must contain non-empty materialType and officialMaterialType.",
        });
      }
    }

    // Prevent duplicate internal material types
    const materialTypes = materials.map((material) =>
      material.materialType.trim().toLowerCase()
    );

    const uniqueMaterialTypes = new Set(materialTypes);

    if (uniqueMaterialTypes.size !== materialTypes.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate materialType values are not allowed.",
      });
    }

    const formattedMaterials = materials.map((material) => ({
      materialType: material.materialType.trim(),
      officialMaterialType: material.officialMaterialType.trim(),
    }));

    const mapping = await materialMappingModel.findOneAndUpdate(
      {},
      {
        $set: {
          materials: formattedMaterials,
          createdBy: adminId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Material mappings saved successfully.",
      data: mapping,
    });
  } catch (error) {
    console.error("Error in addMaterialMapping controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// Get Material Mapping
export const getMaterialMapping = async (req, res) => {
  const { region, vendor } = req.params;

  try {
    const materialMapping = await materialMappingModel
      .findOne()
      .select("materials createdBy createdAt updatedAt")
      .lean();

    // No mapping has been created yet
    if (!materialMapping) {
      return res.status(200).json({
        success: true,
        message: "No material mapping found.",
        data: {
          materials: [],
          ...(region && { region }),
          ...(vendor && { vendor }),
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Material mapping fetched successfully.",
      data: {
        _id: materialMapping._id,
        materials: materialMapping.materials,
        createdBy: materialMapping.createdBy,
        createdAt: materialMapping.createdAt,
        updatedAt: materialMapping.updatedAt,
        ...(region && { region }),
        ...(vendor && { vendor }),
      },
    });
  } catch (error) {
    console.error("Error in getMaterialMapping controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

// Delete Material Mapping
export const deleteMaterialMapping = async (req, res) => {
  try {
    // Delete the complete mapping document
    const deletedMapping = await materialMappingModel.findOneAndDelete({});

    if (!deletedMapping) {
      return res.status(404).json({
        success: false,
        message: "Material mapping not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Material mapping deleted successfully.",
      data: deletedMapping,
    });
  } catch (error) {
    console.error("Error in deleteMaterialMapping controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

