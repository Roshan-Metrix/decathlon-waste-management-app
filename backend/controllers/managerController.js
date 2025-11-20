import managerModel from "../models/managerModel.js";
import storeModel from "../models/storeModel.js";

// Get All Managers --> For Admin
export const getAllManagers = async (req, res) => {
  try {
    const managers = await managerModel.find().select("-password -__v");

    const managerWithStore = await Promise.all(
      managers.map(async (m) => {
        const store = await storeModel.findOne({ storeId: m.storeId });

        return {
          ...m.toObject(),
          storeName: store ? store.name : "Unknown Store",
          storeLocation: store ? store.storeLocation : "",
        };
      })
    );

    return res.json({
      success: true,
      count: managerWithStore.length,
      managers: managerWithStore,
    });

  } catch (error) {
    console.log("Error in getAllManagers Controller:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const getManagerProfile = async (req, res) => {
  try {
    const manager = req.manager;
    const store = req.store;

    return res.json({ success: true, manager, store });
  } catch (error) {
    console.log("Error in getManagerProfile Controller:", error);
    return res.json({ success: false, message: error.message });
  }
}

// Get Managers of a Particular Store --> For Managers
export const getParticularStoreManagers = async (req, res) => {
  try {
    const storeId = req.store.storeId;

    const managers = await managerModel
      .find({ storeId })
      .select("-password -__v")
      .lean();

    const store = await storeModel
      .findOne({ storeId }) 
      .lean();

    const managersWithStore = managers.map((m) => ({
      ...m,
      storeName: store?.name || "Unknown Store",
      storeLocation: store?.storeLocation || "N/A",
    }));

    return res.json({
      success: true,
      count: managersWithStore.length,
      managers: managersWithStore,
    });

  } catch (error) {
    console.log("Error in getParticularStoreManagers:", error);
    return res.json({ success: false, message: error.message });
  }
};
