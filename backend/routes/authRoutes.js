import express from 'express';
import { registerUser,loginUser,logoutUser, getLoggedInUserDetails } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/profile',authMiddleware,getLoggedInUserDetails);

export default authRouter;

