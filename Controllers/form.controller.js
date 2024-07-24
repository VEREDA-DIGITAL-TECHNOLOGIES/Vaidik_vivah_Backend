import personal from "../Models/personal.model.js";
import qualificationDetails from "../Models/qualificationDetails.model.js";
import locationDetails from "../Models/locationDetails.model.js";
import otherDetails from "../Models/otherDetails.model.js";
import imageUpload from "../Models/imageUpload.model.js";
import dotenv from 'dotenv';
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import {uploadCloudinary} from "../Utils/cloudinary.js"
import { redis } from "../Utils/redis.js";

dotenv.config();

export const personalDetailsRegister = catchAsyncError(async (req, res, next) => {
    try {
    const userId = req.user.userId;
    console.log(userId,"userId")
    const {firstName,lastName,displayName,contactNumber,martialStatus,numberOfChildren,aboutYourSelf} = req.body;
    console.log("req.body",req.body)

    if(!firstName || !lastName || !displayName || !contactNumber || !martialStatus || !numberOfChildren || !aboutYourSelf){
        return next(new errorhandler("All fields are required!", 400));
    }
     const personalDetailsExist = await personal.findOne({where:{userId}});

    if(personalDetailsExist){
        return next(new errorhandler("Personal details already exist!", 400));
    }


    const personalDetails = await personal.create({firstName,lastName,displayName,contactNumber,martialStatus,numberOfChildren,aboutYourSelf,userId});

    res.status(201).json({
        success: true, 
        message: "Personal details added successfully",
        personalDetails
    })
} catch (error) {
    return next(new errorhandler(error.message, 500));
}

});


export const qualificationDetailsRegister = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {qualification,currentWorkingStatus,occupation,income} = req.body;

        if(!qualification || !currentWorkingStatus || !occupation || !income){
            return next(new errorhandler("All fields are required!", 400));
        }

        const qualificationDetailsExist = await qualificationDetails.findOne({where:{userId}});

        if(qualificationDetailsExist){
            return next(new errorhandler("Qualification details already exist!", 400));
        }

        const qualificationData = await qualificationDetails.create({qualification,currentWorkingStatus,occupation,income,userId});
        res.status(201).json({
            success: true,
            message: "Qualification details added successfully",
            qualificationData
        })
    } catch (err) {
         return(next(errorhandler(err.message, 400)));
    }
    

});

export const locationDetailsRegister = catchAsyncError(async(req, res, next)=>{
    const userId = req.user.userId;
    const {citizenShip,country,state,austrailanVisaStatus} = req.body;

    if(!citizenShip || !country || !state || !austrailanVisaStatus){
        return next(new errorhandler("All fields are required!", 400));
    }

    const locationDetailsExist = await locationDetails.findOne({where:{userId}});

    if(locationDetailsExist){
        return next(new errorhandler("Location details already exist!", 400));
    }

    const locationDetailsData = await locationDetails.create({citizenShip,country,state,austrailanVisaStatus,userId});
    res.status(201).json({
        success: true,
        message: "Location details added successfully",
        locationDetailsData
    })
}) 

export const otherDetailsRegister = catchAsyncError(async(req,res,next)=>{
    
    const userId = req.user.userId;
    const {caste,community,date,time,religion,placeOfBirth} = req.body;

    if(!caste || !community || !date || !time || !religion || !placeOfBirth){
        return next(new errorhandler("All fields are required!", 400));
    }

    const otherDetailsExist = await otherDetails.findOne({where:{userId}});

    if(otherDetailsExist){
        return next(new errorhandler("Other details already exist!", 400));
    }

    const otherDetailsData = await otherDetails.create({caste,community,date,time,religion,placeOfBirth,userId});
    res.status(201).json({
        success: true,
        message: "Other details added successfully",
        otherDetailsData
    })
})

export const imageUploadRegister = catchAsyncError(async(req,res,next)=>{
    const userId = req.user.userId;

    if(!req.files){
        return next(new errorhandler("Please upload an image!", 400));
    }
    console.log(req.files,"req.file")

    const imageUploadExist = await imageUpload.findOne({where:{userId}});

    if(imageUploadExist){
        return next(new errorhandler("Image already uploaded!", 400));
    }

    let userImageUrls;

    if(req.files && req.files.length > 0){
       const userImagesLocal = req.files.map((file)=>file.path);

       const userImages = await uploadCloudinary(userImagesLocal);

       userImageUrls = Array.isArray(userImages)? userImages.map((image)=>image.url)
       :[userImages.url];
    }
    
    const imageUploadData = await imageUpload.create({image:userImageUrls,userId});

    res.status(201).json({
        success: true,
        message: "Image uploaded successfully",
        imageUploadData
    })

})


