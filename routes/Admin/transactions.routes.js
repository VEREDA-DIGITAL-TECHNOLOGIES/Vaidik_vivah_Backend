import express from 'express';
import { getAllBillingInfo, getFinancialReport } from '../../Controllers/Admin/transactions.controller.js';
import { isAdminAuthenticated } from '../../Middlewares/admin/isAdminAuthenticated.js'; // adjust the path if needed

const admintransactionRouter = express.Router();

// Protect routes with isAdminAuthenticated
admintransactionRouter.get("/allbillinginfo", isAdminAuthenticated, getAllBillingInfo);
admintransactionRouter.get("/financial-report", isAdminAuthenticated, getFinancialReport);

export default admintransactionRouter;
