import express from 'express';
import {
  registerAdmin,
  adminLogin,
  verifyLoginOtp,
  adminLogout,
  updateAdminAccessToken,
  forgotPassword,
  resetPassword,
  resendOtp
} from '../../Controllers/Admin/admin.controller.js';

import { getAdminLogs, getLogsByAdminId } from '../../Controllers/Admin/adminLogs.controller.js';
import { isAdminAuthenticated } from '../../Middlewares/admin/isAdminAuthenticated.js';
import { logApiRequest } from '../../Middlewares/admin/logApiRequest.js';

const adminRouter = express.Router();

/* --------------------------------------------------
   🔐 AUTHENTICATION ROUTES
-------------------------------------------------- */
adminRouter.post('/register', registerAdmin);
adminRouter.post('/login', adminLogin);
adminRouter.post('/verify-otp', logApiRequest, verifyLoginOtp);
adminRouter.get('/refresh-token', updateAdminAccessToken);
adminRouter.post('/logout', isAdminAuthenticated, logApiRequest, adminLogout);

/* --------------------------------------------------
   🔄 OTP & PASSWORD MANAGEMENT ROUTES
-------------------------------------------------- */
adminRouter.post('/forgot-password', forgotPassword);
adminRouter.post('/reset-password', resetPassword);
adminRouter.post('/resend-otp', resendOtp);

/* --------------------------------------------------
   📜 LOGS ROUTES
-------------------------------------------------- */
adminRouter.get('/logs', getAdminLogs);
adminRouter.get('/user-logs', getLogsByAdminId);

export default adminRouter;
