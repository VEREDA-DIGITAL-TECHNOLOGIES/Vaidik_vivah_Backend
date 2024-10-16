import { DataTypes } from "sequelize";
import dotenv from 'dotenv';
import connectDB from '../Utils/db.js';
import User from "./user.js";
dotenv.config();


const sequelize = connectDB();

const Connection = sequelize.define('Connection', {
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
    connectionUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'userId',
        },
    },
    status: {
        type: DataTypes.ENUM('accepted', 'rejected', 'pending', 'blocked'),
        defaultValue: 'pending',
    },
},{
    timestamps: true
});

export default Connection;