import { DataTypes } from 'sequelize';
import connectDB from '../../Utils/db.js';

const sequelize = connectDB();

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1,
    allowNull: false,
  },
  photos: {
    type: DataTypes.ARRAY(DataTypes.STRING), 
    allowNull: false,
    defaultValue: [],
  },
  photoCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

export default Banner;
