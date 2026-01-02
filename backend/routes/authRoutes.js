import express from 'express';
import {loginUser,logoutUser, getLoggedInUserDetails, sendPasswordResetOtp, resetPassword, registerAdmin, registerStore, registerManager, changePassword } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { AllTransactionsVendorController, getAllRelatedStores, getAllRelatedStoresTransactions, getAllVendors, getVendorLoggedInDetails, logoutVendor, vendorLogin, vendorRegister } from '../controllers/vendorController.js';
import { getAllAdmins } from '../controllers/adminController.js';
import { getAllManagers, getManagerProfile, getParticularStoreManagers } from '../controllers/managerController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { deleteStore, getAllStores, getStoreProfile } from '../controllers/storeController.js';
import managerMiddleware from '../middlewares/managerMiddleware.js';
import vendorMiddleware from '../middlewares/vendorMiddleware.js';
import { ParticularTransactionController } from '../controllers/transactionController.js';

const authRouter = express.Router();

authRouter.get('/', (req, res) => {
    res.send('Auth API Endpoint Running...');
});

//common routes
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.post('/send-reset-otp', sendPasswordResetOtp);
authRouter.post('/reset-password',resetPassword);
authRouter.get('/profile',authMiddleware,getLoggedInUserDetails);
authRouter.put('/change-password',authMiddleware,changePassword);

//admin
authRouter.post('/admin/registerAdmin',adminMiddleware,registerAdmin);
authRouter.post('/admin/registerStore',adminMiddleware,registerStore);
authRouter.get('/admin/get-all-stores',adminMiddleware,getAllStores);
authRouter.get('/admin/get-all-admins',authMiddleware,getAllAdmins);
authRouter.delete('/admin/delete-store/:storeId',adminMiddleware,deleteStore);
authRouter.get('/get-all-managers',adminMiddleware,getAllManagers);

//manager
authRouter.post('/registerManager',authMiddleware,registerManager);
authRouter.get('/manager/profile',authMiddleware,managerMiddleware,getManagerProfile);

// store
authRouter.get('/manager/get-store-managers/:storeId',authMiddleware,getParticularStoreManagers);
authRouter.get('/store/profile',authMiddleware,getStoreProfile);

//vendor
authRouter.post('/vendor/register',adminMiddleware,vendorRegister);
authRouter.post('/vendor/login', vendorLogin);
authRouter.post('/vendor/logout', logoutVendor);
authRouter.get('/vendor/profile',vendorMiddleware,getVendorLoggedInDetails);
// Get total transaction of all store related to particular vendor
authRouter.get('/vendor/get-all-related-transactions',vendorMiddleware, AllTransactionsVendorController);
authRouter.get('/vendor/get-related-stores',vendorMiddleware,getAllRelatedStores);
authRouter.get('/vendor/get-all-vendors',getAllVendors);
authRouter.get('/vendor/particular-transactions/:transactionId',vendorMiddleware,ParticularTransactionController);
authRouter.get('/vendor/transactions-particular-store/:storeId', vendorMiddleware,getAllRelatedStoresTransactions);

export default authRouter;

