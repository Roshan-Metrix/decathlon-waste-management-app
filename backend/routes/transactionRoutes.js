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
  TransactionInvoiceController,
  TransactionItemsController,
  TransactionStoreSummaryController,
  TransactionSummaryController,
} from "../controllers/transactionController.js";
import multer from "multer";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import { getStoreTotalWeightsByDates, getStoreWithTotalTransactionsDetails } from "../controllers/storeController.js";
import { uploadLimiter } from "../middlewares/rateLimiter.js";

const transactionRouter = express.Router();

// store file in memory (Buffer)
const upload = multer({ storage: multer.memoryStorage() });

// For App transaction routes

transactionRouter.get("/", (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Transaction Endpoint Running...' });
});

transactionRouter.post(
  "/add-transaction",
  authMiddleware,
  AddTransactionDetailController,
);

// Material add controller
transactionRouter.post(
  "/transaction-items/:transactionId",
  upload.single("image"),
  authMiddleware,
  TransactionItemsController,
);

// OCR recognition with Gemini
transactionRouter.post(
  "/transaction-calibration/ocr",
  authMiddleware,
  uploadLimiter,
  upload.single("image"),
  recognizeWithGeminiController,
);

transactionRouter.post(
  "/transaction-calibration/:transactionId",
  authMiddleware,
  uploadLimiter,
  upload.single("image"),
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

// Get store details and total transaction summary
transactionRouter.get(
  "/get-stores-total-transactions",
  adminMiddleware,
  getStoreWithTotalTransactionsDetails,
);

// Get all transactions date (from - to) for individual store
transactionRouter.get(
  "/get-store-filter-transactions/:storeId/:from/:to",
  adminMiddleware,
  getStoreTotalWeightsByDates,
);

transactionRouter.get(
  "/transaction-summary",
  adminMiddleware,
  TransactionSummaryController
)

// Transaction Invoice Controller
transactionRouter.get(
  "/transaction-invoice",
  adminMiddleware,
  TransactionInvoiceController
)

// Transaction Summary Controller by StoreId
transactionRouter.get(
  "/transaction-store-summary",
  adminMiddleware,
  TransactionStoreSummaryController
)

export default transactionRouter;
