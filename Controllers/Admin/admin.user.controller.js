import { uploadCloudinary, deleteCloudinary } from '../../Utils/cloudinary.js';
import documentUpload from '../../Models/document.upload.js';
import errorhandler from '../../Utils/errorhandler.js';
import { catchAsyncError } from '../../Middlewares/catchAsyncError.js';
import connectDB from '../../Utils/db.js';
import { Op } from 'sequelize';
import sendEmail from '../../Utils/sendMail.js';

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
  Call
} from '../../Models/association.js';

const sequelize = connectDB(); // ✅ Ensure sequelize instance is available

// ✅ Completely delete user account and all associated data
export const deleteUserAccount = catchAsyncError(async (req, res, next) => {
  const { userId } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // ✅ Delete all associated data
    await Promise.all([
      Answer.destroy({ where: { userId }, transaction }),
      personalDetails.destroy({ where: { userId }, transaction }),
      otherDetails.destroy({ where: { userId }, transaction }),
      locationDetails.destroy({ where: { userId }, transaction }),
      await Call.destroy({ where: { userId }, transaction }),
      imageUpload.destroy({ where: { userId }, transaction }),
      qualificationDetails.destroy({ where: { userId }, transaction }),
      FavProfile.destroy({
        where: {
          [Op.or]: [
            { favoritingUserId: userId },
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
    ]);

    // ✅ Delete document uploads and Cloudinary files
    const document = await documentUpload.findOne({ where: { userId }, transaction });

    if (document) {
      const extractPublicId = (url) => {
        const parts = url.split('/');
        const fileWithExt = parts[parts.length - 1];
        const publicId = fileWithExt.substring(0, fileWithExt.lastIndexOf('.'));
        return publicId;
      };

      const frontPublicId = extractPublicId(document.documentFrontUrl);
      const backPublicId = extractPublicId(document.documentBackUrl);

      // ✅ Delete Cloudinary files and DB record
      await Promise.all([
        deleteCloudinary(frontPublicId),
        deleteCloudinary(backPublicId),
        document.destroy({ transaction })
      ]);
    }

    // ✅ Delete user account last
    await User.destroy({ where: { userId }, transaction });

    // ✅ Commit all changes
    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "User account and all associated data deleted successfully"
    });

  } catch (error) {
    // ❗ Safe rollback — only if still open
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
  const allowedFields = ["userId", "isVerifiedByAdmin", "remarks"];

  /* ------------------------------------------------
     1. Reject unexpected fields (security)
  --------------------------------------------------*/
  Object.keys(req.body).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete req.body[key];
    }
  });

  let { userId, isVerifiedByAdmin, remarks } = req.body;

  /* ------------------------------------------------
     2. Validate userId
  --------------------------------------------------*/
  if (!userId || typeof userId !== "string") {
    return next(new errorhandler("userId must be a valid UUID", 400));
  }

  if (!isUUID(userId)) {
    return next(new errorhandler("Invalid userId format", 400));
  }

  /* ------------------------------------------------
     3. Validate boolean strictly
  --------------------------------------------------*/
  if (typeof isVerifiedByAdmin !== "boolean") {
    return next(
      new errorhandler(
        "isVerifiedByAdmin must be boolean (true or false)",
        400
      )
    );
  }

  /* ------------------------------------------------
     4. Validate remarks type & content
  --------------------------------------------------*/
  if (remarks !== undefined) {
    if (typeof remarks !== "string") {
      return next(
        new errorhandler("remarks must be a string", 400)
      );
    }

    remarks = remarks.trim();

    // Only spaces / emojis
    if (remarks.length === 0) {
      remarks = null;
    }

    // Abuse protection
    if (remarks && remarks.length > 1000) {
      return next(
        new errorhandler("remarks cannot exceed 1000 characters", 400)
      );
    }
  }

  /* ------------------------------------------------
     5. Fetch user (lock row for safety)
  --------------------------------------------------*/
  const user = await User.findOne({
    where: { userId },
    lock: true,
  });

  if (!user) {
    return next(new errorhandler("User not found", 404));
  }

  /* ------------------------------------------------
     6. Optional business rule hooks
  --------------------------------------------------*/
  if (user.userStatus === false) {
    return next(
      new errorhandler(
        "Suspended users cannot be verified or unverified",
        403
      )
    );
  }

  /* ------------------------------------------------
     7. No-op detection
  --------------------------------------------------*/
  if (user.isVerifiedByAdmin === isVerifiedByAdmin) {
    return res.status(200).json({
      success: true,
      message: "No status change detected",
      data: {
        userId: user.userId,
        isVerifiedByAdmin: user.isVerifiedByAdmin,
        remarks: user.remarks,
      },
    });
  }

  /* ------------------------------------------------
     8. Transition rules
  --------------------------------------------------*/
  // VERIFIED → UNVERIFIED
  if (user.isVerifiedByAdmin === true && isVerifiedByAdmin === false) {
    if (!remarks) {
      return next(
        new errorhandler(
          "Remarks are mandatory when unverifying a user",
          400
        )
      );
    }
  }

  // UNVERIFIED → VERIFIED
  if (user.isVerifiedByAdmin === false && isVerifiedByAdmin === true) {
    // remarks optional, but do NOT erase existing unless explicitly given
    if (remarks === undefined) {
      remarks = user.remarks;
    }
  }

  /* ------------------------------------------------
     9. Apply atomic update
  --------------------------------------------------*/
  user.isVerifiedByAdmin = isVerifiedByAdmin;

  if (isVerifiedByAdmin === true) {
    user.remarks = remarks ?? user.remarks ?? null;
  } else {
    user.remarks = remarks;
  }

  await user.save();

  /* ------------------------------------------------
     10. Final response
  --------------------------------------------------*/
  res.status(200).json({
    success: true,
    message: isVerifiedByAdmin
      ? "User verified by admin"
      : "User unverified by admin",
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
