import crypto from "crypto";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import subscription from "../Models/subscription.model.js";
import User from '../Models/user.js';
import personalDetails from "../Models/personalDetails.model.js";
import Recommendation from "../Models/recommendation.model.js";
import { v4 as uuidv4 } from "uuid";
import plan from "../Models/plan.model.js";
import moment from 'moment';
import sendEmail from "../Utils/sendMail.js";

// Razorpay webhook handler
export const handlePaymentSuccess = catchAsyncError(async (req, res, next) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

    if (signature !== expectedSignature) {
        return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body;

    // Only handle payment.captured events
    if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;

        const userId = payment.notes?.userId;
        const planId = payment.notes?.planId;

        if (!userId || !planId) {
            return next(new errorhandler("Missing metadata (userId or planId)", 400));
        }

        const deviceType = payment.notes?.deviceType || 'Web';

        try {
            const planData = await plan.findOne({ where: { planId } });
            if (!planData) return next(new errorhandler("Plan not found!", 404));

            const user = await User.findOne({ where: { userId } });
            const personalDetail = await personalDetails.findOne({ where: { userId } });

            const endDate = moment().add(planData.durationInMonths, 'months').toDate();
            const orderId = `WDL${uuidv4().split('-')[0].toUpperCase()}`;

            const subscriptionData = await subscription.create({
                orderId,
                planId,
                userId,
                paymentSucessId: payment.id,
                endDate,
                deviceType,
                paymentStatus: 'Completed',
            });

            if (user && subscriptionData) {
                await User.update({ usertype: planData.planName }, { where: { userId } });
                await Recommendation.update({ usertype: planData.planName }, { where: { userId } });

                const email = user.email;
                const validUpto = moment(endDate).format('LLL');

                const data = {
                    name: `${personalDetail.firstName} ${personalDetail.lastName}`,
                    orderId,
                    planName: planData.planName,
                    planType: planData.planType,
                    validUpto,
                    price: planData.price,
                    features: planData.featureList,
                    total: planData.price,
                };

                await sendEmail({
                    email,
                    subject: `Your Vaidikvivah.in order #${orderId}`,
                    template: "order-mail.ejs",
                    data,
                });

                return res.status(201).json({
                    success: true,
                    usertype: data.planName,
                    message: "Subscription created successfully!",
                });
            }

        } catch (err) {
            console.error("Webhook DB error:", err);
            return res.status(500).json({ success: false, message: "Internal error during subscription" });
        }
    }

    res.status(200).json({ success: true, message: "Webhook received" });
});
