import adminModel from "../models/adminModel.js";
import materialRateModel from "../models/materialRateModel.js";

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminModel.find().select("-password -__v");

    return res.status(200).json({
      success: true,
      count: admins.length,
      approvedCount: admins.filter(admin => admin.isApproved).length,
      restrictedCount: admins.filter(admin => !admin.isApproved).length,
      admins,
    });

  } catch (error) {
    console.log("Error in getAllAdmins : ", error)
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Add and Edit Material Type and Rate for a State
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

    let existingMaterialRate = await materialRateModel.findOne({ state });

    //  If state exists -> update or add materials
    if (existingMaterialRate) {
      materials.forEach((newMaterial) => {
        const existingMaterial = existingMaterialRate.materials.find(
          (m) => m.materialType === newMaterial.materialType
        );

        if (existingMaterial) {
          // Update rate if material already exists
          existingMaterial.rate = newMaterial.rate;
        } else {
          //  Add new material if not exists
          existingMaterialRate.materials.push(newMaterial);
        }
      });

      await existingMaterialRate.save();

      return res.status(200).json({
        success: true,
        message: "Materials updated successfully",
      });
    }

    //  If state does NOT exist -> create new document
    const materialRate = new materialRateModel({
      state,
      materials,
      createdBy: adminId,
    });

    await materialRate.save();

    return res.status(201).json({
      success: true,
      message: "State and materials created successfully",
    });

  } catch (error) {
    console.log("Error in addMaterialTypeAndRate : ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllRegions = async (req, res) => {
  try {
    const regions = await materialRateModel.find().select("state -_id");
    return res.status(200).json({
      success: true,
      count: regions.length,
      regions: regions.map(region => region.state),
    });
  } catch (error) {
    console.log("Error in getAllRegions controller : ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllMaterialsWithRate = async (req, res) => {
  const { region } = req.params;

  try {
    const data = await materialRateModel
      .find({ state: region })
      .select("materials");

    const materials = data.flatMap(item =>
      item.materials.map(mat => `${mat.materialType}: ${mat.rate}`)
    );

    if(materials.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No materials found for the specified region",
      });
    }

    return res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });

  } catch (error) {
    console.log("Error in getAllMaterials:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
