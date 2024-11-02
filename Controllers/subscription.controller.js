import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import subscription from "../Models/subscription.model.js";
import {v4 as uuidv4} from "uuid";
import plan from "../Models/plan.model.js";
import Stripe from "stripe";
import cron from "node-cron";
import moment from 'moment';
import { Op } from "sequelize";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = catchAsyncError(async (req, res, next) => {

    try {
        const userId = req.user.userId
        const { planId } = req.body;

        if (!planId) {
            return next(new errorhandler("Plan ID is required", 400));
        }

        const planData = await plan.findOne({ where: { planId } });

        if (!planData) {
            return next(new errorhandler("Plan not found", 404));
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'alipay', 'klarna'],
            line_items: [
                {
                    price_data: {
                        currency: "aud",
                        product_data: {
                            name: planData.planName,
                            description: planData.description,
                        },
                        unit_amount: planData.price * 100,
                    }, 
                    quantity: 1,
                },
            ],
            mode: "payment",
          
            customer_email: req.user.email,
            success_url: `${process.env.FRONTEND_URL}/Payment-Success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
                planId: planId,
                userId: userId 
            },
        });

        res.status(201).json({
            success: true,
            url: session.url,        
         });

    } catch (error) {
        console.error("Error creating checkout session:", error);
        return next(new errorhandler("Failed to create checkout session. Please try again later.", 500));
    }
});


export const handlePaymentSuccess = catchAsyncError(async (req, res, next) => {
    try {

        const  session_id  = req.params.session_id;

        console.log(session_id, "session_id");
        
        if (!session_id) {
            return next(new errorhandler("Session ID is missing", 400));
        }
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return next(new errorhandler("Payment not completed", 400));
        }

        const planId = session.metadata.planId;
        const userId = session.metadata.userId;
        const planData = await plan.findOne({ where: { planId } });

        if (!planData) {
            return next(new errorhandler("Plan not found!", 404));
        }

        const endDate = moment().add(planData.durationInMonths, 'months').toDate();

        const orderId = `WDL${uuidv4().split('-')[0].toUpperCase()}`;


       const subscriptionData =  await subscription.create({
            orderId,
            planId,
            userId,
            sessionId: session.id,
            endDate,
            paymentStatus: 'Completed',
        });

        console.log(subscriptionData, "subscriptionData");

    
        res.status(201).json({
            success: true,
            message: "Subscription created successfully!",
        });

        
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
    
})



export const handleAutoExpiry = catchAsyncError(async (req, res, next) => {

    try {   
        const subscriptionData = await subscription.findAll();

        if (!subscriptionData) {
            return next(new errorhandler("Subscription not found!", 404));
        }

        const today = new Date();

        subscriptionData.forEach(async (subscription) => {

            if (subscription.endDate && subscription.endDate < today) {
                await subscription.update({ paymentStatus: 'Expired' });
            }

        });

        res.status(201).json({
            success: true,
            message: "Subscription updated successfully!",
        });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }

})


export const getSubscriptionPurchaseHistory = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;

    const subscriptionData = await subscription.findAll({
        where: { userId }
    });

    const planData = await plan.findAll({
        where: { planId: { [Op.in]: subscriptionData.map((sub) => sub.planId) } },
    });

    if (!subscriptionData || subscriptionData.length === 0) {
        return next(new errorhandler("Subscription not found!", 404));
    }
    

    

    const data = subscriptionData.map((sub)=>{
        return {
            orderId: sub.orderId,
            paymentStatus: sub.paymentStatus,
            planName: planData.find((plan) => plan.planId === sub.planId).planName.split(' ').join('-'),
            purchaseDate: moment(sub.createdAt).format('DD-MM-YYYY'),
            amount : planData.find((plan) => plan.planId === sub.planId).price
        }
    })




    res.status(200).json({
        success: true,
        message: "Subscription fetched successfully!",
        data: data
    });
});



cron.schedule('0 0 * * *', async () => {
    console.log('Running subscription expiry check at midnight...');
     handleAutoExpiry();
});