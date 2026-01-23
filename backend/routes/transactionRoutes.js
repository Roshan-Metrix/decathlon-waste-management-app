import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  AddTransactionDetailController,
  AllTransactionsController,
  ParticularTransactionController,
  recognizeWithGeminiController,
  SelectedTransactionItemsController,
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

// Material add controller
transactionRouter.post(
  "/transaction-items/:transactionId",
  authMiddleware,
  TransactionItemsController,
);

// OCR recognition with Gemini
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
  "/selected-transactions-items/:transactionId",
  authMiddleware,
  SelectedTransactionItemsController,
);

transactionRouter.get(
  "/all-transactions",
  authMiddleware,
  AllTransactionsController,
);

export default transactionRouter;
