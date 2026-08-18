import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});


export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many upload requests, please try again later."
    }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

export const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many transaction requests. Please try again later."
  }
});

export const vendorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});