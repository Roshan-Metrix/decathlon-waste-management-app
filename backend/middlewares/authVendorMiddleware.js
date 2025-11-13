import jwt from "jsonwebtoken";

const authVendorMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.vendorToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized, please login again." });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken.id) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired token." });
    }

    req.user = { id: decodedToken.id };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
      error: error.message,
    });
  }
};

export default authVendorMiddleware;