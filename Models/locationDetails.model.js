import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import connectDB from '../Utils/db.js';
import User from './user.js';
import { v4 as uuidv4 } from 'uuid';
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
        defaultValue: () => uuidv4(),
        allowNull: false,
        references: {
            model: User,
            key: 'userId',
        },
    },
    citizenShip: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    state:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    austrailanVisaStatus: {
        type: DataTypes.STRING,
        enum: ['yes', 'no'],
        allowNull: false,
    }

})


export default locationDetails
