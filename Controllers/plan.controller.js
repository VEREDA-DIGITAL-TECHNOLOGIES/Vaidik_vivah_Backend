import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import plan from "../Models/plan.model.js";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPlan = catchAsyncError(async (req, res, next) => {

    try {
        const {userId} = req.user
      const { planName, price, durationInMonths, description } = req.body;
  
      if (!planName || !price || !durationInMonths || !description) {
        return next(new errorhandler("Please enter all fields", 400));
      }
  
      const product = await stripe.products.create({
        name: planName,
      });
  
      const stripePrice = await stripe.prices.create({
        unit_amount: Math.round(price * 100), 
        currency: "aud",
        recurring: {
          interval: "month",
        },
        product: product.id,
      });
  
      // Create a new plan in the database
      const newPlan = await plan.create({
        planName,
        price,
        durationInMonths,
        stripePriceId: stripePrice.id,
        description,
        userId
      });
  
      // Respond with success
      res.status(201).json({
        success: true,
        data: newPlan,
        message: "Plan created successfully!",
      });
    } catch (error) {
      return next(new errorhandler(error.message, 500));
    }
  });
  


export const getAllPlans = catchAsyncError(async (req, res, next) => {
    const plans = await plan.findAll();
    if (!plans) {
        return next(new errorhandler("Plans not found!", 404));
    }

    const data = plans.map((plan) => {
        return {
            id: plan.planId,
            planName: plan.planName,
            price: plan.price,
            durationInMonths: plan.durationInMonths,
            description: plan.description
        }
    })


    console.log(plans, "plans")
    res.status(200).json({
        success: true,
        data: data,
        message: "Plans fetched successfully!",

    })
})


export const deletePlan = catchAsyncError(async (req, res, next) => {
    const { planId } = req.params;

    try {

        const planData = await plan.findOne({ where: { id: planId } });

        if (!planData) {
            return next(new errorhandler("Plan not found!", 404));
        }

        await plan.destroy({ where: { id: planId } });

        res.status(200).json({
            success: true,
            message: "Plan deleted successfully!",
        });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
})
