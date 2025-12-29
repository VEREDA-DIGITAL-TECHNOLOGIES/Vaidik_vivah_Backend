import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import connectDB from '../Utils/db.js';
import User from './user.js';

dotenv.config();

const sequelize = connectDB();

const locationDetails = sequelize.define('locationDetails', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'userId',
    },
  },

  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // ✅ NEW FIELD
  fullAddress: {
    type: DataTypes.TEXT,
    allowNull: true, // nullable
    defaultValue: null,
  },

  currentLocation: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Not Specified",
  },

  cityOfResidence: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Not Specified",
  },

  nationality: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Not Specified",
  },
});

export default locationDetails;
