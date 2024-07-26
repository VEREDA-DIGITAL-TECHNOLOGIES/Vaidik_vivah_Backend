import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import connectDB from '../Utils/db.js';
import User from './user.js';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

const sequelize = connectDB();


const otherDetails = sequelize.define('otherDetails', {
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
    caste:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    community: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subCommunity: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dateOfBirth:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    timeOfBirth:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    religion:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    placeOfBirth:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    gothra:{
        type: DataTypes.STRING,
        allowNull: true,
    },  
    motherTongue:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    height: {
        type: DataTypes.STRING,
        allowNull:true,
    },
    weight:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    bodyType:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    language: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    smokingHabit: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    drinkingHabit: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    diet: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    complexion: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fatherOccupation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    motherOccupation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    numberOfSiblings: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    livingwithFamily: {
        type: DataTypes.STRING,
        allowNull: true,
    },
   
});

export default otherDetails;