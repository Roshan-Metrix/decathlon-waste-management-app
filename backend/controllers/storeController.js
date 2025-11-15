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
    return res.json({ success: false, message: error.message });
  }
};