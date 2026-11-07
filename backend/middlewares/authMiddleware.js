import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import blackListTokenModel from "../models/blackListTokenModel.js";
dotenv.config();

// Middleware for authentication --
const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies) {
      token = req.cookies.adminToken || req.cookies.vendorToken;
    }

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token is missing",
      });
    }

    const isBlacklisted = await blackListTokenModel.findOne({ token });

    if (isBlacklisted) {
      return res.status(401).json({success: false, message: "Token has been blacklisted. Please login again."});
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    req.user = decoded;
    
    return next(); 
  } catch (error) {
    console.error("APK Security Guard Exception:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired, please login again" 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

export default authMiddleware;