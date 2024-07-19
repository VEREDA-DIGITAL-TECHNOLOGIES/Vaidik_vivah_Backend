import { DataTypes } from 'sequelize';
import connectDB from '../Utils/db';
import { v4 as uuidv4 } from 'uuid';

const sequelize = connectDB(); 

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    usertype: {
        type: DataTypes.ENUM('exclusive', 'normal'),
        allowNull: false,
        defaultValue: 'normal',
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
    }
}, {
    timestamps: true,
});

export default User;
