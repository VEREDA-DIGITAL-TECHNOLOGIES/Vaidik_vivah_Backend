import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import connectDB from '../Utils/db.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

import bcrypt from 'bcryptjs';

const sequelize = connectDB();

const emailRegexPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
    },
    fcmToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: emailRegexPattern,
            notEmpty: true,
        },
    },
    otp:{
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [8, 255],
        },
    },
    usertype: {
        type: DataTypes.ENUM('Exclusive', 'Standard','Premium'),
        allowNull: false,
        defaultValue: 'Standard',
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isPersonalFormFilled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isQualificationFormFilled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isLocationFormFilled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isOtherFormFilled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isImageFormFilled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },

    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
    },


}, {
    timestamps: true,
});

// Hash password before creating or updating user
User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

//signed access token
User.prototype.signAccessToken = function () {
    return jwt.sign({ userId: this.userId }, process.env.ACCESSTOKEN|| '');
};

//signed refresh token
User.prototype.signRefreshToken = function () {
    return jwt.sign({ userId: this.userId }, process.env.REFRESHTOKEN|| '');
};

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

// Compare password
User.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

await sequelize.sync({ force: false });





export default User;
