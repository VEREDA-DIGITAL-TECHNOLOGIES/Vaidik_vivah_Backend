import admin from "firebase-admin";
import dotenv from "dotenv";
import sendEmail from './sendMail.js'
import { getSenderAndReceiver } from "../Utils/userLookup.js";

dotenv.config();

// ------------------- SERVICE ACCOUNT -------------------
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

// ------------------- INITIALIZE FIREBASE -------------------
let db;
try {
  const app = !admin.apps.length
    ? admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      })
    : admin.app();

  db = admin.database();
  console.log("✅ Firebase initialized successfully!");
} catch (err) {
  console.error("❌ Firebase initialization failed:", err);
  db = null;
}

// ------------------- ADD TO QUEUE -------------------
async function addToQueue(receiverUid, senderUid, messageRef) {
  if (!db || !receiverUid || !senderUid) return;

  try {
    await db.ref(`notificationQueue/${receiverUid}/${senderUid}`).set({
      addedAt: Date.now(),
    });

    if (messageRef) {
      await messageRef.update({ notified: true });
    }

    console.log(
      `🔹 Added to queue: receiver=${receiverUid}, sender=${senderUid}`
    );
  } catch (err) {
    console.error("❌ Error adding to queue:", err);
  }
}

// ------------------- SEND NOTIFICATIONS (PUSH + EMAIL) -------------------
async function sendNotifications(receiverUid, senderUids) {
  if (!db || !senderUids.length) return;

  try {
    // 🔹 Use first sender for display
    const primarySenderUid = senderUids[0];

    const { sender, receiver } =
      await getSenderAndReceiver(primarySenderUid, receiverUid);

    // ---------------- PUSH NOTIFICATION ----------------
    if (receiver.fcmToken) {
      await admin.messaging().send({
        token: receiver.fcmToken,
        notification: {
          title: "New Message on VedVivah",
          body: `${sender.public_user_id} sent you a message`,
        },
        data: {
          senderUid: sender.uid,
          receiverUid: receiver.uid,
          senderPublicId: sender.public_user_id,
        },
      });

      console.log(`🔔 Push sent to ${receiver.public_user_id}`);
    } else {
      console.warn(`⚠️ No FCM token for ${receiver.public_user_id}`);
    }

    // ---------------- EMAIL NOTIFICATION ----------------
    await sendEmail({
      email: receiver.email,
      subject: "💌 You received a new message on VedVivah",
      template: "newMessage.ejs",
      data: {
        senderName: sender.name || "VedVivah Member",
        senderId: sender.public_user_id,
        receiverName: receiver.name || "",
        profilePic:
          sender.profileImage ||
          "https://admin.vedvivah.com/assets/default-user.png",
      },
    });

    // ---------------- CLEAR QUEUE ----------------
    await db.ref(`notificationQueue/${receiverUid}`).remove();

    console.log(
      `✅ Push + Email sent to ${receiver.public_user_id}`
    );
  } catch (err) {
    console.error("❌ sendNotifications error:", err.message);
  }
}

// ------------------- PROCESS QUEUE -------------------
async function processBatchQueue() {
  if (!db) return;

  try {
    const queueSnap = await db.ref("notificationQueue").once("value");
    const queue = queueSnap.val();
    if (!queue) return;

    for (const receiverUid of Object.keys(queue)) {
      const senderUids = Object.keys(queue[receiverUid] || {});
      if (!senderUids.length) continue;

      await sendNotifications(receiverUid, senderUids);
    }
  } catch (err) {
    console.error("❌ Batch processing error:", err);
  }
}

// ------------------- REAL-TIME LISTENER -------------------
export async function startUnreadNotificationService() {
  if (!db) return;

  console.log("🔹 Starting unread notification listener...");

  // ---- Process existing messages ----
  const messagesSnap = await db.ref("messages").once("value");
  const messages = messagesSnap.val();

  if (messages) {
    for (const senderUid of Object.keys(messages)) {
      const receivers = messages[senderUid];
      for (const receiverUid of Object.keys(receivers)) {
        const msgObj = receivers[receiverUid];
        for (const messageId of Object.keys(msgObj)) {
          const msg = msgObj[messageId];
          if (!msg.seen && !msg.notified) {
            await addToQueue(
              receiverUid,
              senderUid,
              db.ref(`messages/${senderUid}/${receiverUid}/${messageId}`)
            );
          }
        }
      }
    }
  }

  // ---- Real-time listener ----
  db.ref("messages").on("child_added", async (senderSnap) => {
    const senderUid = senderSnap.key;

    senderSnap.forEach((receiverSnap) => {
      const receiverUid = receiverSnap.key;

      receiverSnap.forEach(async (messageSnap) => {
        const msg = messageSnap.val();
        if (!msg || msg.seen || msg.notified) return;

        await addToQueue(receiverUid, senderUid, messageSnap.ref);
      });
    });
  });

  // ---- Fallback batch ----
  setInterval(processBatchQueue, 60 * 1000);

  console.log(
    "✅ Firebase unread notification service started (real-time + batch)"
  );
}

// ------------------- START SERVICE -------------------
startUnreadNotificationService();
