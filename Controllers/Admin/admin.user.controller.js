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
export const suspendUserAccount = catchAsyncError(async (req, res, next) => {
  const {userId} = req.body;

  const document = await documentUpload.findOne({ where: { userId } });
  
  if (!document) {
    return next(new errorhandler("No document found for this user", 404));
  }

  await document.update({ isVerified: "suspended" });

  res.status(200).json({
    success: true,
    message: "User account suspended successfully",
    data: {
      isVerified: "suspended"
    }
  });
});
export const updateDocumentStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;

   
    const validStatuses = ['pending', 'verified', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }


    const document = await documentUpload.findOne({ where: { userId } });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found for this user' });
    }


    document.isVerified = status;
    await document.save();

   
    if (status === 'verified') {

      const user = await User.findByPk(userId);
      const reco = await Recommendation.findOne({ where: { userId } });

      if (!user || !reco) {
        return res.status(404).json({ success: false, message: 'User or recommendation not found' });
      }

     
      const isWoman = reco.gender?.toLowerCase() === 'woman';

      if (isWoman) {
        user.usertype = 'Gold';
        reco.usertype = 'Gold';
        await user.save();
        await reco.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Verified. Document status and user type updated if applicable.',
        updatedDocument: document,
        updatedUser: user,
        updatedReco: reco
      });
    }


    return res.status(200).json({
      success: true,
      message: 'Document status updated',
      updatedDocument: document
    });

  } catch (err) {
    console.error('Error updating document status:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
