import express from 'express';
import {
  registerAdmin,
  adminLogin,
  verifyLoginOtp,
  adminLogout
} from '../../Controllers/Admin/admin.controller.js';

import { getAdminLogs,getLogsByAdminId } from '../../Controllers/Admin/adminLogs.controller.js';
import { isAdminAuthenticated } from '../../Middlewares/admin/isAdminAuthenticated.js';
import { logApiRequest } from '../../Middlewares/admin/logApiRequest.js';
import { updateAdminAccessToken } from '../../Controllers/Admin/admin.controller.js';
const adminRouter = express.Router();

// adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', adminLogin);
adminRouter.post('/verify-otp', logApiRequest, verifyLoginOtp);
adminRouter.get('/refresh-token',updateAdminAccessToken  )

// Add log tracking only for protected routes
adminRouter.post('/logout', isAdminAuthenticated, logApiRequest, adminLogout);
adminRouter.get('/logs', getAdminLogs);
adminRouter.get('/user-logs',getLogsByAdminId);


export default adminRouter;
