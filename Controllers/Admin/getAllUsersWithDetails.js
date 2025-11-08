import {
  User, Answer, personalDetails, otherDetails, locationDetails, imageUpload,
  qualificationDetails, FavProfile, happyStories, Connection, Plan, Subscription,
  Notification, ToggleSection, documentUpload, Recommendation
} from "../../Models/association.js";
import { Op } from "sequelize";
import Block from "../../Models/block.model.js";
import Report from "../../Models/report.model.js";

export const getAllUsersWithDetails = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: personalDetails, as: 'personalDetails' },
        { model: qualificationDetails, as: 'qualificationDetails' },
        { model: locationDetails, as: 'locationDetails' },
        { model: otherDetails, as: 'otherDetails' },
        { model: imageUpload, as: 'imageUpload' },
        { model: documentUpload, as: 'documents' },
        {
          model: Subscription,
          as: 'subscriptions',
          include: [{ model: Plan, as: 'plans' }]
        },
        {
          model: FavProfile,
          as: 'FavoritingProfiles',
          include: [{ model: User, as: 'FavoritedUser' }]
        },
        {
          model: Connection,
          as: 'SentConnections',
          include: [{ model: User, as: 'Receiver' }]
        },
        { model: Recommendation, as: 'recommendations' }
      ]
    });

    // Compute subscription days left for each user (default to 0 if none)
    const usersWithDaysLeft = users.map(user => {
      const subs = user.subscriptions || [];
      const activeSub = subs
        .filter(sub => sub.status === "Active" && sub.endDate)
        .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0]; // latest active

      // If no active subscription, default to 0 days left
      const daysLeft = activeSub
        ? Math.max(Math.ceil((new Date(activeSub.endDate) - new Date()) / (1000 * 60 * 60 * 24)), 0)
        : 0;

      return { ...user.toJSON(), subscriptionDaysLeft: daysLeft };
    });

    const blockedUsers = await Block.findAll();
    const reportedUsers = await Report.findAll();

    return res.status(200).json({
      success: true,
      data: usersWithDaysLeft,
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

const get7DaysAgoDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
};

export const getUserStatus = async (req, res) => {
  try {
    const [totalUsers, newUsers, standardUsers, goldUsers, platinumUsers, diamondUsers] = await Promise.all([
      User.count(),
      User.count({
        where: { createdAt: { [Op.gte]: get7DaysAgoDate() } },
      }),
      User.count({ where: { usertype: "Standard" } }),
      User.count({ where: { usertype: "Gold" } }),
      User.count({ where: { usertype: "Platinum" } }),
      User.count({ where: { usertype: "Diamond" } }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        newUsersLast7Days: newUsers,
        standardUsers,
        goldUsers,
        platinumUsers,
        diamondUsers,
      },
    });
  } catch (error) {
    console.error("Error in getUserStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
