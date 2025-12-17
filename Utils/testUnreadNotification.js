import admin from "firebase-admin";
import serviceAccount from "../config/serviceAccountKey.json" with { type: "json" };

function getDb() {
  let app;

  if (admin.apps.length === 0) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL:
        "https://ved-vivah-7ae12-default-rtdb.asia-southeast1.firebasedatabase.app",
    });
  } else {
    app = admin.apps[0];

    // 🔥 CRITICAL FIX: ensure databaseURL exists
    if (!app.options.databaseURL) {
      app = admin.initializeApp(
        {
          credential: admin.credential.cert(serviceAccount),
          databaseURL:
            "https://ved-vivah-7ae12-default-rtdb.asia-southeast1.firebasedatabase.app",
        },
        "database-app"
      );
    }
  }

  return app.database();
}


export async function testUnreadMessageNotification() {
  try {
    console.log("🚀 Background unread-message job started");

    const db = getDb(); // ✅ SAFE
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
