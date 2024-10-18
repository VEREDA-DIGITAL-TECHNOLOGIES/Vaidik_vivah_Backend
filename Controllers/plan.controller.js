import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import plan from "../Models/plan.model.js";

export const createPlan = catchAsyncError(async (req, res, next) => {

    try{

        const {planName,price, durationInMonths,stripePriceId,description} = req.body;

        if(!planName || !price || !durationInMonths || !stripePriceId || !description){
            return next(new errorhandler("Please enter all fields", 400));
        }

        const newPlan = await plan.create({
            planName,
            price,
            durationInMonths,
            stripePriceId,
            description
        });

        res.status(201).json({
            success: true,
            data: newPlan,
            message: "Plan created successfully!",

        });

    }catch(error){

        return next(new errorhandler(error.message, 500));

    }




})


export const getAllPlans = catchAsyncError(async (req, res, next) => {
    const plans = await plan.findAll();
    res.status(200).json({
        success: true,
        plans,
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
