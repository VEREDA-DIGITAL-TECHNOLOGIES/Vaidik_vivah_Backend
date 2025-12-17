import {
  User,
  Answer,
  personalDetails,
  otherDetails,
  locationDetails,
  imageUpload,
  qualificationDetails,
  FavProfile,
  happyStories,
  Connection,
  Plan,
  Subscription,
  Notification,
  ToggleSection,
  documentUpload,
  Recommendation
} from "../../Models/association.js";

import { Op } from "sequelize";
import Block from "../../Models/block.model.js";
import Report from "../../Models/report.model.js";
import calculateCompletion from "../../Utils/calculateCompletion.js";

/* -------------------------------------------------------
   GET ALL USERS WITH FULL DETAILS (ADMIN)
------------------------------------------------------- */
export const getAllUsersWithDetails = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "userId",
        "public_user_id", // ✅ SAFE PUBLIC ID
        "email",
        "usertype",
        "userStatus",
        "role",
        "isVerified",
        "isVerifiedByAdmin",

        // ✅ ADDED (DISABLE SUPPORT)
        "isDisabledByAdmin",
        "reasonForDisabledByAdmin",

        "createdAt",
        "updatedAt"
      ],
      include: [
        { model: personalDetails, as: "personalDetails" },
        { model: qualificationDetails, as: "qualificationDetails" },
        { model: locationDetails, as: "locationDetails" },
        { model: otherDetails, as: "otherDetails" },
        { model: imageUpload, as: "imageUpload" },
        { model: documentUpload, as: "documents" },
        {
          model: Subscription,
          as: "subscriptions",
          include: [{ model: Plan, as: "plans" }]
        },
        {
          model: FavProfile,
          as: "FavoritingProfiles",
          include: [{ model: User, as: "FavoritedUser" }]
        },
        {
          model: Connection,
          as: "SentConnections",
          include: [{ model: User, as: "Receiver" }]
        },
        { model: Recommendation, as: "recommendations" }
      ]
    });

    const usersWithExtraInfo = await Promise.all(
      users.map(async (user) => {
        const userJSON = user.toJSON();

        /* ---------- Subscription Days Left ---------- */
        const subs = userJSON.subscriptions || [];
        const activeSub = subs
          .filter(sub => sub.status === "Active" && sub.endDate)
          .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];

        const subscriptionDaysLeft = activeSub
          ? Math.max(
              Math.ceil(
                (new Date(activeSub.endDate) - new Date()) /
                  (1000 * 60 * 60 * 24)
              ),
              0
            )
          : 0;

        /* ---------- Profile Completion ---------- */
        const personalData = userJSON.personalDetails?.[0] || {};
        const qualificationDetailsData = userJSON.qualificationDetails?.[0] || {};
        const locationDetailsData = userJSON.locationDetails?.[0] || {};
        const otherDetailsData = userJSON.otherDetails?.[0] || {};

        const basic_lifestyle = await Answer.findOne({
          where: { userId: userJSON.userId, questionId: 8 }
        });

        const gender = await Answer.findOne({
          where: { userId: userJSON.userId }
        });

        const age = await Answer.findOne({
          where: { userId: userJSON.userId, questionId: 4 }
        });

        const postedby = await Answer.findOne({
          where: { userId: userJSON.userId, questionId: 3 }
        });

        const data = {
          basic_and_lifestye: {
            firstName: personalData.firstName,
            lastName: personalData.lastName,
            displayName: personalData.displayName,
            gender: gender?.answer,
            age: age?.answer,
            about: personalData.aboutYourSelf,
            religion: otherDetailsData.religion,
            maritalStatus: personalData.maritalStatus,
            numberOfChildren: personalData.numberOfChildren,
            postedBy: postedby?.answer
          },
          family_details: {
            fatherOccupation: otherDetailsData.fatherOccupation,
            motherOccupation: otherDetailsData.motherOccupation,
            numberOfSiblings: otherDetailsData.numberOfSiblings,
            livingWithFamily: otherDetailsData.livingWithFamily
          },
          personal_background: {
            height: otherDetailsData.height,
            weight: otherDetailsData.weight,
            bodyType: otherDetailsData.bodyType,
            language: otherDetailsData.language,
            smokingHabbit: otherDetailsData.smokingHabbit,
            drinkingHabbit: otherDetailsData.drinkingHabbit,
            diet: otherDetailsData.diet,
            complexion: otherDetailsData.complexion
          },
          religious_background: {
            religion: otherDetailsData.religion,
            community: otherDetailsData.community,
            subCommunity: otherDetailsData.subCommunity,
            gothra: otherDetailsData.gothra,
            timeOfBirth: otherDetailsData.timeOfBirth,
            dateOfBirth: otherDetailsData.dateOfBirth,
            placeOfBirth: otherDetailsData.placeOfBirth,
            motherTongue: otherDetailsData.motherTongue
          },
          location_background: {
            currentLocation: locationDetailsData.currentLocation,
            cityOfResidence: locationDetailsData.cityOfResidence || "",
            nationality: locationDetailsData.nationality,
            citizenShip: locationDetailsData.citizenShip,
            residencyVisaStatus: locationDetailsData.residencyVisaStatus
          },
          education_and_financial: {
            qualification: qualificationDetailsData.qualification,
            education: qualificationDetailsData.occupation,
            workingStatus: qualificationDetailsData.currentWorkingStatus,
            income: qualificationDetailsData.income
          },
          interest_and_hobbies: basic_lifestyle?.answer || null
        };

        const profileCompletionPercentage = calculateCompletion(data);

        return {
          ...userJSON, // ✅ includes public_user_id, isDisabledByAdmin, reasonForDisabledByAdmin
          subscriptionDaysLeft,
          profileCompletionPercentage
        };
      })
    );

    const blockedUsers = await Block.findAll();
    const reportedUsers = await Report.findAll();

    return res.status(200).json({
      success: true,
      data: usersWithExtraInfo,
      blockedUsers,
      reportedUsers
    });
  } catch (error) {
    console.error("Error fetching full user data:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

/* -------------------------------------------------------
   USER STATS
------------------------------------------------------- */
const get7DaysAgoDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
};

export const getUserStatus = async (req, res) => {
  try {
    const [
      totalUsers,
      newUsers,
      standardUsers,
      goldUsers,
      platinumUsers,
      diamondUsers
    ] = await Promise.all([
      User.count(),
      User.count({ where: { createdAt: { [Op.gte]: get7DaysAgoDate() } } }),
      User.count({ where: { usertype: "Standard" } }),
      User.count({ where: { usertype: "Gold" } }),
      User.count({ where: { usertype: "Platinum" } }),
      User.count({ where: { usertype: "Diamond" } })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        newUsersLast7Days: newUsers,
        standardUsers,
        goldUsers,
        platinumUsers,
        diamondUsers
      }
    });
  } catch (error) {
    console.error("Error in getUserStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";

export const disableUserByAdmin = catchAsyncError(async (req, res, next) => {
  const { public_user_id } = req.params;
  const { reason } = req.body; // optional

  const user = await User.findOne({ where: { public_user_id } });

  if (!user) {
    return next(new errorhandler("User not found", 404));
  }

  if (user.isDisabledByAdmin) {
    return next(new errorhandler("User is already disabled", 400));
  }

  user.isDisabledByAdmin = true;
  user.reasonForDisabledByAdmin = reason || null;

  // ❗ prevent password rehash
  await user.save({ hooks: false });

  return res.status(200).json({
    success: true,
    message: "User disabled successfully",
    data: {
      public_user_id: user.public_user_id,
      isDisabledByAdmin: true,
      reasonForDisabledByAdmin: user.reasonForDisabledByAdmin,
    },
  });
});

/* =====================================================
   ENABLE USER (ADMIN)
   ===================================================== */
export const enableUserByAdmin = catchAsyncError(async (req, res, next) => {
  const { public_user_id } = req.params;

  const user = await User.findOne({ where: { public_user_id } });

  if (!user) {
    return next(new errorhandler("User not found", 404));
  }

  if (!user.isDisabledByAdmin) {
    return next(new errorhandler("User is already active", 400));
  }

  user.isDisabledByAdmin = false;
  user.reasonForDisabledByAdmin = null;

  // ❗ prevent password rehash
  await user.save({ hooks: false });

  return res.status(200).json({
    success: true,
    message: "User enabled successfully",
    data: {
      public_user_id: user.public_user_id,
      isDisabledByAdmin: false,
    },
  });
});