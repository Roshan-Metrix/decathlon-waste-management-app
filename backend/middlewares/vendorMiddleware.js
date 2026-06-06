import jwt from "jsonwebtoken";

// Vendor Middleware to verify vendor --
const vendorMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.vendorToken;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Not Authorized, please login again." 
      });
    }

    // Decode the payload signatures
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Invalid or expired token." 
      });
    }

    req.user = { 
      id: decodedToken.id,
      role: decodedToken.role || "vendor"
    };

    return next();
  } catch (error) {
    console.error("Web Vendor Security Exception: ", error.message);

    // Standardize token expiration checks cleanly
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log back in.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

export default vendorMiddleware;

// import jwt from "jsonwebtoken";

// const vendorMiddleware = async (req, res, next) => {
//   try {
//     const token = req.cookies.vendorToken;

//     if (!token) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Not Authorized, please login again." });
//     }

//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decodedToken.id) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Invalid or expired token." });
//     }

//     req.user = { id: decodedToken.id };

//     next();
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Authentication failed.",
//       error: error.message,
//     });
//   }
// };

// export default vendorMiddleware;