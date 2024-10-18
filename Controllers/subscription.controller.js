import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import subscription from "../Models/subscription.model.js";
import plan from "../Models/plan.model.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createSubscription = catchAsyncError(async (req, res, next) => {
   
    try {
        const { planId, userId } = req.body;

        console.log(planId )
        
        if (!planId || !userId) {
            return next(new errorhandler("Please enter all fields", 400));
        }
        const planData = await plan.findOne({ where: { id: planId } });

        if (!planData) {
            return next(new errorhandler("Plan not found!", 404));
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [
                { 
                    name : planData.name,
                    amount: planData.amount,
                    duration: planData.durationInMonths,
                    currency: "aud",
                    quantity: 1,
                },
            ],
            mode: "payment",
            customer_email: req.user.email,
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        const newSubscription = await subscription.create({
            planId,
            userId,
            sessionId: session.id,
        });

        res.status(201).json({
            success: true,
            data: newSubscription,
            message: "Subscription created successfully!",
        });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
    
})