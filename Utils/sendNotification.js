
// import admin from "firebase-admin";
// import serviceAccount from "../serviceAccountKey.json" assert { type: "json" };

// // 🔥 INIT FIREBASE HERE
// const firebaseAdmin = admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   projectId: serviceAccount.project_id,
// });

import { firebaseAdmin } from "../Controllers/notification.controller.js";

// 🔧 PUT REAL TOKEN HERE
const TEST_FCM_TOKEN = "e2fgkLYq1oMI7yv34mc1D7:APA91bHzY88e_btxnkbUMnyjz7vbHVBRCWOzkobzEPA6NMfpjAyKL05-mrRucYtxK_hXn3b0DnQVOHi9PyHSnmOhvj1HluoTPdDF8cB5V4lDA4eNVUYxUrc";

// ✅ FUNCTION DEFINED HERE (no import)
const sendWebPushNotification = async ({
  fcmToken,
  title,
  body,
  data = {},
  link = "https://vedvivah.com/logotest3.png",
}) => {
  try {
    const message = {
      token: fcmToken,

      notification: {
        title,
        body,
      },

      webpush: {
        notification: {
          title,
          body,
          icon: "",
        },
        fcmOptions: {
          link,
        },
      },

      data: {
        ...data,
      },
    };

    const response = await firebaseAdmin.messaging().send(message);

    return {
      success: true,
      messageId: response,
    };
  } catch (error) {
    console.error("FCM Error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 🚀 RUN TEST
const run = async () => {
  const result = await sendWebPushNotification({
    fcmToken: TEST_FCM_TOKEN,
    title: "Test Notification 🚀",
    body: "This is a manual test notification",
    link: "/user-dashboard",
    data: {
      type: "anythung",
    },
  });

  console.log("Result:", result);
};

run();

