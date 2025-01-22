import Plan from "../Models/plan.model.js";
import User from "../Models/user.js";
import Subscription from "../Models/subscription.model.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import { Op } from "sequelize";
import moment from "moment";


export const getBillingInfo = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Fetch the user
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return next(new errorhandler("User not found", 404));
    }

    // Fetch the latest subscription for the user
    const latestSubscription = await Subscription.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!latestSubscription) {
      return next(new errorhandler("No subscriptions found", 404));
    }

    // Fetch the plan for the latest subscription
    const currentPlan = await Plan.findOne({
      where: { planId: latestSubscription.planId },
    });

    if (!currentPlan) {
      return next(new errorhandler("Plan not found", 404));
    }

    // Calculate remaining days
    const today = moment();
    const expirationDate = moment(latestSubscription.endDate);

    if (!expirationDate.isValid()) {
      return next(new errorhandler("Invalid expiration date format", 500));
    }

    const remainingDays = expirationDate.diff(today, "days");
    const totalDays = Math.floor((currentPlan.durationInMonths / 12) * 365.25);
    const isYearly = currentPlan.durationInMonths >= 12;

    // Build response data
    const data = {
      currentPlan: currentPlan.planName.split(" ")[0],
      totalDays,
      expirationDate: expirationDate.format("ll"),
      planType: isYearly ? "Year" : "Month",
      notifications: remainingDays <= 6,
      remainingDays,
      price: `$${currentPlan.price}`,
    };

    return res.status(200).json({
      success: true,
      data,
      message: "Billing information fetched successfully!",
    });
  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
});






