import express from "express";
import {
  getAllUsersWithDetails,
  getUserStatus,
  disableUserByAdmin,
  enableUserByAdmin,
  getAllDisabledUsersWithDetails, 
} from "../../Controllers/Admin/getAllUsersWithDetails.js";

import { isAdminAuthenticated } from "../../Middlewares/admin/isAdminAuthenticated.js";

const AdminUserRouter = express.Router();

/* ===================== USERS ===================== */

// GET all users with full details
// GET /api/v1/admin/all-users
AdminUserRouter.get(
  "/all-users",
  isAdminAuthenticated,
  getAllUsersWithDetails
);

// GET user statistics
// GET /api/v1/admin/user-status
AdminUserRouter.get(
  "/user-status",
  isAdminAuthenticated,
  getUserStatus
);

/* ===================== USER CONTROL ===================== */

// DISABLE USER (reason optional)
// PUT /api/v1/admin/users/:public_user_id/disable
AdminUserRouter.put(
  "/users/:public_user_id/disable",
  isAdminAuthenticated,
  disableUserByAdmin
);

// ENABLE USER
// PUT /api/v1/admin/users/:public_user_id/enable
AdminUserRouter.put(
  "/users/:public_user_id/enable",
  isAdminAuthenticated,
  enableUserByAdmin
);


AdminUserRouter.get(
    "/disabled-users",
    isAdminAuthenticated,
    getAllDisabledUsersWithDetails
  );

export default AdminUserRouter;
