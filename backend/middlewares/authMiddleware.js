import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Middleware for App authentication
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized: Bearer token format required",
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized: Token value is missing",
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    req.user = decoded;
    
    next();
  } catch (error) {
    console.log("Error in authMiddleware : ", error.message);
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: `Invalid token: ${error.message}` });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authMiddleware;


// console.log("Decoded JWT Payload in authMiddleware : ", decoded);
//   id: '692734417fdf781c24j34b',
//   role: 'admin',
//   isApproved: true,
//   iat: 1771818810,
//   exp: 1773114810
