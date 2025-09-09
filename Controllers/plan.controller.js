import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import plan from "../Models/plan.model.js";
import dotenv from 'dotenv';
import { createRazorpayInstance } from "../config/razorpay.config.js";

dotenv.config();

// Razorpay instance
const razorpay = createRazorpayInstance();

// CREATE PLAN
export const createPlan = catchAsyncError(async (req, res, next) => {
  const { userId } = req.user;

  try {
    const {
      planName,
      price,
      durationInMonths,
      description,
      planType,
      featureList,
    } = req.body;

    console.log(req.body);

    if (
      !planName ||
      !price ||
      !durationInMonths ||
      !description ||
      !planType ||
      !featureList
    ) {
      return next(new errorhandler("Please enter all fields", 400));
    }

    // Razorpay expects amount in paise
    const amountInPaise = parseInt(price) * 100;

    // Create Razorpay Plan
    const razorpayPlan = await razorpay.plans.create({
      period: "monthly",
      interval: durationInMonths,
      item: {
        name: `${planName} Plan`,
        amount: amountInPaise,
        currency: "INR",
        description: description,
      },
    });

    const newPlan = await plan.create({
      planName,
      price,
      durationInMonths,
      razorpayPriceId: razorpayPlan.id,
      description,
      userId,
      planType,
      featureList,
    });

    res.status(201).json({
      success: true,
      data: newPlan,
      message: "Plan created successfully with Razorpay!",
    });
  } catch (error) {
    console.log(error);
    return next(new errorhandler(error.message, 500));
  }
});

// GET ALL PLANS
export const getAllPlans = catchAsyncError(async (req, res, next) => {
  const plans = await plan.findAll();
  if (!plans) {
    return res.status(404).json({ success: false, message: "Plans not found!" });
  }

  const data = plans.map((plan) => {
    return {
      id: plan.planId,
      planName: plan.planName,
      price: plan.price,
      durationInMonths: plan.durationInMonths,
      description: plan.description,
      planType: plan.planType,
      featureList: plan.featureList,
    };
  });

  res.status(200).json({
    success: true,
    data: data,
    message: "Plans fetched successfully!",
  });
});




// GET single plan using body
export const getPlanById = catchAsyncError(async (req, res, next) => {
  const { planId } = req.body;
  if (!planId) return next(new errorhandler("planId is required", 400));

  const planData = await plan.findOne({ where: { planId } });
  if (!planData) return next(new errorhandler("Plan not found!", 404));

  res.status(200).json({ success: true, data: planData, message: "Plan fetched." });
});

// UPDATE plan using body
export const updatePlan = catchAsyncError(async (req, res, next) => {
  const { planId, planName, price, durationInMonths, description, planType, featureList } = req.body;
  if (!planId) return next(new errorhandler("planId is required", 400));

  const planData = await plan.findOne({ where: { planId } });
  if (!planData) return next(new errorhandler("Plan not found!", 404));

  await plan.update(
    { planName, price, durationInMonths, description, planType, featureList },
    { where: { planId } }
  );

  const updated = await plan.findOne({ where: { planId } });
  res.status(200).json({ success: true, data: updated, message: "Plan updated." });
});

// DELETE plan using body
export const deletePlan = catchAsyncError(async (req, res, next) => {
  const { planId } = req.body;
  if (!planId) return next(new errorhandler("planId is required", 400));

  const planData = await plan.findOne({ where: { planId } });
  if (!planData) return next(new errorhandler("Plan not found!", 404));

  await plan.destroy({ where: { planId } });
  res.status(200).json({ success: true, message: "Plan deleted successfully!" });
});
