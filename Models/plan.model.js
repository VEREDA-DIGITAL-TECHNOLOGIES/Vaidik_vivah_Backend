import { DataTypes } from "sequelize";
import connectDB from "../Utils/db.js";
import { v4 as uuidv4 } from 'uuid';
import User from './user.js';

const sequelize = connectDB();

const plan = sequelize.define("plan", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },

    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'userId',
        },
    },
    planId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
    },
    planName: {
        type: DataTypes.STRING,
        allowNull: false,
        enum: ["Standard","Premium","Exclusive"],
    },
    planType: {
        type: DataTypes.STRING,
        allowNull: false,
        enum: ["Monthly","Yearly"],
    },
    featureList: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    durationInMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    stripePriceId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },

},{
    timestamps: true,
})

export default plan