import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js';
import { AddTransactionDetailController, AllTransactionsController, ParticularTransactionController, StoreTotalTransactionController, TransactionCalibrationController, TransactionItemsController } from '../controllers/transactionController.js';
import vendorMiddleware from '../middlewares/vendorMiddleware.js';

const transactionRouter = express.Router();

transactionRouter.get('/', (req, res) => {
    res.send('Transaction API Endpoint Running...');
});
transactionRouter.post('/add-transaction',authMiddleware, AddTransactionDetailController);
transactionRouter.post('/transaction-items/:transactionId',authMiddleware, TransactionItemsController);
transactionRouter.post('/transaction-calibration/:transactionId', authMiddleware, TransactionCalibrationController);
transactionRouter.get('/todays-transactions/:transactionId', authMiddleware, ParticularTransactionController);
transactionRouter.get('/store-total-transactions/:storeId', authMiddleware, StoreTotalTransactionController);
transactionRouter.get('/all-transactions', authMiddleware, AllTransactionsController);


export default transactionRouter;