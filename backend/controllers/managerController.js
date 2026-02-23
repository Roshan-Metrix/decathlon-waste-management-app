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
    return res.json({ success: false, message: "Internal Server Error" });
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

// Get Managers of a Particular Store --> For Managers
export const getParticularStoreManagers = async (req, res) => {
  try {
    
    const { storeId } = req.params;

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
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

// Delete Manager --> For Admin
export const deleteManager = async (req, res) => {
  try{
  const { managerId } = req.params;
  
  if(!managerId){
    res.status(400).json({
      success: false,
      message: "ManagerId is required",
    })
  }

  const manager = await managerModel.findById(managerId).select("-password -__v");

  if(!manager){
    return res.status(404).json({
      success: false,
      message: "Manager not found"
    })
  }
  
   await managerModel.deleteOne({ _id: managerId });

  return res.status(200).json({
    success: true,
    message: "Manager deleted successfully!"
  })
}catch(error){
  console.log("Error in deleteManager controller: ",error);
  return res.status(500).json({
    status: false,
    message:"Internal Server Error"
  });
}
};
