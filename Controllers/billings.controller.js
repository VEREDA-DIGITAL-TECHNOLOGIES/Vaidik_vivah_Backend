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
  
      const user = await User.findOne({ where: { userId } });
      if (!user) {
        return next(new errorhandler("User not found", 404));
      }
  
      const subscriptions = await Subscription.findAll({ where: { userId } });

      if (subscriptions.length === 0) {
        return next(new errorhandler("No subscriptions found", 404));
      }

      // Find the latest subscription
      const planIds = subscriptions.map((subscription) => subscription.planId);

      const latestSubscription = subscriptions.reduce((prev, curr) => {
        return prev.endDate ? (prev.endDate > curr.endDate ? prev : curr) : curr;
      });

      const currentPlan = await Plan.findOne({ where: { planId: { [Op.in]: planIds } } });

      if (!currentPlan) {
        return next(new errorhandler("Plan not found", 404));
      }

      let remainingDays;
      

      const enddate = moment(latestSubscription.endDate);
      if (latestSubscription.endDate) {
        const activeUntil = moment(latestSubscription.endDate);
        const today = moment();

        if (activeUntil.isValid()) {
          remainingDays = activeUntil.diff(today, 'days');
        } else {
          return next(new errorhandler("Invalid expiration date format", 500));
        }

      } else {
        return next(new errorhandler("Expiration date is missing", 500));
      }

      const totalDays = Math.floor((currentPlan.durationInMonths / 12) * 365.25);

      const isYearly = currentPlan.durationInMonths >= 12;


      const data = {
        currentPlan: currentPlan.planName.split(" ")[0],
        totalDays: totalDays,
        expirationDate: enddate.format('ll'),
        planType: isYearly ? "Year" : "Month",
        notifications: remainingDays <= 6 ,
        remainingDays,
        price:"$"+ currentPlan.price,
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






