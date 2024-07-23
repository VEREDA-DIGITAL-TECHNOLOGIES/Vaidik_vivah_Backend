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
    date:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    time:{
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

    }



    

});

export default otherDetails;