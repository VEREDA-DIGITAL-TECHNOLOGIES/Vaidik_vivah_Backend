import { DataTypes } from 'sequelize';
import connectDB from '../Utils/db.js';
import User from './user.js'; 

const sequelize = connectDB();

const FavProfile = sequelize.define('FavProfile', {
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
    favoritedUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'userId',
        },
    },
    isfavorited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    profile:{
        type:DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false,
        defaultValue: [],
    }  
},

{
    timestamps: true
}
);

export default FavProfile
