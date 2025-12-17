import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import serviceAccount from "../config/serviceAccountKey.json" assert { type: "json" };

// 🔥 Init Firebase ONLY ONCE
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://ved-vivah-7ae12-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

const db = admin.database();

export async function testUnreadMessageNotification() {
  try {
    console.log("🚀 Background unread-message job started");

    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();

    const messagesSnap = await db.ref("messages").once("value");
    if (!messagesSnap.exists()) {
      console.log("ℹ️ No messages found");
      return;
    }

    const messages = messagesSnap.val();

    for (const senderId in messages) {
      for (const receiverId in messages[senderId]) {
        for (const messageId in messages[senderId][receiverId]) {
          const msg = messages[senderId][receiverId][messageId];

          if (msg.seen === true) continue;
          if (msg.notified === true) continue;
          if (!msg.timestamp) continue;

          const msgTime = new Date(msg.timestamp).getTime();
          if (isNaN(msgTime)) continue;
          if (now - msgTime < ONE_HOUR) continue;

          const tokenSnap = await db
            .ref(`users/${receiverId}/fcmToken`)
            .once("value");

          const fcmToken = tokenSnap.val();
          if (!fcmToken) continue;

          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: "Unread Message",
              body: "You have an unread message",
            },
            data: {
              senderId,
              messageId,
              type: "background_test",
            },
          });

          await db
            .ref(`messages/${senderId}/${receiverId}/${messageId}`)
            .update({
              notified: true,
              notifiedAt: new Date().toISOString(),
            });
        }
      }
    }

    console.log("✅ Background unread-message job completed");
  } catch (err) {
    console.error("🔥 Background unread-message job failed:", err);
  }
}
