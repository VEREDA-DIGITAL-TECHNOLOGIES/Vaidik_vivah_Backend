import Block from '../Models/block.model.js';
import { catchAsyncError } from '../Middlewares/catchAsyncError.js';
import errorhandler from '../Utils/errorhandler.js';

// Block a user
export const blockUser = catchAsyncError(async (req, res, next) => {
  const blockerUserId = req.user.userId;
  const { blockedUserId } = req.body;

  if (!blockedUserId) {
    return next(new errorhandler("Blocked user ID is required", 400));
  }

  const alreadyBlocked = await Block.findOne({ where: { blockerUserId, blockedUserId } });
  if (alreadyBlocked) {
    return next(new errorhandler("User already blocked", 400));
  }

  const block = await Block.create({ blockerUserId, blockedUserId });

  res.status(201).json({
    success: true,
    message: "User blocked successfully",
    data: block,
  });
});

// Unblock a user
export const unblockUser = catchAsyncError(async (req, res, next) => {
  const blockerUserId = req.user.userId;
  const { blockedUserId } = req.body;

  const blockedEntry = await Block.findOne({ where: { blockerUserId, blockedUserId } });
  if (!blockedEntry) {
    return next(new errorhandler("User is not blocked", 404));
  }

  await blockedEntry.destroy();

  res.status(200).json({
    success: true,
    message: "User unblocked successfully",
  });
});

// Get list of blocked users
// Get list of users you blocked AND users who blocked you
export const getBlockedList = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;
  
    // 1. Users you have blocked
    const blocked = await Block.findAll({
      where: { blockerUserId: userId },
      attributes: ['blockedUserId'],
    });
  
    // 2. Users who have blocked you
    const blockedBy = await Block.findAll({
      where: { blockedUserId: userId },
      attributes: ['blockerUserId'],
    });
  
    res.status(200).json({
      success: true,
      message: "Blocked users fetched successfully",
      data: {
        blockedUserIds: blocked.map(entry => entry.blockedUserId),
        blockedByUserIds: blockedBy.map(entry => entry.blockerUserId),
      },
    });
  });
  
