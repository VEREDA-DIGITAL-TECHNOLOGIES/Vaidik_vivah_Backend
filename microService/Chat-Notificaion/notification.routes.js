import express from "express";
import { addNotificationUid } from "./notification.controller.js";

const fcmNotficationRouter= express.Router();

fcmNotficationRouter.post("/notifications/enqueue", addNotificationUid);

export default fcmNotficationRouter;