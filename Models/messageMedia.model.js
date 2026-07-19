import { DataTypes } from 'sequelize';
import connectDB from '../Utils/db.js';
import User from './user.js';

const sequelize = connectDB();

const MessageMedia = sequelize.define('MessageMedia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'userId',
    },
  },
  type: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default MessageMedia;
