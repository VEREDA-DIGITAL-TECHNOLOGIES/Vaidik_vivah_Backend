// Models/Contact.js
import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import connectDB from "../Utils/db.js"; // your Sequelize connection

const sequelize = connectDB();

const Contact = sequelize.define(
  "Contact",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(), // generate UUID v4 automatically
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contactedBack: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "contacts",
    timestamps: true,
  }
);

export default Contact;
