import { createRazorpayInstance, keyst } from "../config/razorpay.config.js";
import crypto from "crypto";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import plan from "../Models/plan.model.js";
import subscription from "../Models/subscription.model.js";
import User from "../Models/user.js";
import Recommendation from "../Models/recommendation.model.js";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import dotenv from 'dotenv';
import Application from "../Models/application.js";

dotenv.config();
const razorpayInstance = createRazorpayInstance();

// 1. Create Razorpay Order

export const createRazorpayOrder = catchAsyncError(async (req, res, next) => {
    const { planId } = req.body;

    if (!planId) return next(new errorhandler("Plan ID is required", 400));

    const planData = await plan.findOne({ where: { planId } });

    if (!planData) return next(new errorhandler("Plan not found", 404));

    const options = {
        amount: parseInt(planData.price) * 100, // Convert to paise
        currency: "INR",
        receipt: `rcpt_${uuidv4().split("-")[0]}`,
    };

    razorpayInstance.orders.create(options, (err, order) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ success: false, message: "Order creation failed" });
        }
        // console.log(order, planData, process.env.RAZORPAY_KEY_ID);

        res.status(200).json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
            planDetails: {
                planId: planData.planId,
                price: planData.price,
                name: planData.planName,
            }
        });
    });
});


// 2. Verify Razorpay Signature
export const verifyRazorpayPayment = catchAsyncError(async (req, res, next) => {
    const { order_id, payment_Id, signature, planId } = req.body;
    const userId = req.user.userId;

    const hmac = crypto.createHmac("sha256", keyst);
    hmac.update(order_id + "|" + payment_Id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== signature) {
        return res.status(400).json({ success: false, message: "Payment not verified" });
    }

    const planData = await plan.findOne({ where: { planId } });
    if (!planData) return next(new errorhandler("Plan not found!", 404));

    const endDate = moment().add(planData.durationInMonths, 'months').toDate();
    const orderId = `WDL${uuidv4().split('-')[0].toUpperCase()}`;

    const subscriptionData = await subscription.create({
        orderId,
        planId,
        userId,
        paymentSucessId: payment_Id,
        endDate,
        deviceType: 'Web',
        paymentStatus: 'Completed',
    });

    await User.update({ usertype: planData.planName }, { where: { userId } });
    await Recommendation.update({ usertype: planData.planName }, { where: { userId } });
    // await Application.update({status:"completed"}, {where:{}});

    res.status(200).json({ success: true, message: "Payment verified and subscription created" });
});

