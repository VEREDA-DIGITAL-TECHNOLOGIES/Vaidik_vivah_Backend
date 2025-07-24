// routes/adminRoute.js
import express from "express";
import { getAllUsersWithDetails } from "../../Controllers/Admin/getAllUsersWithDetails.js";
import { getUserStatus } from "../../Controllers/Admin/getAllUsersWithDetails.js";
import { isAdminAuthenticated } from "../../Middlewares/admin/isAdminAuthenticated.js";
const AdminUserRouter = express.Router();

// GET /api/v1/admin/all-users
AdminUserRouter.get("/all-users", isAdminAuthenticated,getAllUsersWithDetails);
AdminUserRouter.get('/user-status',isAdminAuthenticated,getUserStatus);
export default AdminUserRouter;
