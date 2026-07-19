import { uploadCloudinary, deleteCloudinary } from '../../Utils/cloudinary.js';
import documentUpload from '../../Models/document.upload.js';
import errorhandler from '../../Utils/errorhandler.js';
import { catchAsyncError } from '../../Middlewares/catchAsyncError.js';
import connectDB from '../../Utils/db.js';
import { Op } from 'sequelize';
import sendEmail from '../../Utils/sendMail.js';
import { firebaseAdmin } from '../notification.controller.js';
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
  Subscription,
  Notification,
  ToggleSection,
  gayatri,
  Recommendation,
  Call,UserWhatsApp
} from '../../Models/association.js';

const sequelize = connectDB(); // ✅ Ensure sequelize instance is available

// ✅ Completely delete user account and all associated data
export const deleteUserAccount = catchAsyncError(async (req, res, next) => {
  const { userId } = req.body;

  const transaction = await sequelize.transaction();

  let firebaseUid = null;

  try {
    /* ================= GET USER ================= */

    const user = await User.findOne({ where: { userId }, transaction });

    if (!user) {
      throw new Error("User not found");
    }

    firebaseUid = user.uid; // 🔥 your firebase UID

    /* ================= DELETE ASSOCIATED DATA ================= */

    await Promise.all([
      Answer.destroy({ where: { userId }, transaction }),
      personalDetails.destroy({ where: { userId }, transaction }),
      otherDetails.destroy({ where: { userId }, transaction }),
      locationDetails.destroy({ where: { userId }, transaction }),
      Call.destroy({ where: { userId }, transaction }),
      imageUpload.destroy({ where: { userId }, transaction }),
      qualificationDetails.destroy({ where: { userId }, transaction }),

      FavProfile.destroy({
        where: {
          [Op.or]: [
            { userId },
            { favoritedUserId: userId }
          ]
        },
        transaction
      }),

      happyStories.destroy({ where: { userId }, transaction }),

      Connection.destroy({
        where: {
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        transaction
      }),

      Subscription.destroy({ where: { userId }, transaction }),
      Notification.destroy({ where: { userId }, transaction }),
      ToggleSection.destroy({ where: { userId }, transaction }),
      gayatri.destroy({ where: { userId }, transaction }),
      Recommendation.destroy({ where: { userId }, transaction }),

      // ✅ NEW: WhatsApp delete
      UserWhatsApp.destroy({ where: { userId }, transaction }),
    ]);

    /* ================= CLOUDINARY ================= */

    const document = await documentUpload.findOne({ where: { userId }, transaction });

    if (document) {
      const extractPublicId = (url) => {
        const parts = url.split('/');
        const fileWithExt = parts[parts.length - 1];
        return fileWithExt.substring(0, fileWithExt.lastIndexOf('.'));
      };

      await Promise.all([
        deleteCloudinary(extractPublicId(document.documentFrontUrl)),
        deleteCloudinary(extractPublicId(document.documentBackUrl)),
        document.destroy({ transaction })
      ]);
    }

    /* ================= DELETE USER ================= */

    await User.destroy({ where: { userId }, transaction });

    /* ================= COMMIT ================= */

    await transaction.commit();

    /* ================= FIREBASE DELETE ================= */

    if (firebaseUid) {
      try {
        await firebaseAdmin.auth().deleteUser(firebaseUid);
        console.log("🔥 Firebase user deleted:", firebaseUid);
      } catch (err) {
        console.error("⚠️ Firebase delete failed:", err.message);
      }

      /* ================= OPTIONAL: DELETE CHAT ================= */

      try {
        await firebaseAdmin.database().ref(`messages/${firebaseUid}`).remove();
        await firebaseAdmin.database().ref(`calls/${firebaseUid}`).remove();
        console.log("🔥 Firebase chat data deleted");
      } catch (err) {
        console.error("⚠️ Firebase DB cleanup failed:", err.message);
      }
    }

    /* ================= RESPONSE ================= */

    res.status(200).json({
      success: true,
      message: "User, WhatsApp, Firebase Auth & chat data deleted successfully",
    });

  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("❌ Delete user error:", error);

    return next(new errorhandler("Failed to delete user account", 500));
  }
});


// Suspend user account by marking documents as suspended
// Suspend user account by marking documents as suspended
export const suspendUserAccount = catchAsyncError(async (req, res, next) => {
  console.log("---- [START] suspendUserAccount ----");

  const { userId } = req.body;
  console.log("Incoming request data:", { userId });

  try {
    const document = await documentUpload.findOne({ where: { userId } });
    console.log("Document lookup result:", document ? "Found" : "Not found");

    if (!document) {
      console.log("No document found for userId:", userId);
      return next(new errorhandler("No document found for this user", 404));
    }

    await document.update({ isVerified: "suspended" });
    console.log(`Document for userId ${userId} updated to status: suspended`);

    res.status(200).json({
      success: true,
      message: "User account suspended successfully",
      data: { isVerified: "suspended" },
    });

    console.log("Response sent successfully for userId:", userId);
    console.log("---- [END] suspendUserAccount ----");
  } catch (error) {
    console.error("Error in suspendUserAccount:", error);
    next(error);
  }
});



export const updateDocumentStatus = async (req, res) => {
  const { userId, status } = req.body;

  try {
    const validStatuses = ["pending", "verified", "rejected", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    // Fetch document
    const document = await documentUpload.findOne({ where: { userId } });
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Update document status
    document.isVerified = status;
    await document.save();

    // Handle verification flow
    if (status === "verified") {
      const user = await User.findByPk(userId);
      const reco = await Recommendation.findOne({ where: { userId } });

      if (!user || !reco) {
        return res.status(404).json({ success: false, message: "User or recommendation not found" });
      }

      const rawGender = reco.gender || "";
      const genderValue = rawGender.trim().toLowerCase();
      const isWoman = genderValue === "woman";

      // If woman → upgrade to Gold
      if (isWoman) {
        user.usertype = "Gold";
        reco.usertype = "Gold";
        await user.save();
        await reco.save();

        // Send admin email for Gold upgrade
        try {
          await sendEmail({
            email: "info@vedvivah.com",
            subject: `🌟 Gold Membership Upgrade - ${user.fullname || "User"}`,
            template: "goldUpgradeAdminNotification.ejs",
            data: {
              name: user.fullname || "User",
              email: user.email || "N/A",
              userId: user.userId,
              updatedAt: new Date().toLocaleString(),
            },
          });
        } catch (err) {
          // Silently ignore admin email failure
        }
      }

      // Send user notification email for approval
      try {
        await sendEmail({
          email: user.email,
          subject: " Your Profile Has Been Successfully Verified",
          template: "documentApprovedUser.ejs",
          data: {
            name: user.fullname || "Dear Member",
            userId: user.userId,
            usertype: user.usertype,
            updatedAt: new Date().toLocaleString(),
          },
        });
      } catch (err) {
        // Ignore user email failure
      }

      return res.status(200).json({
        success: true,
        message: "Verified successfully. Notification sent to user.",
        updatedDocument: document,
        updatedUser: user,
        updatedReco: reco,
      });
    }

    // Non-verified statuses
    return res.status(200).json({
      success: true,
      message: "Document status updated successfully.",
      updatedDocument: document,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};






export const getUserDocumentStatus = catchAsyncError(async (req, res, next) => {
  // Fetch all users including their document status
  const users = await User.findAll({
    attributes: ['userId', 'email'], // you can add more fields like name if available
    include: [
      {
        model: documentUpload,
        as: 'documents',
        attributes: ['id', 'documentType', 'isVerified'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  if (!users || users.length === 0) {
    return next(new errorhandler("No users found", 404));
  }

  // Transform data: flatten the document status for easier frontend display
  const formatted = users.map(user => ({
    userId: user.userId,
    username: user.email,
    documents: user.documents.map(doc => ({
      documentType: doc.documentType,
      status: doc.isVerified,
    })),
    overallStatus:
      user.documents.length === 0
        ? "no documents"
        : user.documents.every(doc => doc.isVerified === "verified")
        ? "verified"
        : user.documents.some(doc => doc.isVerified === "rejected")
        ? "rejected"
        : user.documents.some(doc => doc.isVerified === "suspended")
        ? "suspended"
        : "pending",
  }));

  res.status(200).json({
    success: true,
    total: formatted.length,
    data: formatted,
  });
});





export const verifyUserByAdmin = catchAsyncError(async (req, res, next) => {
  const { userId, isVerifiedByAdmin, remarks } = req.body;

  /* ----------------------------------
     1. Basic validation
  ---------------------------------- */
  if (!userId || typeof isVerifiedByAdmin !== "boolean") {
    return next(
      new errorhandler("userId and isVerifiedByAdmin are required", 400)
    );
  }

  /* ----------------------------------
     2. Find user
  ---------------------------------- */
  const user = await User.findOne({ where: { userId } });

  if (!user) {
    return next(new errorhandler("User not found", 404));
  }

  /* ----------------------------------
     3. Update verification status
  ---------------------------------- */
  user.isVerifiedByAdmin = isVerifiedByAdmin;

  /* ----------------------------------
     4. Remarks logic (NORMAL behavior)
     - Optional
     - Only update if provided
  ---------------------------------- */
  if (remarks !== undefined) {
    if (typeof remarks !== "string") {
      return next(new errorhandler("remarks must be a string", 400));
    }

    const trimmed = remarks.trim();
    user.remarks = trimmed.length > 0 ? trimmed : null;
  }
  // ❗ If remarks is NOT sent → do NOTHING (keep old remarks)

  await user.save();

  /* ----------------------------------
     5. Response
  ---------------------------------- */
  res.status(200).json({
    success: true,
    message: isVerifiedByAdmin
      ? "User verified successfully"
      : "User unverified successfully",
    data: {
      userId: user.userId,
      isVerifiedByAdmin: user.isVerifiedByAdmin,
      remarks: user.remarks,
    },
  });
});







export const getAllUsersVerificationStatus = catchAsyncError(
  async (req, res, next) => {

    /* ------------------------------------------------
       1. Pagination (optional)
    --------------------------------------------------*/
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;

    /* ------------------------------------------------
       2. Fetch users
    --------------------------------------------------*/
    const { rows: users, count } = await User.findAndCountAll({
      attributes: [
        "userId",
        "email",
        "isVerifiedByAdmin",
        "remarks",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    /* ------------------------------------------------
       3. Safe empty response
    --------------------------------------------------*/
    if (!users || users.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        page,
        limit,
        data: [],
      });
    }

    /* ------------------------------------------------
       4. Normalize output
    --------------------------------------------------*/
    const data = users.map(user => ({
      userId: user.userId,
      email: user.email,
      isVerifiedByAdmin: user.isVerifiedByAdmin,
      remarks: user.remarks || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.status(200).json({
      success: true,
      total: count,
      page,
      limit,
      data,
    });
  }
);
