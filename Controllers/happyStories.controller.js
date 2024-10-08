import { Op, where } from "sequelize";
import happyStories from "../Models/happyStories.model.js";
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { uploadCloudinary } from "../Utils/cloudinary.js";

export const addStory = catchAsyncError(async (req, res, next) => {
    try {
       console.log(req.body)
        const  {customerName, partnerName, Description} = req.body;
        console.log(customerName, partnerName, Description)


        if (!customerName || !partnerName || !Description) {
            return next(new errorhandler("Please enter all fields", 400)); 
        }

        console.log(req.files)

        if (!req.files) {
            return next(new errorhandler("Please upload Customer's Story image!", 400));
        }

        let userImageUrl;
    
        if (req.files && req.files.length > 0) {
            const userImageLocal = req.files;
    
            const userImage = await uploadCloudinary(userImageLocal);
    
            userImageUrl = userImage.url;
        }

         await happyStories.create({customerName, partnerName, Description, image: userImageUrl});

        res.status(201).json({
            success: true,
            message: "Happy Story added successfully",
        })


    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }

})

export const  getAllStories = catchAsyncError(async (req, res, next) => {
    try {
        const stories = await happyStories.findAll();

        res.status(200).json({
            success: true,
            stories
        })

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
})

export const deleteStory = catchAsyncError(async (req, res, next) => {
    try {
        const {storyId} = req.body;

        if (!storyId) {
            return next(new errorhandler("Please enter all fields", 400));
        }

        await happyStories.destroy({
            where: {
                storyId
            }
        });

        res.status(200).json({
            success: true,
            message: "Happy Story deleted successfully",
        })

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
})