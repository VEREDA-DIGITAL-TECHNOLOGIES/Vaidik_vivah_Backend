import personal from "../Models/personal.model.js";
import qualificationDetails from "../Models/qualificationDetails.model.js";
import dotenv from 'dotenv';
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { redis } from "../Utils/redis.js";
dotenv.config();

export const personalDetails = catchAsyncError(async (req, res, next) => {
    try {
    const userId = req.user.userId;
    const {firstName,lastName,displayName,contactNumber,martialStatus,numberOfChildren,aboutYourSelf} = req.body;

    const personalDetails = await personal.create({firstName,lastName,displayName,contactNumber,martialStatus,numberOfChildren,aboutYourSelf,userId});

    res.status(201).json({
        success: true,
        message: "Personal details added successfully",
        personalDetails
    })
} catch (err) {
     return(next(errorhandler(err.message, 400)));
}

});


export const  qualificationDetails = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {qualification,currentWorkingStatus,occupation,income} = req.body;
        const qualificationDetails = await qualificationDetails.create({qualification,currentWorkingStatus,occupation,income,userId});
        res.status(201).json({
            success: true,
            message: "Qualification details added successfully",
            qualificationDetails
        })
    } catch (err) {
         return(next(errorhandler(err.message, 400)));
    }
    

});

