import express from 'express';
import {loginUser,logoutUser, getLoggedInUserDetails, sendPasswordResetOtp, resetPassword, registerAdmin, registerStore, registerManager, changePassword, restrictAnyAdminAccess } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { addMaterialTypeAndRate, deleteRegion, getAllAdmins, getAllMaterialsWithRate, getAllRegions } from '../controllers/adminController.js';
import { deleteManager, getAllManagers, getManagerProfile, getParticularStoreManagers } from '../controllers/managerController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { deleteStore, editStoreDetails, getAllStores, getStoreProfile } from '../controllers/storeController.js';
import managerMiddleware from '../middlewares/managerMiddleware.js';

const authRouter = express.Router();

authRouter.get('/', (req, res) => {
    res.send('Auth API Endpoint Running...');
});

// ----- App routes -------
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
authRouter.delete('/admin/delete-manager/:managerId',adminMiddleware,deleteManager)
authRouter.get('/get-all-managers',adminMiddleware,getAllManagers);
authRouter.patch('/admin/restrict-admin/:adminId',adminMiddleware,restrictAnyAdminAccess);
authRouter.patch('/admin/edit-store/:storeId',adminMiddleware,editStoreDetails)

//manager
authRouter.post('/registerManager',authMiddleware,registerManager);
authRouter.get('/manager/profile',authMiddleware,managerMiddleware,getManagerProfile);

// store
authRouter.get('/manager/get-store-managers/:storeId',authMiddleware,getParticularStoreManagers);
authRouter.get('/store/profile',authMiddleware,getStoreProfile);

// materialType and Rate add
authRouter.post('/admin/add-materials',authMiddleware,adminMiddleware,addMaterialTypeAndRate);
authRouter.get('/get-regions',authMiddleware,getAllRegions);
authRouter.get('/get-regional-materials/:region',authMiddleware,getAllMaterialsWithRate);
authRouter.delete('/admin/delete-region/:region',authMiddleware,adminMiddleware,deleteRegion);

export default authRouter;
