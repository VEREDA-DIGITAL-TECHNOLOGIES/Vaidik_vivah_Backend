import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import connectDB from '../Utils/db.js';
dotenv.config();


const sequelize = connectDB();


const Recommendation = sequelize.define('Recommendation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    fcmToken: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    usertype: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    qualification: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    currentWorkingStatus: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    occupation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    income: {
        type: DataTypes.STRING,
        allowNull: false,
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
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        min: 10,
        max: 10
    },
    maritalStatus: {
        type: DataTypes.ENUM('Yes', 'No', ),
        allowNull: false,
    },
    numberOfChildren: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    aboutYourSelf: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    caste : {
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
        defaultValue: "Not Specified"
    },
    dateOfBirth: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timeOfBirth: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    religion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    placeOfBirth: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    motherTongue: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gotra: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    height : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    weight: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bodyType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    language: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    smokingHabbit: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    drinkingHabbit: {
        type: DataTypes.STRING,
        allowNull: false,
    },
   diet: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    complexion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fatherOccupation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    motherOccupation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    siblings: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    numberOfSiblings: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:"Not Specified"

    },
    livingWithFamily: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:"Not Specified"

    },
    citizenShip: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    state:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    austrailanVisaStatus: {
        type: DataTypes.STRING,
        enum: ['yes', 'no'],
        allowNull: false,
    },
    currentLocation: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:"Not Specified"
    },
    cityOfResidence: {
        type: DataTypes.STRING,
        allowNull:true,
    },
    nationality:{
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:"Not Specified"

    },
    residencyVisaStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:"Not Specified"
    },
    gender:
    {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lookingFor: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    triedOnlineBefore: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    weddingGoles:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    longlookingBefore: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    whomlookingFor: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    age:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    lookingPartnerage:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    livinginAustralia:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    horoscopeMatch:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    castReligionMatterOrNot: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    interest_and_hobbies: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    image: {
        type: DataTypes.JSON,
        allowNull: false,
    },
   

}, {
    timestamps: true,

});
export default Recommendation