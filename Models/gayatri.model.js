import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
import connectDB from '../Utils/db.js';
import User from './user.js';

const sequelize = connectDB();

const gayatri = sequelize.define("gayatri", {
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
        isMember: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        dikshaId: {
            type: DataTypes.STRING,
            allowNull: true,
        },


}, {
    timestamps: true
});

export default gayatri;

  