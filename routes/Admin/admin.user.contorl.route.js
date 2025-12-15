import express from 'express';
import {
  suspendUserAccount,
  deleteUserAccount,
  updateDocumentStatus,
  getUserDocumentStatus,
  verifyUserByAdmin,getAllUsersVerificationStatus
} from '../../Controllers/Admin/admin.user.controller.js';

import { isAdminAuthenticated } from '../../Middlewares/admin/isAdminAuthenticated.js';
import { logApiRequest } from '../../Middlewares/admin/logApiRequest.js';
const adminControl = express.Router();

// ✅ Apply isAdminAuthenticated middleware to all secure routes
adminControl.delete('/delete-account', isAdminAuthenticated, deleteUserAccount);
adminControl.put('/suspend-account', isAdminAuthenticated, suspendUserAccount);
adminControl.put('/update-document-status', isAdminAuthenticated, updateDocumentStatus);
adminControl.get('/user-documents-details', getUserDocumentStatus);
adminControl.put('/verify-user', isAdminAuthenticated, verifyUserByAdmin);
adminControl.get(
  "/users-verification-status",
  isAdminAuthenticated,
  getAllUsersVerificationStatus
);

export default adminControl;
