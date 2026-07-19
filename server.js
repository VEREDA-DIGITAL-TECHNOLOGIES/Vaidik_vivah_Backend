import dotenv from 'dotenv';
import { app } from './app.js';

import { startNotificationScheduler } from './microService/Chat-Notificaion/Worker/scheduler.js';
import connectDB from './Utils/db.js';
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
  dropDownType,
  dropdown,
  ToggleSection,
  Plan,
  gayatri,
  Application,UserWhatsApp
} from './Models/association.js';

import Recommendation from './Models/recommendation.model.js';
import subscription from './Models/subscription.model.js';
import call from './Models/call.model.js';
import Notification from './Models/notification.model.js';
import { createServer } from 'http';
import { intializeSocket } from './config/socketConfig.js';
import block from './Models/block.model.js';
import documentUpload from './Models/gayatri.model.js';
import report from './Models/report.model.js';
import Admin from './Models/Admin/Admin.modal.js';
import AdminApiLog from './Models/Admin/AdminApiLog.model.js';
import Banner from './Models/Admin/app.banner.js';
import Contact from './Models/Contact.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

/* ---------------- PUBLIC USER ID BACKFILL ---------------- */

const backfillPublicUserIds = async () => {
  const users = await User.findAll({
    where: { public_user_id: null },
  });

  if (!users.length) {
    console.log('✅ No users need public_user_id backfill');
    return;
  }

  console.log(`🔄 Backfilling public_user_id for ${users.length} users`);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (const user of users) {
    let unique = false;

    while (!unique) {
      let id = '';
      const len = 7 + Math.floor(Math.random() * 2); // 7–8 chars

      for (let i = 0; i < len; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
      }

      const exists = await User.findOne({
        where: { public_user_id: id },
      });

      if (!exists) {
        user.public_user_id = id;
        await user.save({ hooks: false }); // 🚨 prevents password re-hash
        unique = true;
      }
    }
  }

  console.log('✅ public_user_id backfill completed');
};

/* ---------------- SERVER START ---------------- */

const startServer = async () => {
  try {
    await connectDB();


    const server = createServer(app);
    intializeSocket(server);

    // --------- SYNC MODELS (NO DATA LOSS) ---------
    await Plan.sync({ force: false });
    await User.sync({ alter:false});

    // 🔥 IMPORTANT: BACKFILL AFTER USER SYNC
    await backfillPublicUserIds();

    await Answer.sync({ force: false });
    await personalDetails.sync({ force: false });
    await otherDetails.sync({ force: false });
    await locationDetails.sync({ alter : true });
    await imageUpload.sync({ force: false });
    await qualificationDetails.sync({ force: false });
    await Recommendation.sync({ force: false });
    await FavProfile.sync({ force: false });
    await happyStories.sync({ force: false });
    await Connection.sync({ force: false });
    await subscription.sync({ force: false });
    await dropDownType.sync({ force: false });
    await dropdown.sync({ force: false });
    await call.sync({ force: false });
    await Notification.sync({ force: false });
    await ToggleSection.sync({ force: false });
    await gayatri.sync({ force: false });
    await block.sync({ force: false });
    await documentUpload.sync({ force: false });
    await report.sync({ force: false });
    await Admin.sync({ force: false });
    await AdminApiLog.sync({ force: false });
    await Banner.sync({ force: false });
    await Contact.sync({ force: false });
    await Application.sync({forece:false });
    await UserWhatsApp.sync({force:false});
    console.log(' Tables synchronized');
    startNotificationScheduler();
    
// safety: never crash the process
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err?.message || err);
});

process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection:", err?.message || err);
});

    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(' Server startup error:', error);
  }
};

startServer();




