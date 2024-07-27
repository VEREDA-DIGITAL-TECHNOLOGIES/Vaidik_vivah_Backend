import personalDetails from "../Models/personalDetails.model.js";
import qualificationDetails from "../Models/qualificationDetails.model.js";
import locationDetails from "../Models/locationDetails.model.js";
import otherDetails from "../Models/otherDetails.model.js";
import imageUpload from "../Models/imageUpload.model.js";
import dotenv from 'dotenv';
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { uploadCloudinary } from "../Utils/cloudinary.js"
import { redis } from "../Utils/redis.js";
dotenv.config();

const myDetails = async (req, res, next) => {
    try {
        const userId = req.userId;

        const personalData = await personalDetails.findOne({ where: { userId } });
        const qualificationDetailsData = await qualificationDetails.findOne({ where: { userId } });
        const locationDetailsData = await locationDetails.findOne({ where: { userId } });
        const otherDetailsData = await otherDetails.findOne({ where: { userId } });
        const imageUploadData = await imageUpload.findOne({ where: { userId } });

        const data = [
            {
                "profileImage": imageUploadData.image,
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
                },
            }

        ]

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }


}


