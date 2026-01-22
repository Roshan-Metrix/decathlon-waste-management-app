import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  AddTransactionDetailController,
  AllTransactionsController,
  ParticularTransactionController,
  recognizeWithGeminiController,
  StoreTotalTransactionController,
  TransactionCalibrationController,
  TransactionItemsController,
} from "../controllers/transactionController.js";
import multer from "multer";

const transactionRouter = express.Router();

// store file in memory (Buffer)
const upload = multer({ storage: multer.memoryStorage() });

transactionRouter.get("/", (req, res) => {
  res.send("Transaction API Endpoint Running...");
});

transactionRouter.post(
  "/add-transaction",
  authMiddleware,
  AddTransactionDetailController,
);

transactionRouter.post(
  "/transaction-items/:transactionId",
  authMiddleware,
  TransactionItemsController,
);

transactionRouter.post(
  "/transaction-calibration/ocr",
  upload.single("image"),
  authMiddleware,
  recognizeWithGeminiController,
);

transactionRouter.post(
  "/transaction-calibration/:transactionId",
  authMiddleware,
  TransactionCalibrationController,
);

transactionRouter.get(
  "/todays-transactions/:transactionId",
  authMiddleware,
  ParticularTransactionController,
);

transactionRouter.get(
  "/store-total-transactions/:storeId",
  authMiddleware,
  StoreTotalTransactionController,
);

transactionRouter.get(
  "/all-transactions",
  authMiddleware,
  AllTransactionsController,
);

export default transactionRouter;
