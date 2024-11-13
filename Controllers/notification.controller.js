import admin from 'firebase-admin';
import errorhandler from "../Utils/errorhandler.js";
import fs from "fs";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, "../config/serviceAccountKey.json");

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
console.log(serviceAccount, "serviceAccount");

export const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://wedlock-4f698-default-rtdb.firebaseio.com",
});

export const sendNotification = catchAsyncError(async (req, res, next) => {
    try {
        const { fcmToken, message, data } = req.body;
        console.log(req.body, "body data");

        if (!fcmToken) {
            return next(new errorhandler("fcmToken is required", 400));
        }

        if (!message) {
            return next(new errorhandler("message is required", 400));
        }

        if (!data || !data.title || !data.body) {
            return next(new errorhandler("Notification title and body are required", 400));
        }

        const messageData = {
            token: fcmToken,
            notification: {
                title: data.title,
                body: data.body,
            },
            data: {
                message: message,
                type: data.type,
                senderId: data.senderId,
                receiverId: data.receiverId,
                senderName: data.senderName,
                senderImage: data.senderImage,
            }
        };

        const response = await admin.messaging().send(messageData);
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});
