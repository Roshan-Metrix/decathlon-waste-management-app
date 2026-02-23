import adminModel from "../models/adminModel.js";

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminModel.find().select("-password -__v");

    return res.json({
      success: true,
      count: admins.length,
      admins,
    });

  } catch (error) {
    console.log("Error in getAllAdmins : ", error)
    return res.json({ success: false, message: "Internal Server Error" });
  }
};


