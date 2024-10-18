import { DataTypes } from "sequelize";
import connectDB from "../Utils/db.js";

const sequelize = connectDB();

const plan = sequelize.define("plan", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },

    planName: {
        type: DataTypes.STRING,
        allowNull: false,
        enum: ["Standard","Premium","Exclusive"],
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