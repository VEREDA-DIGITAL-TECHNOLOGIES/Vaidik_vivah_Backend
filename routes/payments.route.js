import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../Controllers/payments.controller.js';
import { isAuthenticated } from "../Middlewares/auth.js";

const router = express.Router();

router.post('/create-razorpay-order', isAuthenticated, createRazorpayOrder);
router.post('/verify-payment', isAuthenticated, verifyRazorpayPayment);

export default router;