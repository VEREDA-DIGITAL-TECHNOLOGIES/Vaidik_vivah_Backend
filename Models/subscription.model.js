import { DataTypes } from "sequelize";
import connectDB from "../Utils/db";
import User from "./user";
import { v4 as uuidv4 } from 'uuid';
import plan from "./plan.model";
const sequelize = connectDB();
sequelize.define('subscription', {

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
    planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: plan,
            key: 'id',
        },
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Date.now(),
    },
    endDate:{
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        enum: ["Active", "Inactive",'Expired','Cancelled'],
        defaultValue: "Active"
    },
    paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        enum: ["Pending", "Completed","Failed"],
        defaultValue: "Pending"
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Date.now(),
    },
   
})



export default subscription;