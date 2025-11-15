import managerModel from "../models/adminModel.js";

export const getAllManagers = async (req, res) => {
  try {
    const admins = await managerModel
      .find({ role: "manager" })
      .select("-password -__v");

    return res.json({
      success: true,
      count: admins.length,
      admins,
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};