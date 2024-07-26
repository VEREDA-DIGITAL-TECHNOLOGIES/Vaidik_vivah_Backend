import personal from "../Models/personal.model.js";
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
        const personalData = await personal.findOne({ where: { userId } });
        const qualificationDetailsData = await qualificationDetails.findOne({ where: { userId } });
        const locationDetailsData = await locationDetails.findOne({ where: { userId } });
        const otherDetailsData = await otherDetails.findOne({ where: { userId } });
        const imageUploadData = await imageUpload.findOne({ where: { userId } });

        const data = [
            {
                "basic_&_lifestye": {

                }

            }

        ]






    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }


}


