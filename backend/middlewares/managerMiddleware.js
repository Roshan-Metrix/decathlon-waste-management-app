import managerModel from "../models/managerModel.js";
import storeModel from "../models/storeModel.js";
import jwt from "jsonwebtoken";

// Manager Middleware to verify Manager --
const managerMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies) {
      token = req.cookies.adminToken;
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
        message: "Unauthorized: Access token missing" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "manager") {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Access denied" 
      });
    }

    const manager = await managerModel
      .findById(decoded.id)
      .select("name email storeId role isApproved")
      .lean();

    if (!manager) {
      return res.status(404).json({ 
        success: false, 
        message: "Manager profile not found" 
      });
    }

    const store = await storeModel
      .findOne({ storeId: manager.storeId })
      .select("storeId name storeLocation state email contactNumber")
      .lean();

    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: "Store not found for manager" 
      });
    }

    req.user = decoded; 
    req.store = store;
    req.manager = manager;

    return next();

  } catch (error) {
    console.error("Error in managerMiddleware:", error.message);
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

export default managerMiddleware;



// import managerModel from "../models/managerModel.js";
// import storeModel from "../models/storeModel.js";
// import jwt from "jsonwebtoken";

// // Manager Middleware to verify Manager --
// const managerMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (decoded.role !== "manager") {
//       return res.status(403).json({ success: false, message: "Forbidden Access" });
//     }

//     const manager = await managerModel
//       .findById(decoded.id)
//       .select("name email storeId role isApproved")
//       .lean();

//     if (!manager) {
//       return res.status(404).json({ success: false, message: "Manager profile not found" });
//     }

//     const store = await storeModel
//       .findOne({ storeId: manager.storeId })
//       .select("storeId name storeLocation state email contactNumber")
//       .lean();

//     if (!store) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Store not found for manager" });
//     }

//     req.user = decoded; 
//     req.store = store;
//     req.manager = manager;

//     return next();

//   } catch (error) {
//     console.error("Error in managerMiddleware:", error.message);
//     return res
//       .status(401)
//       .json({ success: false, message: "Invalid or expired token" });
//   }
// };

// export default managerMiddleware;

