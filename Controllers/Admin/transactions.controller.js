import User from "../../Models/user.js";
import Subscription from "../../Models/subscription.model.js";
import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import errorhandler from "../../Utils/errorhandler.js";
import moment from "moment";
import plan from "../../Models/plan.model.js";
import personalDetails from "../../Models/personalDetails.model.js";
import Recommendation from "../../Models/recommendation.model.js";
export const getAllBillingInfo = catchAsyncError(async (req, res, next) => {
  try {
      const users = await User.findAll({
          attributes: ["userId", "email"],
          include: [
              {
                  model: personalDetails,
                  as: "personalDetails",
                  attributes: ["displayName"],
              },
              {
                  model: Recommendation,
                  as: "recommendations",
                  attributes: ["gender"],
              },
          ],
      });

      const billingData = await Promise.all(
          users.map(async (user) => {
              const latestSubscription = await Subscription.findOne({
                  where: { userId: user.userId },
                  order: [["createdAt", "DESC"]],
                  include: [
                      {
                          model: plan,
                          as: "plans",
                          attributes: ["planName", "price", "durationInMonths"],
                      },
                  ],
              });

              const displayName = user.personalDetails?.[0]?.displayName || "";
              const gender = user.recommendations?.[0]?.gender || "Not Specified";

              if (!latestSubscription) {
                  return {
                      userId: user.userId,
                      name: displayName,
                      gender,
                      email: user.email,
                      currentPlan: "Standard",
                      totalDays: 0,
                      expirationDate: "N/A",
                      planType: "N/A",
                      remainingDays: 0,
                      notifications: false,
                      price: "Free",
                  };
              }

              const planData = latestSubscription.plans;
              const today = moment().startOf("day");
              const startDate = moment(latestSubscription.startDate).startOf("day");
              const expirationDate = moment(latestSubscription.endDate).startOf("day");

              const totalDays = expirationDate.diff(startDate, "days");
              const remainingDays = expirationDate.diff(today, "days");
              const isYearly = planData?.durationInMonths >= 12;

              return {
                  userId: user.userId,
                  name: displayName,
                  gender,
                  email: user.email,
                  currentPlan: planData?.planName?.split(" ")[0] || "Unknown",
                  totalDays,
                  expirationDate: expirationDate.format("ll"),
                  planType: isYearly ? "Year" : "Month",
                  remainingDays,
                  notifications: remainingDays <= 6,
                  price: `${planData?.price || 0}`,
              };
          })
      );

      res.status(200).json({
          success: true,
          data: billingData,
          message: "All users' billing information fetched successfully!",
      });
  } catch (error) {
      return next(new errorhandler(error.message, 500));
  }
});



import { Op } from "sequelize";
import { Parser } from "json2csv"; 



export const getFinancialReport = catchAsyncError(async (req, res, next) => {
    try {
      const { period = "month", exportType } = req.query;
  
      const now = moment();
      let startDate;
      switch (period) {
        case "day":
          startDate = moment().startOf("day");
          break;
        case "week":
          startDate = moment().startOf("isoWeek");
          break;
        case "month":
          startDate = moment().startOf("month");
          break;
        default:
          return next(new errorhandler("Invalid period type", 400));
      }
  
      const subscriptions = await Subscription.findAll({
        where: {
          createdAt: {
            [Op.gte]: startDate.toDate(),
            [Op.lte]: now.toDate(),
          },
        },
        include: [
          {
            model: plan,
            as: "plans", // ✅ must match alias in your association
            attributes: ["planName", "price", "durationInMonths"],
          },
          {
            model: User,
            as: "users", // ✅ must match alias in your association
            attributes: ["userId", "email"],
            include: [
              {
                model: personalDetails,
                as: "personalDetails",
                attributes: ["firstName", "lastName", "displayName"],
              },
            ],
          },
        ],
      });
  
      const report = subscriptions.map((sub) => {
        const pd = sub.users?.personalDetails?.[0]; // first personal detail entry
        const fullName =
          pd?.displayName ||
          [pd?.firstName, pd?.lastName].filter(Boolean).join(" ") ||
          "";
  
        return {
          userId: sub.users?.userId,
          name: fullName,
          email: sub.users?.email,
          plan: sub.plans?.planName,
          price: sub.plans?.price,
          createdAt: moment(sub.createdAt).format("YYYY-MM-DD"),
        };
      });
  
      if (exportType === "csv") {
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(report);
        res.header("Content-Type", "text/csv");
        res.attachment(`financial_report_${period}_${now.format("YYYY-MM-DD")}.csv`);
        return res.send(csv);
      }
  
      res.status(200).json({
        success: true,
        period,
        count: report.length,
        totalRevenue: report.reduce((acc, r) => acc + (parseFloat(r.price) || 0), 0),
        data: report,
      });
    } catch (error) {
      return next(new errorhandler(error.message, 500));
    }
  });
  