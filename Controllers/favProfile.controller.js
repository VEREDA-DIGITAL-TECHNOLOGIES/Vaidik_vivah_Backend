import FavProfile from "../Models/favProfile.model";
import User from "../Models/user";
import { catchAsyncError } from "../Middlewares/catchAsyncError";
import { errorhandler } from "../Utils/errorhandler";


export const addFavProfile = catchAsyncError(async (req, res, next) => {
    try{
        const {FavouriteUserId} = req.body;
        const favoritingUserId = req.user.userId; 

        const existingFavProfile = await FavProfile.findOne({where: {FavouriteUserId, favoritingUserId}});

        if(existingFavProfile){
            return next(new errorhandler("Favourite profile already exist!", 400));
        }
        const favProfile = await FavProfile.create({FavouriteUserId, favoritingUserId});
        return res.status(201).json({favProfile, message: "Favourite profile created successfully!"});

    }catch(error){
        return next(new errorhandler(error.message, 500));
    }

})

// export const getFavProfile = catchAsyncError(async (req, res, next) => {
//     try{
//         const favouratingUserId = req.user.userId;
//         const favoritedProfiles = await User.findAll({include: {model: FavProfile, where: {favoritingUserId: favouratingUserId}}});




//     }catch(error){


//     }
    

//})


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



