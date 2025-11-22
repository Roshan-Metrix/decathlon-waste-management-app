import express from 'express';
import {loginUser,logoutUser, getLoggedInUserDetails, sendPasswordResetOtp, resetPassword, registerAdmin, registerStore, registerManager, changePassword } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authVendorMiddleware from '../middlewares/authVendorMiddleware.js';
import { getVendorLoggedInDetails, logoutVendor, vendorLogin, vendorRegister } from '../controllers/vendorController.js';
import { getAllAdmins } from '../controllers/adminController.js';
import { getAllManagers, getManagerProfile, getParticularStoreManagers } from '../controllers/managerController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { deleteStore, getAllStores } from '../controllers/storeController.js';
import managerMiddleware from '../middlewares/managerMiddleware.js';

const authRouter = express.Router();

authRouter.get('/', (req, res) => {
    res.send('Auth API Endpoint Running...');
});

//user
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/profile',authMiddleware,getLoggedInUserDetails);
authRouter.post('/send-reset-otp', sendPasswordResetOtp);
authRouter.post('/reset-password',resetPassword);
authRouter.put('/change-password',authMiddleware,changePassword);

//admin
authRouter.post('/admin/registerAdmin',adminMiddleware,registerAdmin);
authRouter.post('/admin/registerStore',adminMiddleware,registerStore);
authRouter.get('/admin/get-all-admins',authMiddleware,getAllAdmins);
authRouter.get('/admin/get-all-stores',adminMiddleware,getAllStores);
authRouter.delete('/admin/delete-store/:storeId',adminMiddleware,deleteStore);
authRouter.get('/get-all-managers',adminMiddleware,getAllManagers);

//manager
authRouter.post('/registerManager',authMiddleware,registerManager);
authRouter.get('/manager/get-store-managers',authMiddleware,managerMiddleware,getParticularStoreManagers);
authRouter.get('/manager/profile',authMiddleware,managerMiddleware,getManagerProfile);

//vendor
authRouter.get('/vendor/profile',authVendorMiddleware,getVendorLoggedInDetails);
authRouter.post('/vendor/register', vendorRegister);
authRouter.post('/vendor/login', vendorLogin);
authRouter.post('/vendor/logout', logoutVendor);

export default authRouter;

