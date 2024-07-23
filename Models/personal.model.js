import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import connectDB from '../Utils/db.js';
import User from './user.js';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

const sequelize = connectDB();


const personal  = sequelize.define('personal', {

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

    firstName: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contactNumber:{
        type: DataTypes.STRING,
        allowNull: false,
        min: 10,
        max: 10
    },
    martialStatus: {
        type: DataTypes.ENUM('Yes', 'No', ),
        allowNull: false,
    },
    numberOfChildren: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    aboutYourSelf: {
        type: DataTypes.STRING,
        allowNull: false,
    },

});

export default personal;