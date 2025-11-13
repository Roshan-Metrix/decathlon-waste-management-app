import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const vendorRegister = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    // Ensure role is vendor
    if (role.toLowerCase() !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Only vendors can register through this route.",
      });
    }

    // Check if vendor already exists
    const existingVendor = await userModel.findOne({ email });
    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: "Vendor with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vendor
    const newVendor = new userModel({
      name,
      email,
      password: hashedPassword,
      role: "vendor",
      isApproved: false,
    });

    await newVendor.save();

    // Generate token (optional, for instant login)
    const token = jwt.sign(
      { id: newVendor._id, role: newVendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie (optional: only if you want auto login after register)
    res.cookie("vendorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully. Awaiting admin approval.",
      vendor: {
        id: newVendor._id,
        name: newVendor.name,
        email: newVendor.email,
        role: newVendor.role,
        isApproved: newVendor.isApproved,
      },
    });
  } catch (error) {
    console.error("Vendor Registration Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};


export const vendorLogin = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password ) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    // if (role.toLowerCase() !== "vendor") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied. Only vendors can use this route.",
    //   });
    // }

    // Check if vendor exists
    const vendor = await userModel.findOne({ email, role: "vendor" });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });
    }

    // Check approval
    if (!vendor.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Vendor account not approved yet.",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: vendor._id, role: vendor.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie for vendor
    res.cookie("vendorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response
    return res.status(200).json({
      success: true,
      message: "Vendor login successful.",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
      },
    });
  } catch (error) {
    console.error("Vendor Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const logoutVendor = async (req, res) => {
  try {
    res.clearCookie("vendorToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({ success: true, message: "Vendor logged out successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getVendorLoggedInDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password -__v");

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
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
