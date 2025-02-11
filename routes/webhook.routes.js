import express from "express";
import { handlePaymentSuccess } from "../Controllers/webhook.controller.js";

const StipeApp = express.Router();
StipeApp.use(express.raw({ type: '*/*' }));


const webhookRouter = express.Router();


webhookRouter.post('/webhook', StipeApp, handlePaymentSuccess);

export default webhookRouter 