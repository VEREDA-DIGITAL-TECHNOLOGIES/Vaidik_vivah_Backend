import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler  from "../Utils/errorhandler.js";
import FavProfile from "../Models/favProfile.model.js";
import User from "../Models/user.js";
import axios from "axios";



export const addFavProfile = catchAsyncError(async (req, res, next) => {
    try{
        const userId = req.user.userId; 

        const { favoritedUserId } = req.body;

        if( !favoritedUserId){
            return next(new errorhandler("User not found!", 400));
        }

        const existingFavProfile = await FavProfile.findOne({where: {favoritedUserId,  userId}});

        if(existingFavProfile){
            return next(new errorhandler("Favourite profile already exist!", 400));
        }

        const favProfile = await FavProfile.create({favoritedUserId,userId});


        return res.status(201).json({favProfile, message: "Favourite Added successfully!"});

    }catch(error){
        
        return next(new errorhandler(error.message, 500));
    }

})


export const getFavProfile = catchAsyncError(async (req, res, next) => {
    try{
        const userId = req.user.userId;

        const FavouritedProfiles = await FavProfile.findAll({
           
            where: { userId: userId },
        })

        if(!FavouritedProfiles){
            return next(new errorhandler("No Favourite profile found!", 400));
        }
        const data = FavouritedProfiles.map((user) => {
            return {userId: user.userId,}
        })

        return res.status(200).json({data, message: "Favourite profile fetched successfully!"});

    }catch(error){
     return next(new errorhandler(error.message, 500));
    }
})

export const  removeFavProfile = catchAsyncError(async (req, res, next) => {
    try{
        const userId = req.user.userId;

        const {favoritedUserId} = req.body;

        const favProfile = await FavProfile.findOne({
            where: { favoritedUserId, userId },
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



