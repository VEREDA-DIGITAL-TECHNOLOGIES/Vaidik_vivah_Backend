import express from "express";
import { isAuthenticated } from "../Middlewares/auth.js";
import {createCheckoutSession,handlePaymentSuccess} from "../Controllers/subscription.controller.js";

const subscriptionRouter = express.Router();

subscriptionRouter.post('/createCheckoutSession',isAuthenticated,createCheckoutSession);
subscriptionRouter.get('/payment-success',isAuthenticated,handlePaymentSuccess)

export default subscriptionRouter