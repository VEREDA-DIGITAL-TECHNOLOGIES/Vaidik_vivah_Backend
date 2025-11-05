import { uploadCloudinary, deleteCloudinary } from '../../Utils/cloudinary.js';
import documentUpload from '../../Models/document.upload.js';
import errorhandler from '../../Utils/errorhandler.js';
import { catchAsyncError } from '../../Middlewares/catchAsyncError.js';
import connectDB from '../../Utils/db.js';
import { Op } from 'sequelize';

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
    // 🧩 Find the document
    const document = await documentUpload.findOne({ where: { userId } });
    console.log("Document lookup result:", document ? "Found" : "Not found");

    if (!document) {
      console.log("No document found for userId:", userId);
      return next(new errorhandler("No document found for this user", 404));
    }

    // 🧩 Attempt update
    try {
      await document.update({ isVerified: "suspended" });
      console.log(`✅ Document for userId ${userId} updated to status: suspended`);

      return res.status(200).json({
        success: true,
        message: "User account suspended successfully",
        data: { isVerified: "suspended" },
      });
    } catch (updateErr) {
      console.error("⚠️ Update failed, likely due to ENUM mismatch:", updateErr.message);

      // 🧩 Check the actual ENUM definition from the DB
      const [columnInfo] = await sequelize.query(
        `SHOW COLUMNS FROM documentUploads LIKE 'isVerified';`,
        { type: QueryTypes.SHOWCOLUMNS }
      );

      const columnType = columnInfo?.Type || "unknown";
      console.log("🧾 Current ENUM definition:", columnType);

      return res.status(500).json({
        success: false,
        message:
          "Failed to update user account. The 'suspended' status might not exist in ENUM.",
        currentEnumType: columnType,
        error: updateErr.message,
      });
    }
  } catch (error) {
    console.error("❌ Error in suspendUserAccount:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    console.log("---- [END] suspendUserAccount ----");
  }
});


// Update document status and manage related user data
export const updateDocumentStatus = async (req, res) => {
  console.log("---- [START] updateDocumentStatus ----");

  const { userId, status } = req.body;
  console.log("Incoming request data:", { userId, status });

  try {
    const validStatuses = ["pending", "verified", "rejected", "suspended"];
    if (!validStatuses.includes(status)) {
      console.log("Invalid status value received:", status);
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const document = await documentUpload.findOne({ where: { userId } });
    console.log("Document lookup result:", document ? "Found" : "Not found");

    if (!document) {
      console.log("No document found for userId:", userId);
      return res
        .status(404)
        .json({ success: false, message: "Document not found for this user" });
    }

    document.isVerified = status;
    await document.save();
    console.log(`Document for userId ${userId} updated to status: ${status}`);

    // If document is verified, update user and recommendation records
    if (status === "verified") {
      console.log("Document verified. Fetching related User and Recommendation records...");

      const user = await User.findByPk(userId);
      const reco = await Recommendation.findOne({ where: { userId } });

      console.log("User lookup:", user ? "Found" : "Not found");
      console.log("Recommendation lookup:", reco ? "Found" : "Not found");

      if (!user || !reco) {
        console.log("User or Recommendation record missing for userId:", userId);
        return res
          .status(404)
          .json({ success: false, message: "User or recommendation not found" });
      }

      const isWoman = reco.gender?.toLowerCase() === "woman";
      console.log("Gender check result:", reco.gender, "=> isWoman =", isWoman);

      if (isWoman) {
        console.log("Assigning Gold usertype for userId:", userId);
        user.usertype = "Gold";
        reco.usertype = "Gold";
        await user.save();
        await reco.save();
      } else {
        console.log("No usertype change required for userId:", userId);
      }

      console.log("Successfully updated document, user, and recommendation records.");

      return res.status(200).json({
        success: true,
        message: "Verified. Document status and user type updated if applicable.",
        updatedDocument: document,
        updatedUser: user,
        updatedReco: reco,
      });
    }

    console.log("Document status updated successfully (non-verified path).");
    res.status(200).json({
      success: true,
      message: "Document status updated",
      updatedDocument: document,
    });

    console.log("Response sent successfully for userId:", userId);
    console.log("---- [END] updateDocumentStatus ----");
  } catch (err) {
    console.error("Error updating document status:", err);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

