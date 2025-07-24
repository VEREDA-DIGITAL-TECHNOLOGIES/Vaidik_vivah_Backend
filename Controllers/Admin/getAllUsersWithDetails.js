import {
    User, Answer, personalDetails, otherDetails, locationDetails, imageUpload,
    qualificationDetails, FavProfile, happyStories, Connection, Plan, Subscription,
    Notification, ToggleSection, documentUpload,Recommendation
  } from "../../Models/association.js";
  import { Op } from "sequelize";
//   import Recommendation from "../../Models/recommendation.model.js"; // ✅
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
          {
            model: Recommendation,
            as: 'recommendations' // ✅ Include recommendations per user
          }
        ]
      });
  
      const blockedUsers = await Block.findAll();
      const reportedUsers = await Report.findAll();
  
      return res.status(200).json({
        success: true,
        data: users,
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
      User.count(), // total users
      User.count({
        where: {
          createdAt: {
            [Op.gte]: get7DaysAgoDate(),
          },
        },
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
    console.error("Error in getUserStats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
  

