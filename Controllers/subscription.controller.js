import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import subscription from "../Models/subscription.model.js";
import User from '../Models/user.js';
import Recommendation from "../Models/recommendation.model.js";
import { v4 as uuidv4 } from "uuid";
import plan from "../Models/plan.model.js";

import cron from "node-cron";
import moment from 'moment';
import { Op } from "sequelize";
import { createRazorpayInstance } from "../config/razorpay.config.js";

const razorpay = createRazorpayInstance();

export const createCheckoutSession = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { planId } = req.body;

        if (!planId) {
            return next(new errorhandler("Plan ID is required", 400));
        }

        const planData = await plan.findOne({ where: { planId } });
        if (!planData) {
            return next(new errorhandler("Plan not found", 404));
        }

        const options = {
            amount: parseInt(planData.price) * 100, // Razorpay works with paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId,
                planId,
                deviceType: 'Web',
            },
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
            planDetails: {
                planId: planData.planId,
                price: planData.price,
                name: planData.planName,
            },
        });

    } catch (error) {
        console.error("Razorpay Error:", error);
        return next(new errorhandler("Failed to create Razorpay order", 500));
    }
});

export const checkSubscriptionStatus = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await User.findOne({ where: { userId } });

        res.status(200).json({
            success: true,
            usertype: user.usertype,
        });

    } catch (error) {
        return next(new errorhandler("Failed to fetch subscription status", 500));
    }
});

export const handlePaymentProcessForMobile = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { paymentSucessId, planId } = req.body;

        if (!paymentSucessId || !planId) {
            return next(new errorhandler("Session ID or plan ID is missing", 400));
        }

        const planData = await plan.findOne({ where: { planId } });
        if (!planData) {
            return next(new errorhandler("Plan not found!", 404));
        }

        const endDate = moment().add(planData.durationInMonths, 'months').toDate();
        const orderId = `WDL${uuidv4().split('-')[0].toUpperCase()}`;

        const subscriptionData = await subscription.create({
            orderId,
            planId,
            userId,
            paymentSucessId,
            endDate,
            deviceType: 'Mobile',
            paymentStatus: 'Completed',
        });

        if (subscriptionData !== null) {
            const user = await User.findOne({ where: { userId } });
            if (user !== null) {
                await User.update({ usertype: planData.planName }, { where: { userId } });
                await Recommendation.update({ usertype: planData.planName }, { where: { userId } });
            }
        }

        res.status(201).json({
            success: true,
            message: "Subscription created successfully!",
        });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

export const handleAutoExpiry = catchAsyncError(async (req, res, next) => {
    try {
        const subscriptionData = await subscription.findAll();

        if (!subscriptionData) {
            return next(new errorhandler("Subscription not found!", 404));
        }

        const today = new Date();

        subscriptionData.forEach(async (sub) => {
            if (sub.endDate && sub.endDate < today) {
                await sub.update({ status: 'Expired' });
                await User.update({ usertype: 'Standard' }, { where: { userId: sub.userId } });
            }
        });

        console.log("Subscription updated successfully!");
    } catch (error) {
        console.error("Error updating subscriptions:", error.message);
    }
});

export const getSubscriptionPurchaseHistory = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const subscriptionData = await subscription.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });

        const planData = await plan.findAll({
            where: { planId: { [Op.in]: subscriptionData.map(sub => sub.planId) } },
        });

        if (!subscriptionData || subscriptionData.length === 0) {
            return next(new errorhandler("Subscription not found!", 404));
        }

        const data = subscriptionData.map((sub) => {
            const planInfo = planData.find(plan => plan.planId === sub.planId);
            return {
                orderId: sub.orderId,
                paymentStatus: sub.paymentStatus,
                planName: planInfo.planName.split(' ').join('-'),
                purchaseDate: moment(sub.createdAt).format('DD-MM-YYYY'),
                amount: planInfo.price
            };
        });

        res.status(200).json({
            success: true,
            message: "Subscription fetched successfully!",
            data
        });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

// Auto-expiry job scheduled at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running subscription expiry check at midnight...');
    handleAutoExpiry();
});
