import User from "../../../Models/user.js";
import { firebaseAdmin } from "../../../Controllers/notification.controller.js";

import {
  lockQueueAndGetUids,
  clearProcessingQueue,
} from "../notificationQueue.service.js";

export async function processNotifications() {
  let uids = [];

  try {
    // 1. Lock + fetch
    try {
      uids = await lockQueueAndGetUids();
    } catch (err) {
      console.error("Worker: failed to lock/fetch queue:", err?.message || err);
      return; // don't proceed if queue is broken
    }

    if (!uids || !uids.length) {
      console.log("Worker: no pending notifications");
      return;
    }

    console.log(`Worker: fetched ${uids.length} UID(s)`);

    const CONCURRENCY = 10;
    let index = 0;

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    async function workerLoop() {
      while (true) {
        let i;

        // Prevent race condition on index
        try {
          i = index++;
        } catch (err) {
          console.error("Worker: index error:", err);
          break;
        }

        if (i >= uids.length) break;

        const uid = uids[i];

        try {
          if (!uid) {
            skipCount++;
            continue;
          }

          const user = await User.findOne({ where: { uid } });

          if (!user) {
            console.warn(`Worker: user not found | uid=${uid}`);
            skipCount++;
            continue;
          }

          if (!user.fcmToken) {
            console.warn(`Worker: missing FCM token | uid=${uid}`);
            skipCount++;
            continue;
          }

          const message = {
            token: user.fcmToken,
            notification: {
              title: "New Message",
              body: "Someone sent you a message",
            },
            data: {
              type: "new_message",
            },
          };

          try {
            await firebaseAdmin.messaging().send(message);
            successCount++;
          } catch (fcmErr) {
            errorCount++;

            console.error(
              `Worker: FCM send failed | uid=${uid} | error=${fcmErr?.message}`
            );

            // Optional: handle invalid token cleanup
            if (
              fcmErr?.code === "messaging/registration-token-not-registered"
            ) {
              console.warn(`Worker: removing invalid FCM token | uid=${uid}`);
              try {
                await user.update({ fcmToken: null });
              } catch (updateErr) {
                console.error(
                  `Worker: failed to clear token | uid=${uid}`,
                  updateErr
                );
              }
            }
          }
        } catch (err) {
          errorCount++;
          console.error(
            `Worker: unexpected error | uid=${uid} | error=${err?.message}`
          );
        }
      }
    }

    console.log(`Worker: starting ${CONCURRENCY} workers`);

    await Promise.all(
      Array.from({ length: CONCURRENCY }, () => workerLoop())
    );

    console.log(
      `Worker: done | success=${successCount}, skipped=${skipCount}, failed=${errorCount}`
    );
  } catch (err) {
    console.error("Worker: fatal error:", err?.message || err);
  } finally {
    try {
      await clearProcessingQueue();
      console.log("Worker: queue cleared");
    } catch (err) {
      console.error("Worker: failed to clear queue:", err?.message || err);
    }
  }
}