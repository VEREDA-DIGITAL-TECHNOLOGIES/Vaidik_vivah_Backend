import personalDetails from "../Models/personalDetails.model.js";
import qualificationDetails from "../Models/qualificationDetails.model.js";
import locationDetails from "../Models/locationDetails.model.js";
import otherDetails from "../Models/otherDetails.model.js";
import imageUpload from "../Models/imageUpload.model.js";
import Answer from '../Models/answer.model.js';
import dotenv from 'dotenv';
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { uploadCloudinary } from "../Utils/cloudinary.js"
import { redis } from "../Utils/redis.js";
dotenv.config();

export const myDetails = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;
        console.log(userId, "userId")

        const personalData = await personalDetails.findOne({ where: { userId } });
        const qualificationDetailsData = await qualificationDetails.findOne({ where: { userId } });
        const locationDetailsData = await locationDetails.findOne({ where: { userId } });
        const otherDetailsData = await otherDetails.findOne({ where: { userId } });
        const imageUploadData = await imageUpload.findOne({ where: { userId } }) || "";
        const answerData = await Answer.findOne({ where: { userId }, questionId: 12 });
        const answer = answerData.answer;
        const data = [
            {
                "profileImage": imageUploadData,
                "basic_&_lifestye": {
                    "firstName": personalData.firstName,
                    "lastName": personalData.lastName,
                    "displayName": personalData.displayName,
                },
                "family_details": {
                    "fatherOccupation": otherDetailsData.fatherOccupation,
                    "motherOccupation": otherDetailsData.motherOccupation,
                    "numberOfSiblings": otherDetailsData.numberOfSiblings,
                    "livingWithFamily": otherDetailsData.livingWithFamily,
                },
                "personal_background": {
                    "height": otherDetailsData.height,
                    "weight": otherDetailsData.weight,
                    "bodyType": otherDetailsData.bodyType,
                    "language": otherDetailsData.language,
                    "smokingHabbit": otherDetailsData.smokingHabbit,
                    "drinkingHabbit": otherDetailsData.drinkingHabbit,
                    "diet": otherDetailsData.diet,
                    "complexion": otherDetailsData.complexion,
                },
                "religious_background": {
                    "religion": otherDetailsData.religion,
                    "caste": otherDetailsData.caste,
                    "community": otherDetailsData.community,
                    "subCommunity": otherDetailsData.subCommunity,
                    "gothra": otherDetailsData.gothra,
                    "timeOfBirth": otherDetailsData.timeOfBirth,
                    "dateOfBirth": otherDetailsData.dateOfBirth,
                    "placeOfBirth": otherDetailsData.placeOfBirth,
                    "motherTongue": otherDetailsData.motherTongue,
                },
                "location_background": {
                    "currentLocation": otherDetailsData.currentLocation,
                    "cityOfResidence": otherDetailsData.cityOfResidence,
                    "nationality": locationDetailsData.nationality,
                    "citizenShip": locationDetailsData.citizenShip,
                    "residencyVisaStatus": locationDetailsData.residencyVisaStatus,
                },
                "education_and_financial": {
                    "qualification": qualificationDetailsData.qualification,
                    "workingStatus": qualificationDetailsData.currentWorkingStatus,
                    "income": qualificationDetailsData.income,
                },
                "interest_and_hobbies": {
                    answer
                }

            }

        ]

        res.status(200).json({
            success: true,
            data,
            message: "Profile fetched successfully!"
        })

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }


})

export const updatePersonalDetails = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId
    const { firstName, lastName, displayName } = req.body;

    if (!firstName || !lastName || !displayName) {
        return next(new errorhandler("All fields are required!", 400));
    }

    const personalData = await personalDetails.findOne({ where: { userId } });

    if (!personalData) {
        return next(new errorhandler("Personal details not found!", 400));
    }

    const updatePersonalDetails = await personalDetails.update({ firstName, lastName, displayName }, { where: { userId } });

    res.status(201).json({
        success: true,
        message: "Personal details updated successfully",
        updatePersonalDetails
    })

})

