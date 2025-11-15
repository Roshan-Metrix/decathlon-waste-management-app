import express from 'express';
import {loginUser,logoutUser, getLoggedInUserDetails, sendPasswordResetOtp, resetPassword, registerAdmin, registerStore, registerManager } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authVendorMiddleware from '../middlewares/authVendorMiddleware.js';
import { getVendorLoggedInDetails, logoutVendor, vendorLogin, vendorRegister } from '../controllers/vendorController.js';
import { getAllAdmins } from '../controllers/adminController.js';
import { getAllManagers } from '../controllers/managerController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { getAllStores } from '../controllers/storeController.js';

const authRouter = express.Router();

authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/profile',authMiddleware,getLoggedInUserDetails);
authRouter.post('/send-reset-otp', sendPasswordResetOtp)
authRouter.post('/reset-password',resetPassword)

//admin
authRouter.post('/admin/registerAdmin',adminMiddleware,registerAdmin);
authRouter.post('/admin/registerStore',adminMiddleware,registerStore);
authRouter.get('/admin/get-all-admins',authMiddleware,getAllAdmins);
authRouter.get('/admin/get-all-managers',authMiddleware,getAllManagers);
authRouter.get('/admin/get-all-stores',adminMiddleware,getAllStores);

//manager
authRouter.post('/registerManager',authMiddleware,registerManager);

//vendor
authRouter.get('/vendor/profile',authVendorMiddleware,getVendorLoggedInDetails);
authRouter.post('/vendor/register', vendorRegister);
authRouter.post('/vendor/login', vendorLogin);
authRouter.post('/vendor/logout', logoutVendor);

export default authRouter;

