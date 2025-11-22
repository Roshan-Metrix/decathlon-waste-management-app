import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js';
import { AddTransactionDetailController, AllStoreTodaysTransactionsController, TodaysTransactionController, TransactionCalibrationController, TransactionItemsController } from '../controllers/transactionController.js';

const transactionRouter = express.Router();

transactionRouter.get('/', (req, res) => {
    res.send('Transaction API Endpoint Running...');
});

transactionRouter.post('/add-transaction',authMiddleware, AddTransactionDetailController);
transactionRouter.post('/transaction-items/:transactionId',authMiddleware, TransactionItemsController);
transactionRouter.post('/transaction-calibration/:transactionId', authMiddleware, TransactionCalibrationController);
transactionRouter.get('/todays-transactions/:transactionId', authMiddleware, TodaysTransactionController);

// Not in use , but kept for reference or future use
transactionRouter.get('/all-store-todays-transactions', authMiddleware, AllStoreTodaysTransactionsController);


export default transactionRouter;