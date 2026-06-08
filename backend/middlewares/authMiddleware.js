import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Middleware for authentication --
const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    if (req.cookies) {
      token = req.cookies.adminToken || req.cookies.vendorToken;
    }

    // Fallback: If no cookie found, try to get it from the Authorization Header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // If token is completely missing from BOTH places
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    //  Attach decoded payload to req.user (e.g., req.user.id, req.user.role)
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


// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();

// // Middleware for App authentication --
// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: Bearer token format required",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized: Token value is missing",
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET); 

//     req.user = decoded;
    
//     return next(); 
//   } catch (error) {
//     console.error("APK Security Guard Exception:", error.message);
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ 
//         success: false, 
//         message: "Session expired, please login again" 
//       });
//     }
//     return res.status(401).json({ 
//       success: false, 
//       message: "Invalid or expired token" 
//     });
//   }
// };

// export default authMiddleware;
