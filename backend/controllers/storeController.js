import storeModel from "../models/storeModel.js";
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