import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Admin Middleware to verify Admin role --
const adminMiddleware = (req, res, next) => {
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

    if (decoded.role === 'admin') {
      req.user = decoded; 
      return next(); 
    }

    return res.status(403).json({ 
      success: false, 
      message: "Access denied: Admins only" 
    });

  } catch (error) {
    console.error("Authentication error in adminMiddleware:", error.message);
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

export default adminMiddleware;



// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// dotenv.config();

// // Admin MIddlware to verify Admin role --
// const adminMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ 
//         success: false, 
//         message: "Unauthorized: Token missing" 
//       });
//     }

//     const token = authHeader.split(" ")[1];
    
//     // Decode the token validation payload
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

 
//     if (decoded.role === 'admin') {
//       req.user = decoded; 
//       return next();
//     }

//     return res.status(403).json({ 
//       success: false, 
//       message: "Access denied: Admins only" 
//     });

//   } catch (error) {
//     console.error("Authentication error in adminMiddleware:", error.message);
//     return res.status(401).json({ 
//       success: false, 
//       message: "Invalid or expired token" 
//     });
//   }
// };

// export default adminMiddleware;
