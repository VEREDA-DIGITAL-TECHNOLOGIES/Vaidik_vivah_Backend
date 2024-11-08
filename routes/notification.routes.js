import express from "express";
import { sendNotification } from "../Controllers/notification.controller.js";
import { isAuthenticated } from "../Middlewares/auth.js";


const notificationRouter = express.Router();

notificationRouter.post('/sendNotification' ,isAuthenticated,sendNotification);

export default notificationRouter