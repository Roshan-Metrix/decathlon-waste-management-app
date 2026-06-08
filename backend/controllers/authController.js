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

// Admin Registration --
export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  const createdBy = req.user?.id;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await adminModel.findOne({ email }).select("_id").lean();

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
      { expiresIn: "15d" }
    );

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome To Decathlon",
      html: ADMIN_ADDED_TEMPLATE.replace("{{email}}", email).replace(
        "{{password}}",
        password
      ),
    };

    // Keep email processing asynchronous to prevent delaying the client response
    transporter.sendMail(mailOption)
      .then((result) => {
        console.log("Email sent successfully:", result.accepted);
      })
      .catch((err) => {
        console.error("Background transactional email failed:", err);
      });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isApproved: admin.isApproved,
      },
      message: "Admin Registration successful",
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    console.error("Error in registerAdmin Controller:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Store Registration --
export const registerStore = async (req, res) => {
  const {
    storeId,
    name,
    storeLocation,
    state,
    contactNumber,
    email,
    password,
  } = req.body;
  const createdBy = req.user?.id;

  if (
    !storeId ||
    !name ||
    !storeLocation ||
    !state ||
    !contactNumber ||
    !email ||
    !password
  ) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const existingStore = await storeModel.findOne({ storeId }).select("_id").lean();

    if (existingStore) {
      return res
        .status(400)
        .json({ success: false, message: "Store already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const store = new storeModel({
      storeId,
      name,
      storeLocation,
      state,
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
      { expiresIn: "15d" }
    );

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome To Decathlon",
      html: STORE_ADDED_TEMPLATE.replace("{{email}}", email).replace(
        "{{password}}",
        password
      ),
    };

    transporter.sendMail(mailOption)
      .then((result) => {
        console.log("Email sent successfully:", result.accepted);
      })
      .catch((err) => {
        console.error("Background store email failed:", err);
      });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: store._id,
        storeId: store.storeId,
        name: store.name,
        email: store.email,
        state: store.state,
        contactNumber: store.contactNumber,
        role: store.role,
        isApproved: store.isApproved,
        storeLocation: store.storeLocation,
      },
      message: "Store Registration successful",
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Store already exists",
      });
    }

    console.error("Error in registerStore Controller:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Manager Registration --
export const registerManager = async (req, res) => {
  const { storeId, name, email, password } = req.body;
  const createdBy = req.user?.id;

  if (!storeId || !name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const [existingManager, existingStore] = await Promise.all([
      managerModel.findOne({ email }).select("_id").lean(),
      storeModel.findOne({ storeId }).select("_id").lean()
    ]);

    if (existingManager) {
      return res
        .status(400)
        .json({ success: false, message: "Manager already exists" });
    }

    if (!existingStore) {
      return res.status(404).json({
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
      { expiresIn: "15d" }
    );

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome To Decathlon",
      html: MANAGER_ADDED_TEMPLATE.replace("{{email}}", email).replace(
        "{{password}}",
        password
      ),
    };

    transporter.sendMail(mailOption)
      .then((result) => {
        console.log("Email sent successfully:", result.accepted);
      })
      .catch((err) => {
        console.error("Background manager email failed:", err);
      });

    return res.status(201).json({
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

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Manager already exists",
      });
    }

    console.error("Error in registerManager Controller:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Login --
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and Password are required",
    });
  }

  try {
    const [adminDoc, storeDoc, managerDoc] = await Promise.all([
      adminModel.findOne({ email }).select("name email password role isApproved").lean(),
      storeModel.findOne({ email }).select("name email password role isApproved storeId").lean(),
      managerModel.findOne({ email }).select("name email password role isApproved storeId").lean(),
    ]);

    const user = adminDoc || storeDoc || managerDoc;

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Access denied!",
      });
    }

    let resolvedState = [];
    if ((user.role === "manager" || user.role === "store") && user.storeId) {
      const storeState = await storeModel
        .findOne({ storeId: user.storeId })
        .select("state")
        .lean();
      
      resolvedState = storeState?.state || [];
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        isApproved: user.isApproved,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

        // Set cookie state securely
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        state: resolvedState,
        isApproved: user.isApproved,
      },
    });

  } catch (error) {
    console.error("Error in loginUser Controller:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Logout --
export const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logoutUser Controller: ", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

// Restrict Access For Any Admin --
export const restrictAnyAdminAccess = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin Id is required",
      });
    }

    const updatedAdmin = await adminModel.findByIdAndUpdate(
      adminId,
      [
        {
          $set: {
            isApproved: { $not: "$isApproved" }
          }
        }
      ],
      { new: true, select: "isApproved" }
    ).lean();

    // Guard clause if the ID doesn't match any record
    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const statusMessage = updatedAdmin.isApproved 
      ? "Admin access granted successfully!" 
      : "Admin access restricted successfully!";

    return res.status(200).json({
      success: true,
      message: statusMessage,
    });

  } catch (error) {
    console.error("Error in restrictAnyAdminAccess Controller:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

// Get Logged In User Details --
export const getLoggedInUserDetails = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing account identifier",
      });
    }

    const [adminDoc, storeDoc, managerDoc] = await Promise.all([
      adminModel.findById(userId).select("name email role isApproved createdAt updatedAt").lean(),
      storeModel.findById(userId).select("name email role isApproved createdAt updatedAt").lean(),
      managerModel.findById(userId).select("name email role isApproved createdAt updatedAt").lean(),
    ]);

    const user = adminDoc || storeDoc || managerDoc;

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User Not Found" 
      });
    }

    return res.status(200).json({
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
    console.error("Error in getLoggedInUserDetails Controller:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};

// Forgot Password --
export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is Required" });
  }

  try {
  
    const [adminDoc, storeDoc, managerDoc, vendorDoc] = await Promise.all([
      adminModel.findOne({ email }).select("email role").lean(),
      storeModel.findOne({ email }).select("email role").lean(),
      managerModel.findOne({ email }).select("email role").lean(),
      vendorModel.findOne({ email }).select("email role").lean(),
    ]);

    // Pinpoint exactly which model collection holds the active account record
    let user = adminDoc || storeDoc || managerDoc || vendorDoc;
    let targetModel = null;

    if (adminDoc) targetModel = adminModel;
    else if (storeDoc) targetModel = storeModel;
    else if (managerDoc) targetModel = managerModel;
    else if (vendorDoc) targetModel = vendorModel;

    if (!user || !targetModel) {
      return res.status(404).json({ success: false, message: "User Not Found" });
    }

    // Generate a secure 6-digit numeric token string
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes life window

    await targetModel.updateOne(
      { _id: user._id },
      {
        $set: {
          resetOtp: otp,
          resetOtpExpireAt: otpExpireAt,
        },
      }
    );

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    transporter.sendMail(mailOption)
      .then((result) => {
        console.log("Password reset OTP email sent:", result.accepted);
      })
      .catch((err) => {
        console.error("Background password reset email failed to process:", err);
      });

    return res.status(200).json({ 
      success: true, 
      message: "Reset OTP sent successfully" 
    });

  } catch (error) {
    console.error("Error in sendPasswordResetOtp Controller: ", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Reset Password --
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email is required" });
  if (!otp) return res.status(400).json({ success: false, message: "OTP is required" });
  if (!newPassword) return res.status(400).json({ success: false, message: "Password is required" });

  try {
    const [adminDoc, storeDoc, managerDoc, vendorDoc] = await Promise.all([
      adminModel.findOne({ email }).select("email resetOtp resetOtpExpireAt").lean(),
      storeModel.findOne({ email }).select("email resetOtp resetOtpExpireAt").lean(),
      managerModel.findOne({ email }).select("email resetOtp resetOtpExpireAt").lean(),
      vendorModel.findOne({ email }).select("email resetOtp resetOtpExpireAt").lean(),
    ]);

    // Track the active user object and assign its matching database model execution link
    let user = adminDoc || storeDoc || managerDoc || vendorDoc;
    let targetModel = null;

    if (adminDoc) targetModel = adminModel;
    else if (storeDoc) targetModel = storeModel;
    else if (managerDoc) targetModel = managerModel;
    else if (vendorDoc) targetModel = vendorModel;

    if (!user || !targetModel) {
      return res.status(404).json({ success: false, message: "User Not Found" });
    }

    // OTP Token Boundary Validations
    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired, request again",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await targetModel.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetOtp: "",
          resetOtpExpireAt: 0,
        },
      }
    );

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset Successfully",
      text: `Your Password for ${email} is reset successfully.`,
      html: PASSWORD_RESET_SUCCESSFULLY_TEMPLATE.replace("{{email}}", user.email),
    };

    transporter.sendMail(mailOption)
      .then((result) => {
        console.log("Password reset confirmation email sent:", result.accepted);
      })
      .catch((err) => {
        console.error("Background confirmation email failed:", err);
      });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Error in resetPassword Controller:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Change Password --
export const changePassword = async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role; 
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    let user = null;
    let targetModel = null;

    if (userRole) {
      if (userRole === "admin") targetModel = adminModel;
      else if (userRole === "store") targetModel = storeModel;
      else if (userRole === "manager") targetModel = managerModel;
      else if (userRole === "vendor") targetModel = vendorModel;

      if (targetModel) {
        user = await targetModel.findById(userId).select("password").lean();
      }
    }

    //  Fallback Optimization: If role isn't in JWT, query all 4 concurrently in parallel
    if (!user) {
      const [adminDoc, storeDoc, managerDoc, vendorDoc] = await Promise.all([
        adminModel.findById(userId).select("password").lean(),
        storeModel.findById(userId).select("password").lean(),
        managerModel.findById(userId).select("password").lean(),
        vendorModel.findById(userId).select("password").lean(),
      ]);

      user = adminDoc || storeDoc || managerDoc || vendorDoc;
      
      if (adminDoc) targetModel = adminModel;
      else if (storeDoc) targetModel = storeModel;
      else if (managerDoc) targetModel = managerModel;
      else if (vendorDoc) targetModel = vendorModel;
    }

    if (!user || !targetModel) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify the old password against the database hash
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password not match" });
    }

    // Hash the new password credentials
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Apply mutations directly to disk via primary key lookup
    await targetModel.updateOne(
      { _id: userId },
      {
        $set: { password: hashedPassword },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    console.error("Error in changePassword Controller:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
