import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const adminMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    if(decoded.role == 'admin'){
    req.user = decoded;
    next();
    }

  } catch (error) {
    console.log("Error in adminMiddleware")
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminMiddleware;
