import { enqueueNotification } from "./notificationQueue.service.js";
import User from "../../Models/user.js";

export async function addNotificationUid(req, res) {
  try {
    const { identifier } = req.body;

    if (!identifier || typeof identifier !== "string") {
      return res.status(400).json({
        success: false,
        message: "identifier is required (string)",
      });
    }

    let user = null;
    let detectedType = null;

    // 1. Try as Firebase UID (highest priority)
    user = await User.findOne({ where: { uid: identifier } });
    if (user) detectedType = "uid";

    // 2. Try as userId
    if (!user) {
      user = await User.findOne({ where: { userId: identifier } });
      if (user) detectedType = "userId";
    }

    // 3. Try as public_user_id
    if (!user) {
      user = await User.findOne({ where: { public_user_id: identifier } });
      if (user) detectedType = "public_user_id";
    }

    if (!user || !user.uid) {
      console.warn(`[Notification] User not found | identifier=${identifier}`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(
      `[Notification] Identifier resolved | type=${detectedType} | identifier=${identifier} | uid=${user.uid}`
    );

    const result = await enqueueNotification(user.uid);

    if (!result.ok) {
      console.error(
        `[Notification] Queue failed | uid=${user.uid} | code=${result.code}`
      );

      const status = result.code === "INVALID_UID" ? 400 : 503;
      return res.status(status).json({
        success: false,
        message:
          result.code === "INVALID_UID"
            ? "Invalid UID"
            : "Queue unavailable",
      });
    }

    console.log(`[Notification] Enqueued | uid=${user.uid}`);

    return res.status(200).json({
      success: true,
      message: "Queued",
    });
  } catch (err) {
    console.error(
      "[Notification] addNotificationUid error:",
      err?.message || err
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}