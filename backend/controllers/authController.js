import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved: false,
    });

    await user.save();

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        isApproved: user.isApproved 
    },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
      message: "Registration successful. Waiting for approval.",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and Password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    if (!user.isApproved) {
      return res.json({ success: false, message: "Account not approved yet" });
    }

    const token = jwt.sign(
      { id: user._id, 
        role: user.role, 
        isApproved: user.isApproved },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getLoggedInUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel
      .findById(userId)
      .select("-password -__v");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
