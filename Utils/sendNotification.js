import { firebaseAdmin } from "../Controllers/notification.controller.js";

const sendNotification = async () => {
  try {
    const message = {
      token: "eq7me0_USQaX60uR8uZwv8:APA91bHLYS_s6ewpSmJzirzjRdUYZTwWnJ9PfH7mp0SPkxpNFWFeoY8ptfTG-CrbMUP7ln9NFgD38tPr9hE0PMc32lhY2au5R5Qdsq6oS57ToAoqs35OdA0",
   
      notification: {
       
        title: "Test Notification 🚀",
        body: "This is a simple notification",
      },

      webpush: {
        fcmOptions: {
        
        },
      },
    };

    const res = await firebaseAdmin.messaging().send(message);

    console.log("Sent:", res);
  } catch (err) {
    console.error(err);
  }
};

sendNotification();