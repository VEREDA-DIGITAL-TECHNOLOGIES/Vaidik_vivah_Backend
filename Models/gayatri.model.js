import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '../Utils/db.js';

const sequelize = connectDB();

const documentUpload = sequelize.define('documentUpload', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,

  },
  documentType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  documentFrontUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  documentBackUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isVerified: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
});

export default documentUpload;
