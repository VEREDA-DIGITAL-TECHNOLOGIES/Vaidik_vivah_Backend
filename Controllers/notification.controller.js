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
        const { token, title, body, data } = req.body;

        if (!token) {
            return next(new errorhandler("fcmToken is required", 400));
        }

        if (!title) {
            return next(new errorhandler("Notification title is required", 400));
        }

        if (!body) {
            return next(new errorhandler("Notification body is required", 400));
        }

        // Construct message payload
        const message = {
            token: token,
            notification: {
                title: title,
                body: body,
            },
            data: {
                ...data,
            },
        };

        const response = await admin.messaging().send(message);
        console.log("FCM Response:", response);

        res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log(error)
        return next(new errorhandler(error.message, 500));
    }
});

