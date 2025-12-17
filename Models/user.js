import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import connectDB from '../Utils/db.js';
import jwt from 'jsonwebtoken';

dotenv.config();

import bcrypt from 'bcryptjs';
import plan from './plan.model.js';

const sequelize = connectDB();

/* ---------------- EMAIL REGEX ---------------- */
const emailRegexPattern =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/* ---------------- PUBLIC USER ID GENERATOR ---------------- */
const generatePublicUserId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

/* ---------------- USER MODEL ---------------- */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },

    uid: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    /* ✅ PUBLIC SAFE ID */
    public_user_id: {
      type: DataTypes.STRING(8),
      allowNull: true,
      unique: true,
    },

    userStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    fcmToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },

    planId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: plan,
        key: 'planId',
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: emailRegexPattern,
        notEmpty: true,
      },
    },

    otp: {
      type: DataTypes.STRING,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 255],
      },
    },

    usertype: {
      type: DataTypes.ENUM('Standard', 'Gold', 'Platinum', 'Diamond'),
      allowNull: false,
      defaultValue: 'Standard',
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    isPersonalFormFilled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    isQualificationFormFilled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    isLocationFormFilled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    isOtherFormFilled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    isImageFormFilled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
    },

    isVerifiedByAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isDisabledByAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      reasonForDisabledByAdmin: {
        type: DataTypes.TEXT,
        allowNull: true,
       
      },
  },
  {
    timestamps: true,
  }
);

/* ---------------- HOOKS ---------------- */

// NEW USERS
User.beforeCreate(async (user) => {
  // 🔐 password hash
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  // 🆔 generate public_user_id
  if (!user.public_user_id) {
    let unique = false;
    while (!unique) {
      const candidate =
        generatePublicUserId(7 + Math.floor(Math.random() * 2));

      const exists = await User.findOne({
        where: { public_user_id: candidate },
      });

      if (!exists) {
        user.public_user_id = candidate;
        unique = true;
      }
    }
  }
});

// PASSWORD UPDATE ONLY
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

/* ---------------- AUTH METHODS ---------------- */

User.prototype.signAccessToken = function () {
  return jwt.sign(
    { userId: this.userId },
    process.env.ACCESSTOKEN || ''
  );
};

User.prototype.signRefreshToken = function () {
  return jwt.sign(
    { userId: this.userId },
    process.env.REFRESHTOKEN || ''
  );
};

User.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/* ---------------- BACKFILL EXISTING USERS ---------------- */

const backfillPublicUserIds = async () => {
  try {
    const users = await User.findAll({
      where: { public_user_id: null },
    });

    if (!users.length) return;

    console.log(`🔄 Backfilling ${users.length} users`);

    for (const user of users) {
      let unique = false;

      while (!unique) {
        const candidate =
          generatePublicUserId(7 + Math.floor(Math.random() * 2));

        const exists = await User.findOne({
          where: { public_user_id: candidate },
        });

        if (!exists) {
          user.public_user_id = candidate;
          await user.save({ hooks: false }); // ❗ no password rehash
          unique = true;
        }
      }
    }

    console.log('✅ public_user_id backfill done');
  } catch (err) {
    console.error('❌ Backfill error:', err);
  }
};

/* ---------------- SYNC (NO DATA LOSS) ---------------- */

const syncDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');

    await backfillPublicUserIds();
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

syncDB();

/* ---------------- EXPORT ---------------- */
export default User;
