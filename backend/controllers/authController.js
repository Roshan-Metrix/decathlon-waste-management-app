import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/adminModel.js";
import {
  PASSWORD_RESET_SUCCESSFULLY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";
import transporter from "../config/nodemailer.js";
import adminModel from "../models/adminModel.js";
import storeModel from "../models/storeModel.js";
import managerModel from "../models/managerModel.js";
import dotenv from 'dotenv'
dotenv.config();

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password ) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await adminModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new userModel({
      name,
      email,
      password: hashedPassword,
      isApproved: true,
    });

    await admin.save();

    const token = jwt.sign(
      { 
        id: admin._id, 
        role: admin.role, 
        isApproved: admin.isApproved 
    },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

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
      message: "Registration successful",
    });
  } catch (error) {
    console.log("Error in registerAdmin Controller : ",error);
    return res.json({ success: false, message: error.message });
  }
};

export const registerStore = async (req, res) => {
  const { storeId , name, storeLocation, contactNumber, email, password } = req.body;

  if (!storeId || !name || !storeLocation || !contactNumber || !email || !password ) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const existingStore = await storeModel.findOne({ storeId });

    if (existingStore) {
      return res.json({ success: false, message: "Store already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const store = new storeModel({
      storeId , 
      name,
      storeLocation, 
      contactNumber, 
      email,
      password : hashedPassword,
      isApproved : true
    });

    await store.save();

    const token = jwt.sign(
      { 
        id: store._id, 
        role: store.role, 
        isApproved: store.isApproved 
    },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: store._id,
        storeId: store.storeId,  
        name: store.name,
        email: store.email,
        contactNumber:store.contactNumber,
        role: store.role,
        isApproved: store.isApproved,
        storeLocation:store.storeLocation
      },
      message: "Registration successful",
    });
  } catch (error) {
    console.log("Error in registerStore Controller : ",error);
    return res.json({ success: false, message: error.message });
  }
};

export const registerManager = async (req, res) => {
  const { storeId , name, email, password } = req.body;

  if (!storeId , !name, !email, !password ) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const existingManager = await managerModel.findOne({ email });
    const existingStore = await storeModel.findOne({ storeId })

    if (existingManager) {
      return res.json({ success: false, message: "Manager already exists" });
    }

    if (!existingStore) {
      return res.json({ success: false, message: "Store not exists , First Add store" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = new managerModel({
      storeId , 
      name, 
      email, 
      password : hashedPassword,
      isApproved : true
    });

    await manager.save();

    const token = jwt.sign(
      { 
        id: manager._id, 
        role: manager.role, 
        isApproved: manager.isApproved 
    },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    return res.json({
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
    console.log("Error in registerManager Controller : ",error);
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
    let user = await userModel.findOne({ email });

    if (!user) {
       user =  await storeModel.findOne({email});
    }

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
    console.log("Error in loginUser Controller : ",error);
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
    console.log("Error in logoutUser Controller : ",error);
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
    console.log("Error in getLoggedInUsesDetails Controller : ",error);
    return res.json({ success: false, message: error.message });
  }
};

export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.json({ success: false, message: "Email is Required" });

  try {
    const user = await userModel.findOne({ email });

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
        user.email
      ),
    };

    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error) {
    console.log("Error in sendPasswordResetOtp Controller : ",error);
    return res.json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email) return res.json({ success: false, message: "Email is required" });

  if (!otp) return res.json({ success: false, message: "OTP is required" });

  if (!newPassword)
    return res.json({ success: false, message: "Password is required" });

  try {
    const user = await userModel.findOne({ email });

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
        user.email
      ),
    };

    await transporter.sendMail(mailOption);

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.log("Error in resetPassword Controller : ",error);
    return res.json({ success: false, message: error.message });
  }
};
