import storeModel from "../models/storeModel.js";

export const getAllStores = async (req, res) => {
  try {
    const stores = await storeModel.find().select("-password -__v");

    return res.json({
      success: true,
      count: stores.length,
      stores,
    });

  } catch (error) {
    console.log("Error in getAllStores Controller : ",error)
    return res.json({ success: false, message: error.message });
  }
};

export const deleteStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return res.json({
        success: false,
        message: "Store ID is required"
      });
    }

    const store = await storeModel.findOne({ storeId });

    if (!store) {
      return res.json({
        success: false,
        message: "Store not found"
      });
    }

    const result = await storeModel.deleteOne({ storeId });

    return res.json({
      success: true,
      message: "Store removed successfully",
      deletedStoreID: storeId
    });

  } catch (error) {
    console.log("Error in deleteStore Controller : ",error)
    return res.json({ success: false, message: error.message });
  }
};
