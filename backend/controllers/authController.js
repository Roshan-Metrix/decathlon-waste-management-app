import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  ADMIN_ADDED_TEMPLATE,
  MANAGER_ADDED_TEMPLATE,
  PASSWORD_RESET_SUCCESSFULLY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
  STORE_ADDED_TEMPLATE,
} from "../config/emailTemplates.js";
import transporter from "../config/nodemailer.js";
import adminModel from "../models/adminModel.js";
import storeModel from "../models/storeModel.js";
import managerModel from "../models/managerModel.js";
import vendorModel from "../models/vendorModel.js";
import dotenv from "dotenv";
dotenv.config();

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  const createdBy = req.user.id;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  const PasswordSavedToSendEmail = password;

  try {
    const existingUser = await adminModel.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new adminModel({
      name,
      email,
      password: hashedPassword,
      isApproved: true,
      createdBy,
    });

    await admin.save();

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        isApproved: admin.isApproved,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15d" },
    );

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome To Decathlon",
      html: ADMIN_ADDED_TEMPLATE.replace("{{email}}", email).replace(
        "{{password}}",
        PasswordSavedToSendEmail,
      ),
    };

    const mailResult = await transporter.sendMail(mailOption);

    return res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isApproved: admin.isApproved,
      },
      message:
        mailResult.accepted.length > 0
          ? "Registration successful, email sent"
          : "Registration successful, email not sent",
    });
  } catch (error) {
    console.log("Error in registerAdmin Controller : ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const registerStore = async (req, res) => {
  const {
    storeId,
    name,
    storeLocation,
    states,
    contactNumber,
    email,
    password,
  } = req.body;
  const createdBy = req.user.id;

  if (
    !storeId ||
    !name ||
    !storeLocation ||
    !states ||
    !contactNumber ||
    !email ||
    !password
  ) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const existingStore = await storeModel.findOne({ storeId });

    if (existingStore) {
      return res.json({ success: false, message: "Store already exists" });
    }

    const PasswordSavedToSendEmail = password;

    const hashedPassword = await bcrypt.hash(password, 10);

    const store = new storeModel({
      storeId,
      name,
      storeLocation,
      states,
      contactNumber,
      email,
      password: hashedPassword,
      isApproved: true,
      createdBy,
    });

    await store.save();

    const token = jwt.sign(
      {
        id: store._id,
        role: store.role,
        isApproved: store.isApproved,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15d" },
    );

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome To Decathlon",
      html: STORE_ADDED_TEMPLATE.replace("{{email}}", email).replace(
        "{{password}}",
        PasswordSavedToSendEmail,
      ),
    };

    const mailResult = await transporter.sendMail(mailOption);

    return res.json({
      success: true,
      token,
      user: {
        id: store._id,
        storeId: store.storeId,
        name: store.name,
        email: store.email,
        contactNumber: store.contactNumber,
        role: store.role,
        isApproved: store.isApproved,
        storeLocation: store.storeLocation,
        states: store.states,
      },
      message:
        mailResult.accepted.length > 0
          ? "Registration successful, email sent"
          : "Registration successful, email not sent",
    });
  } catch (error) {
    console.log("Error in registerStore Controller : ", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

export const registerManager = async (req, res) => {
  const { storeId, name, email, password } = req.body;
  const createdBy = req.user.id;

  if ((!storeId, !name, !email, !password)) {
    return res.json({ success: false, message: "Missing details" });
  }

  const PasswordSavedToSendEmail = password;

  try {
    const existingManager = await managerModel.findOne({ email });
    const existingStore = await storeModel.findOne({ storeId });

    if (existingManager) {
      return res.json({ success: false, message: "Manager already exists" });
    }

    if (!existingStore) {
      return res.json({
        success: false,
        message: "Store not exists , First Add store",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = new managerModel({
      storeId,
      name,
      email,
      password: hashedPassword,
      isApproved: true,
      createdBy,
    });

    await manager.save();

    const token = jwt.sign(
      {
        id: manager._id,
        role: manager.role,
        isApproved: manager.isApproved,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15d" },
    );

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome To Decathlon",
      html: MANAGER_ADDED_TEMPLATE.replace("{{email}}", email).replace(
        "{{password}}",
        PasswordSavedToSendEmail,
      ),
    };

    res.json({
      success: true,
      token,
      user: {
        id: manager._id,
        storeId: manager.storeId,
        name: manager.name,
        email: manager.email,
        role: manager.role,
        isApproved: manager.isApproved,
      },
      message: "Registration successful",
    });

    // Send email in background
    transporter.sendMail(mailOption)
      .then((result) => {
        console.log("Email sent:", result.accepted);
      })
      .catch((err) => {
        console.error("Email failed:", err);
      });
  } catch (error) {
    console.log("Error in registerManager Controller : ", error);
    return res.json({ success: false, message: "Internal Server Error" });
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
    let user = null;

    // Check Admin
    user = await adminModel.findOne({ email });

    // Check Store
    if (!user) {
      user = await storeModel.findOne({ email });
    }

    // Check Manager
    if (!user) {
      user = await managerModel.findOne({ email });
    }

    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // Approval check
    if (!user.isApproved) {
      return res.json({
        success: false,
        message: "Access denied!",
      });
    }

    // Create token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        isApproved: user.isApproved,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15d" },
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
    console.log("Error in loginUser Controller:", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Error in logoutUser Controller : ", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

export const restrictAnyAdminAccess = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin Id is required",
      });
    }

    const admin = await adminModel.findById(adminId).select("-password -__v");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.isApproved) {
      admin.isApproved = false;
    } else {
      admin.isApproved = true;
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin access restricted successfully!",
    });
  } catch (error) {
    console.log("Error in restrictAnyAdminAccess Controller : ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getLoggedInUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    let user = null;

    // Check Admin
    user = await adminModel.findById(userId).select("-password -__v");

    // Check Store
    if (!user) {
      user = await storeModel.findById(userId).select("-password -__v");
    }

    // Check Manager
    if (!user) {
      user = await managerModel.findById(userId).select("-password -__v");
    }

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
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
    console.log("Error in getLoggedInUsesDetails Controller : ", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.json({ success: false, message: "Email is Required" });

  try {
    let user = null;

    // Check Admin
    user = await adminModel.findOne({ email });

    // Check Store
    if (!user) {
      user = await storeModel.findOne({ email });
    }

    // Check Manager
    if (!user) {
      user = await managerModel.findOne({ email });
    }

    // Check Vendor
    if (!user) {
      user = await vendorModel.findOne({ email });
    }

    if (!user) return res.json({ success: false, message: "User Not Found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 20 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email,
      ),
    };

    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error) {
    console.log("Error in sendPasswordResetOtp Controller : ", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email) return res.json({ success: false, message: "Email is required" });

  if (!otp) return res.json({ success: false, message: "OTP is required" });

  if (!newPassword)
    return res.json({ success: false, message: "Password is required" });

  try {
    let user = null;

    // Check Admin
    user = await adminModel.findOne({ email });

    // Check Store
    if (!user) {
      user = await storeModel.findOne({ email });
    }

    // Check Manager
    if (!user) {
      user = await managerModel.findOne({ email });
    }

    // Check Vendor
    if (!user) {
      user = await vendorModel.findOne({ email });
    }

    if (!user) return res.json({ success: false, message: "User Not Found" });

    if (user.resetOtp === "" || user.resetOtp !== otp)
      return res.json({ success: false, message: "Invalid OTP" });

    if (user.resetOtpExpireAt < Date.now())
      return res.json({
        success: false,
        message: "OTP expired, request again",
      });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset Successfully",
      text: `Your Password for ${email} is reset successfully.`,
      html: PASSWORD_RESET_SUCCESSFULLY_TEMPLATE.replace(
        "{{email}}",
        user.email,
      ),
    };

    await transporter.sendMail(mailOption);

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error in resetPassword Controller : ", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

export const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.json({ success: false, message: "Missing details" });
  }
  try {
    let user = null;

    // Check Admin
    user = await adminModel.findOne({ _id: userId });

    // Check Store
    if (!user) {
      user = await storeModel.findOne({ _id: userId });
    }

    // Check Manager
    if (!user) {
      user = await managerModel.findOne({ _id: userId });
    }

    // Check Vendor
    if (!user) {
      user = await vendorModel.findOne({ _id: userId });
    }

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Old password not match" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("Error in changePassword Controller : ", error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};
