import dotenv from 'dotenv';
import express from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from './Middlewares/error.js'
import userRouter from './routes/user.routes.js';
import questionRouter from "./routes/question.routes.js"
import formRouter from "./routes/forms.routes.js"
import profileRouter from './routes/profile.routes.js';
import happyStoryRouter from './routes/happyStory.routes.js';
import favProfileRouter from './routes/favProfile.routes.js';
import connectionRouter from './routes/connection.routes.js';
import planRouter from './routes/plan.routes.js';
import notificationRouter from './routes/notification.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import dropdownRouter from './routes/dropdown.routes.js';
import billingRouter from './routes/billing.routes.js';
import callRouter from './routes/call.routes.js'
import featureRouter from './routes/feature.routes.js';
import webhookRouter from './routes/webhook.routes.js';
import toggleRouter from './routes/toggle.routes.js';
import Documentrouter from './routes/document.routes.js';
import BlockRouter from './routes/block.routes.js';
import paymentrazopay from './routes/payments.route.js'
import ReportRouter from './routes/report.routes.js';
import filerouter from './routes/file.routes.js';
import adminRouter from './routes/Admin/admin.routes.js';
import adminDashboardRouter from './routes/Admin/dashboard.route.js';
import AdminUserRouter from './routes/Admin/admin.userDetails.route.js';
import admintransactionRouter from './routes/Admin/transactions.routes.js';
import adminControl from './routes/Admin/admin.user.contorl.route.js';
import bannerRouter from './routes/Admin/banner.routes.js';
import contactRouter from './routes/contactRoutes.js';
import ApplicationRouter from "./routes/applicationRoutes.js"
import documentUpload from './Models/document.upload.js';
import connectDB from './Utils/db.js';
import fcmNotficationRouter from './microService/Chat-Notificaion/notification.routes.js';
dotenv.config();



app.use(express.json({ limit: "50mb" }));
app.use(express.static("./public"));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());






app.use(cors({
  origin: [
    "https://vedvivah.com",
    "https://www.vedvivah.com",
    "https://admin.vedvivah.com",
    "https://recommend.vedvivah.com",
    "http://localhost:5173",
    "http://localhost:3001"
  ],
  credentials: true,
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.use((req, res, next) => {
  // ❌ skip healthcheck spam
  if (req.originalUrl === "/test") return next();

  // ❌ skip static files (optional but useful)
  if (req.originalUrl.startsWith("/public")) return next();

  // ✅ log only useful requests
  console.log(`➡️ [${req.method}] ${req.originalUrl}`);
  next();
});
app.use("/api/v1/user", userRouter);
app.use("/api/v1/question", questionRouter);
app.use("/api/v1/form", formRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/profile/favorite", favProfileRouter);
app.use("/api/v1/connection", connectionRouter);
app.use("/api/v1/happyStories", happyStoryRouter);
app.use("/api/v1/plan", planRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/billing", billingRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/call", callRouter);
app.use('/api/v1/dropdown',dropdownRouter);
app.use('/api/v1/feature',featureRouter);
app.use('/api/v1/toggle',toggleRouter);
app.use('/api/v1/uploadDocuments',Documentrouter)
app.use('/api/v1/block', BlockRouter);
app.use('/api/v1/payment', paymentrazopay);
app.use('/api/v1/report', ReportRouter);
app.use("/api/files", filerouter);
app.use("/api/admin/", adminRouter);
app.use("/api/admin-dashboard/user-details", adminDashboardRouter);
app.use("/api/admin/transactions", admintransactionRouter);
app.use("/api/admin/control", adminControl);
app.use("/api/admin/banner", bannerRouter);
app.use("/api/admin/contact",contactRouter)
// adminControl
app.use('/api/v1/application-plan', ApplicationRouter);
app.use("/api/v1/fcm-notification", fcmNotficationRouter);
app.use('/api/admin-dashboard', AdminUserRouter);
app.use('/api/v1/application-plan', ApplicationRouter);
app.use("/api/v1/payment-process", webhookRouter);


const sequelize = connectDB();
app.get("/test", async (req, res) => {
  return res.status(200).json({
    success: true,
    status: "OK",
    service: "VEDVIVAH BACKEND RUNNING",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});





app.use(ErrorMiddleware);

 