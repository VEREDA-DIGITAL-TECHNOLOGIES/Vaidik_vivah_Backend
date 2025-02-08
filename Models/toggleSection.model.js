import { DataTypes } from "sequelize";
import connectDB from "../Utils/db.js";
import User from "./user.js";
import { v4 as uuidv4 } from "uuid";

const sequelize = connectDB();

const ToggleSection = sequelize.define("toggleSection", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
    },
    toggleId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: uuidv4(),
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "userId",
        },
    },
    section: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

export default ToggleSection;
