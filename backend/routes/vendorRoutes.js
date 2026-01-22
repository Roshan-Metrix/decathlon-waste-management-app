import express from 'express';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { AllTransactionsVendorController, getAllRelatedStores, getAllRelatedStoresTransactions, getAllVendors, getTotalWeightsByDates, getVendorLoggedInDetails, logoutVendor, vendorLogin, vendorRegister } from '../controllers/vendorController.js';
import vendorMiddleware from '../middlewares/vendorMiddleware.js';
import { ParticularTransactionController } from '../controllers/transactionController.js';

const vendorRouter = express.Router();

vendorRouter.get('/',(req,res) => {
    res.send("Vendor API Endpoint Running . . .")
});

// ---- Vendor Portal Routes ----
//vendor
vendorRouter.post('/register',adminMiddleware,vendorRegister);
vendorRouter.post('/login', vendorLogin);
vendorRouter.post('/logout', logoutVendor);
vendorRouter.get('/profile',vendorMiddleware,getVendorLoggedInDetails);
// Get total transaction of all store related to particular vendor
vendorRouter.get('/get-all-related-transactions',vendorMiddleware, AllTransactionsVendorController);
vendorRouter.get('/get-related-stores',vendorMiddleware,getAllRelatedStores);
vendorRouter.get('/get-all-vendors',getAllVendors);
vendorRouter.get('/particular-transactions/:transactionId',vendorMiddleware,ParticularTransactionController);
vendorRouter.get('/transactions-particular-store/:storeId', vendorMiddleware,getAllRelatedStoresTransactions);
// Get total transactions according to material type of a particular store
vendorRouter.get('/transactions-particular-store/:storeId/:from/:to', vendorMiddleware,getTotalWeightsByDates);

export default vendorRouter