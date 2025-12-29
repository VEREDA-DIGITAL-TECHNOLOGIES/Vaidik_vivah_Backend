import admin from "firebase-admin";
import dotenv from "dotenv";

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
async function addToQueue(receiverId, senderId, messageRef) {
  if (!db || !receiverId || !senderId) return;

  try {
    await db.ref(`notificationQueue/${receiverId}/${senderId}`).set({
      addedAt: Date.now(),
    });

    if (messageRef) {
      await messageRef.update({ notified: true });
    }

    console.log(`🔹 Added to queue: receiver=${receiverId}, sender=${senderId}`);
  } catch (err) {
    console.error("❌ Error adding to queue:", err);
  }
}

// ------------------- SEND NOTIFICATIONS -------------------
async function sendNotifications(receiverId, senderIds) {
  if (!db) return;

  try {
    const tokenSnap = await db.ref(`users/${receiverId}/fcmToken`).once("value");
    const fcmToken = tokenSnap.val();

    if (!fcmToken) {
      console.warn(`⚠️ No FCM token for user ${receiverId}`);
      return;
    }

    const message = {
      token: fcmToken,
      notification: {
        title: "New Message",
        body: `You have ${senderIds.length} new message(s) from ${senderIds.join(", ")}`,
      },
    };

    await admin.messaging().send(message);

    await db.ref(`notificationQueue/${receiverId}`).remove();
    console.log(`🔔 Sent ${senderIds.length} notification(s) to ${receiverId}`);
  } catch (err) {
    console.error(`❌ Error sending notification to ${receiverId}:`, err);
  }
}

// ------------------- PROCESS QUEUE -------------------
async function processBatchQueue() {
  if (!db) return;

  try {
    const queueSnap = await db.ref("notificationQueue").once("value");
    const queue = queueSnap.val();
    if (!queue) return;

    for (const receiverId of Object.keys(queue)) {
      const senderIds = Object.keys(queue[receiverId] || {});
      if (!senderIds.length) continue;
      await sendNotifications(receiverId, senderIds);
    }
  } catch (err) {
    console.error("❌ Batch processing error:", err);
  }
}

// ------------------- REAL-TIME LISTENER -------------------
export async function startUnreadNotificationService() {
  if (!db) return;

  console.log("🔹 Starting unread notification listener...");

  // Process existing messages first
  const messagesSnap = await db.ref("messages").once("value");
  const messages = messagesSnap.val();

  if (messages) {
    for (const senderId of Object.keys(messages)) {
      const receiverObj = messages[senderId];
      for (const receiverId of Object.keys(receiverObj)) {
        const msgObj = receiverObj[receiverId];
        for (const messageId of Object.keys(msgObj)) {
          const msg = msgObj[messageId];
          if (!msg.seen && !msg.notified) {
            await addToQueue(receiverId, senderId, db.ref(`messages/${senderId}/${receiverId}/${messageId}`));
          }
        }
      }
    }
  }

  // Real-time listener for new messages
  db.ref("messages").on("child_added", async (senderSnap) => {
    const senderId = senderSnap.key;
    senderSnap.forEach((receiverSnap) => {
      const receiverId = receiverSnap.key;
      receiverSnap.forEach(async (messageSnap) => {
        const msg = messageSnap.val();
        if (!msg || msg.seen || msg.notified) return;
        await addToQueue(receiverId, senderId, messageSnap.ref);
      });
    });
  });

  // Fallback batch processing every minute
  setInterval(processBatchQueue, 60 * 1000);

  console.log("✅ Firebase unread notification service started (real-time + batch fallback)");
}

// ------------------- START SERVICE -------------------
startUnreadNotificationService();
