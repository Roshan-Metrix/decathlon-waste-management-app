// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// dotenv.config();

// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = decoded;
//     next();

//   } catch (error) {
//     console.log("Error in authMiddleware : ", error);
//     return res.status(401).json({ success: false, message: "Invalid or expired token" });
//   }
// };

// export default authMiddleware;

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

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
