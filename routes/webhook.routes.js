import express from "express";
import { handlePaymentSuccess } from "../Controllers/webhook.controller.js";

const webhookRouter = express.Router();

// Stripe requires raw body for signature verification
webhookRouter.post('/webhook', express.raw({ type: 'application/json' }), handlePaymentSuccess);

export default webhookRouter;
