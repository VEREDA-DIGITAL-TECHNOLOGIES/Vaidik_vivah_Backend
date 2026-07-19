// models/userWhatsapp.model.js

import { DataTypes } from "sequelize";
import connectDB from "../Utils/db.js";

const sequelize = connectDB();

const UserWhatsApp = sequelize.define(
  "UserWhatsApp",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // ✅ one WhatsApp per user
    },

    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // ✅ one number per user
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

export default UserWhatsApp;