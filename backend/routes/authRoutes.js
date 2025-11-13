import express from 'express';
import { registerUser,loginUser,logoutUser, getLoggedInUserDetails, sendPasswordResetOtp, resetPassword } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authVendorMiddleware from '../middlewares/authVendorMiddleware.js';
import { getVendorLoggedInDetails, logoutVendor, vendorLogin, vendorRegister } from '../controllers/vendorController.js';

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/profile',authMiddleware,getLoggedInUserDetails);
authRouter.post('/send-reset-otp', sendPasswordResetOtp)
authRouter.post('/reset-password',resetPassword)

//vendor
authRouter.post('/vendor/register', vendorRegister);
authRouter.post('/vendor/login', vendorLogin);
authRouter.post('/vendor/logout', logoutVendor);
authRouter.get('/vendor/profile',authVendorMiddleware,getVendorLoggedInDetails);

export default authRouter;

