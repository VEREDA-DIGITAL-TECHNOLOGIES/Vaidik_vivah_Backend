import personalDetails from "../Models/personalDetails.model.js";
import User from "../Models/user.js";
import qualificationDetails from "../Models/qualificationDetails.model.js";
import locationDetails from "../Models/locationDetails.model.js";
import otherDetails from "../Models/otherDetails.model.js";
import imageUpload from "../Models/imageUpload.model.js";
import dotenv from 'dotenv';
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { uploadCloudinary } from "../Utils/cloudinary.js"
import recommendation from "../Models/recommendation.model.js";
import Gayatri from "../Models/gayatri.model.js";

dotenv.config();

export const personalDetailsRegister = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const { firstName, lastName, displayName, contactNumber, maritalStatus, numberOfChildren, aboutYourSelf } = req.body;

        if (!firstName || !lastName || !displayName || !contactNumber || !maritalStatus
            || !numberOfChildren || !aboutYourSelf) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }
        const personalDetailsExist = await personalDetails.findOne({ where: { userId } });

        if (personalDetailsExist) {
            return res.status(400).json({ success: false, message: "Personal details already exist!" });
        }


        const personal = await personalDetails.create({ firstName, lastName, displayName, contactNumber, maritalStatus, numberOfChildren, aboutYourSelf, userId });
        await User.update({ isPersonalFormFilled: true }, { where: { userId } });

        await recommendation.update({ firstName, lastName, displayName, contactNumber, maritalStatus, numberOfChildren, aboutYourSelf }, { where: { userId } });


        res.status(201).json({
            success: true,
            message: "Personal details added successfully",
            personal
        })
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }

});

export const qualificationDetailsRegister = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { qualification, currentWorkingStatus, occupation, income } = req.body;

        if (!qualification || !currentWorkingStatus || !occupation || !income) {
            return res.status(400).json({ success: false, message: "All fields are required!" });}

        const qualificationDetailsExist = await qualificationDetails.findOne({ where: { userId } });

        if (qualificationDetailsExist) {
            return res.status(400).json({ success: false, message: "Qualification details already exist!" });
        }

        const qualificationData = await qualificationDetails.create({ qualification, currentWorkingStatus, occupation, income, userId });

        await recommendation.update({ qualification, currentWorkingStatus, occupation, income }, { where: { userId } });



        await User.update({ isQualificationFormFilled: true }, { where: { userId } });


        res.status(201).json({
            success: true,
            message: "Qualification details added successfully",
            qualificationData
        })
    } catch (err) {
        return (next(errorhandler(err.message, 400)));
    }


});

export const locationDetailsRegister = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;
    const { country, state } = req.body;

    if ( !country || !state) {
        return  res.status(400).json({ success: false, message: "All fields are required!" });
    }

    const locationDetailsExist = await locationDetails.findOne({ where: { userId } });

    if (locationDetailsExist) {
        return res.status(400).json({ success: false, message: "Location details already exist!" });
    }

    const locationDetailsData = await locationDetails.create({  country, state, userId });

    await recommendation.update({  country, state }, { where: { userId } });

    await User.update({ isLocationFormFilled: true }, { where: { userId } });
    res.status(201).json({
        success: true,
        message: "Location details added successfully",
        locationDetailsData
    })
})

export const otherDetailsRegister = catchAsyncError(async (req, res, next) => {

    const userId = req.user.userId;
    const { caste, community, dateOfBirth, timeOfBirth, religion, placeOfBirth } = req.body;

    if (!caste || !community || !dateOfBirth || !timeOfBirth || !religion || !placeOfBirth) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    const otherDetailsExist = await otherDetails.findOne({ where: { userId } });

    if (otherDetailsExist) {
        return res.status(400).json({ success: false, message: "Other details already exist!" });
    }

    const otherDetailsData = await otherDetails.create({ caste, community, dateOfBirth, timeOfBirth, religion, placeOfBirth, userId });

    await recommendation.update({ caste, community, dateOfBirth, timeOfBirth, religion, placeOfBirth }, { where: { userId } });


    await User.update({ isOtherFormFilled: true }, { where: { userId } });
    res.status(201).json({
        success: true,
        message: "Other details added successfully",
        otherDetailsData
    })
})

export const imageUploadRegister = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;
    try {
        if (!req.files) {
            return next(new errorhandler("Please upload an image!", 400));
        }

        const imageUploadExist = await imageUpload.findOne({ where: { userId } });

        if (imageUploadExist) {
            return res.status(400).json({ success: false, message: "Image already uploaded!" });
        }

        let userImageUrls;

        if (req.files && req.files.length > 0) {
            const userImagesLocal = req.files.map((file) => file.path);

            const userImages = await uploadCloudinary(userImagesLocal);

            userImageUrls = Array.isArray(userImages) ? userImages.map((image) => image.url)
                : [userImages.url];
        }

        const imageUploadData = await imageUpload.create({ image: userImageUrls, userId });

        await recommendation.update({ image: userImageUrls }, { where: { userId } });

        await User.update({ isImageFormFilled: true }, { where: { userId } });

        res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
            imageUploadData
        })

    } catch (error) {
        return next(new errorhandler(error.message, 500));

    }



})




export const gayatripa = catchAsyncError(async (req, res,next) => {
    const userId = req.user.userId;

    const { isMember, dikshaId } = req.body;

    

    const gayatridetails = await Gayatri.findOne({ where: { userId } });

    if (gayatridetails) {
        return res.status(400).json({ success: false, message: "Gayatri detail already exist!" });
    }
    try {
        const gayatri = await Gayatri.create({ userId, isMember, dikshaId });
        res.status(201).json({
            success:true,
            message: "Gayatri details added successfully",
            gayatri
        }
            );
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