export const updateFamilyDetails = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId
    const { fatherOccupation, motherOccupation, numberOfSiblings, livingWithFamily } = req.body;

    if (!fatherOccupation || !motherOccupation || !numberOfSiblings || !livingWithFamily) {
        return next(new errorhandler("All fields are required!", 400));
    }

    const otherDetailsData = await otherDetails.findOne({ where: { userId } });

    if (!otherDetailsData) {
        return next(new errorhandler("Other details not found!", 400));
    }

    const updateOtherDetails = await otherDetails.update({ fatherOccupation, motherOccupation, numberOfSiblings, livingWithFamily }, { where: { userId } });

    res.status(201).json({
        success: true,
        message: "Family details updated successfully",
        updateOtherDetails
    })

})

export const updatePersonalBackground = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId
    const { height, weight, bodyType, language, smokingHabbit, drinkingHabbit, diet, complexion } = req.body;

    if (!height || !weight || !bodyType || !language || !smokingHabbit || !drinkingHabbit || !diet || !complexion) {
        return next(new errorhandler("All fields are required!", 400));
    }

    const otherDetailsData = await otherDetails.findOne({ where: { userId } });

    if (!otherDetailsData) {
        return next(new errorhandler("Other details not found!", 400));
    }

    const updateOtherDetails = await otherDetails.update({ height, weight, bodyType, language, smokingHabbit, drinkingHabbit, diet, diet }, { where: { userId } });

    res.status(201).json({
        success: true,
        message: "Personal Background details updated successfully",
        updateOtherDetails
    })

})

export const updateReligiousBackground = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId
    const { religion, caste, community, subCommunity, gothra, timeOfBirth, dateOfBirth, placeOfBirth, motherTongue } = req.body;

    if (!religion || !caste || !community || !subCommunity || !gothra || !timeOfBirth || !dateOfBirth || !placeOfBirth || !motherTongue) {
        return next(new errorhandler("All fields are required!", 400));
    }

    const otherDetailsData = await otherDetails.findOne({ where: { userId } });

    if (!otherDetailsData) {
        return next(new errorhandler("Other details not found!", 400));
    }

    const updateOtherDetails = await otherDetails.update({ religion, caste, community, subCommunity, gothra, timeOfBirth, dateOfBirth, placeOfBirth, motherTongue }, { where: { userId } });

    res.status(201).json({
        success: true,
        message: "Religious Background details updated successfully",
        updateOtherDetails
    })

})

export const updateLocationDetails = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId
    const { currentLocation, cityOfResidence, nationality, citizenShip, residencyVisaStatus } = req.body;

    if (!currentLocation || !cityOfResidence || !nationality || !citizenShip || !residencyVisaStatus) {
        return next(new errorhandler("All fields are required!", 400));
    }

    const locationDetailsData = await locationDetails.findOne({ where: { userId } });

    if (!locationDetailsData) {
        return next(new errorhandler("Location details not found!", 400));
    }

    const updateOtherDetails = await otherDetails.update({ currentLocation, cityOfResidence }, { where: { userId } });

    const updateLocationDetails = await locationDetails.update({ nationality, citizenShip, residencyVisaStatus }, { where: { userId } });

    const data = [...updateOtherDetails, ...updateLocationDetails]

    res.status(201).json({
        success: true,
        message: "Location  details updated successfully",
        data
    })

})

export const updateEducationAndFinancialDetails = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId
    const { qualification, currentWorkingStatus, income } = req.body;

    if (!qualification || !currentWorkingStatus || !income) {
        return next(new errorhandler("All fields are required!", 400));
    }

    const qualificationDetailsData = await qualificationDetails.findOne({ where: { userId } });

    if (!qualificationDetailsData) {
        return next(new errorhandler("Qualification details not found!", 400));
    }

    const updateQualificationDetails = await qualificationDetails.update({ qualification, currentWorkingStatus, income }, { where: { userId } });

    res.status(201).json({
        success: true,
        message: "Education and Financial details updated successfully",
        updateQualificationDetails
    })

})

export const updateInterstAndHobbies = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId
    const { hobbies } = req.body;

    if (!hobbies) {
        return next(new errorhandler("All fields are required!", 400));
    }

    const interstAndHobbiesData = await Answer.findOne({ where: { userId }, questionId: 12 });

    if (!interstAndHobbiesData) {
        return next(new errorhandler("Interst and Hobbies not found!", 400));
    }

    const updateInterstAndHobbies = await Answer.update({ answer: hobbies }, { where: { userId }, questionId: 12 });

    res.status(201).json({
        success: true,
        message: "Interst and Hobbies updated successfully",
        updateInterstAndHobbies
    })

})









