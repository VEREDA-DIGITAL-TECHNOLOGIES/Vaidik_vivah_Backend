import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler  from "../Utils/errorhandler.js";
import FavProfile from "../Models/favProfile.model.js";
import User from "../Models/user.js";
import axios from "axios";



export const addFavProfile = catchAsyncError(async (req, res, next) => {
    try{
        const favoritingUserId = req.user.userId; 

        const { FavouriteUserId,profile} = req.body;

        if(!profile && !FavouriteUserId){
            return next(new errorhandler("User not found!", 400));
        }

        const existingFavProfile = await FavProfile.findOne({where: {FavouriteUserId, favoritingUserId}});

        if(existingFavProfile){
            return next(new errorhandler("Favourite profile already exist!", 400));
        }

        const favProfile = await FavProfile.create({FavouriteUserId,profile,favoritingUserId});


        return res.status(201).json({favProfile, message: "Favourite profile created successfully!"});

    }catch(error){
        
        return next(new errorhandler(error.message, 500));
    }

})

export const getFavProfile = catchAsyncError(async (req, res, next) => {
    try{
        const favouratingUserId = req.user.userId;

        const FavouritedProfiles = await User.findAll({
            include: {
                model: User,
                as: 'FavoritedProfiles',
                through: {
                    attributes: [], 
                },
            },
            where: { userId: favouratingUserId },
        })

        if(!FavouritedProfiles){
            return next(new errorhandler("No Favourite profile found!", 400));
        }

    }catch(error){
     return next(new errorhandler(error.message, 500));
    }
})

export const  removeFavProfile = catchAsyncError(async (req, res, next) => {
    try{
        
        const {FavouriteUserId} = req.body;
        const favoritingUserId = req.user.userId;

        const favProfile = await FavProfile.findOne({
            where: { FavouriteUserId, favoritingUserId },
        });

        if (!favProfile) {
            return res.status(404).json({ message: 'Favorite profile not found.' });
        }

        await favProfile.destroy();

        return res.status(200).json({ message: 'Favorite profile removed successfully.' });


    }catch(error){
        return next(new errorhandler(error.message, 500));
    }

})



