import storeModel from "../models/storeModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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
      .json({ success: false, message: "Server error" });
  }
};


export const getAllStores = async (req, res) => {
  try {
    const stores = await storeModel.find().select("-password -__v");

    return res.json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch (error) {
    console.log("Error in getAllStores Controller : ", error);
    return res.json({ success: false, message: error.message });
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
    return res.json({ success: false, message: error.message });
  }
};
