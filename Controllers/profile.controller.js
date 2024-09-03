import personalDetails from "../Models/personalDetails.model.js";
import qualificationDetails from "../Models/qualificationDetails.model.js";
import locationDetails from "../Models/locationDetails.model.js";
import otherDetails from "../Models/otherDetails.model.js";
import imageUpload from "../Models/imageUpload.model.js";
import question from '../Models/question.model.js';
import Answer from '../Models/answer.model.js';
import User from "../Models/user.js";
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { uploadCloudinary } from "../Utils/cloudinary.js"
import recommendation from "../Models/recommendation.model.js";
import { redis } from "../Utils/redis.js";
import axios from "axios";
dotenv.config();

export const myDetails = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const personalData = await personalDetails.findOne({ where: { userId } });
        
        const qualificationDetailsData = await qualificationDetails.findOne({ where: { userId } });
        const locationDetailsData = await locationDetails.findOne({ where: { userId } });
        const otherDetailsData = await otherDetails.findOne({ where: { userId } });
        const imageUploadData = await imageUpload.findOne({ where: { userId } }) || "";
        const basic_lifestyle = await Answer.findOne({  where:{ userId } && {questionId: 12} });
        const gender = await Answer.findOne({  where:{ userId } && {questionId: 1} });
        const age = await Answer.findOne({  where:{ userId } && {questionId: 7} });
        const postedby = await Answer.findOne({  where:{ userId } && {questionId: 6} });
        const answer = basic_lifestyle.answer;
        const data = [
            {
                "profileImage": imageUploadData.image,
                "basic_and_lifestye": {
                   "firstName": personalData.firstName,
                    "lastName": personalData.lastName,
                    "displayName": personalData.displayName,
                    "gender":gender.answer,
                    "age": age.answer,
                    "about":personalData.aboutYourSelf,
                    "religion":otherDetailsData.religion,
                    "maritalStatus":personalData.maritalStatus,
                    "numberOfChildren": personalData.numberOfChildren,
                    "postedBy":postedby.answer
    
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
                    "community": otherDetailsData.community,
                    "subCommunity": otherDetailsData.subCommunity,
                    "gothra": otherDetailsData.gothra,
                    "timeOfBirth": otherDetailsData.timeOfBirth,
                    "dateOfBirth": otherDetailsData.dateOfBirth,
                    "placeOfBirth": otherDetailsData.placeOfBirth,
                    "motherTongue": otherDetailsData.motherTongue,
                },
                "location_background": {
                    "currentLocation": locationDetailsData.currentLocation,
                    "cityOfResidence": locationDetailsData.cityOfResidence || "",
                    "nationality": locationDetailsData.nationality,
                    "citizenShip": locationDetailsData.citizenShip,
                    "residencyVisaStatus": locationDetailsData.residencyVisaStatus,
                },
                "education_and_financial": {
                    "qualification": qualificationDetailsData.qualification,
                    "education": qualificationDetailsData.occupation,
                    "workingStatus": qualificationDetailsData.currentWorkingStatus,
                    "income": qualificationDetailsData.income,
                },
                "interest_and_hobbies": answer

            }

        ]


        return res.status(200).json({
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

    const { firstName, lastName,displayName,maritalStatus,aboutYourSelf } = req.body;
   
    const personalData = await personalDetails.findOne({ where: { userId } });

    if (!personalData) {
        return next(new errorhandler("Personal details not found!", 400));
    }

     await personalDetails.update({ firstName, lastName, displayName,aboutYourSelf,maritalStatus }, { where: { userId } });
   
       await recommendation.update({firstName, lastName, displayName}, { where: { userId }});

    res.status(201).json({
        success: true,
        message: "Personal details updated successfully",
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

     await recommendation.update({fatherOccupation, motherOccupation, numberOfSiblings, livingWithFamily}, { where: { userId }});

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

    const updateOtherDetails = await otherDetails.update({ height, weight, bodyType, language, smokingHabbit, drinkingHabbit, diet, complexion }, { where: { userId } });

     await recommendation.update({height, weight, bodyType, language, smokingHabbit, drinkingHabbit, diet, complexion}, { where: { userId }});

    res.status(201).json({
        success: true,
        message: "Personal Background details updated successfully",
        updateOtherDetails
    })

})

export const updateReligiousBackground = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId
    const { religion, community, subCommunity, gothra, motherTongue } = req.body;

    if (!religion || !community || !subCommunity || !gothra || !motherTongue) {
        return next(new errorhandler("All fields are required!", 400));
    }

    const otherDetailsData = await otherDetails.findOne({ where: { userId } });

    if (!otherDetailsData) {
        return next(new errorhandler("Other details not found!", 400));
    }

    const updateOtherDetails = await otherDetails.update({ religion, community, subCommunity, gothra, motherTongue }, { where: { userId } });

     await recommendation.update({religion, community, subCommunity, gothra, motherTongue}, { where: { userId }});

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

    const updateLocationDetails = await locationDetails.update({currentLocation, cityOfResidence, nationality, citizenShip, residencyVisaStatus }, { where: { userId } });

     await recommendation.update({currentLocation, cityOfResidence, nationality, citizenShip, residencyVisaStatus}, { where: { userId }});

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

    await recommendation.update({qualification, currentWorkingStatus, income}, { where: { userId }});

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

    await recommendation.update({hobbies}, { where: { userId }});

    res.status(201).json({
        success: true,
        message: "Interst and Hobbies updated successfully",
        updateInterstAndHobbies
    })

})

// export const MatchedProfiles = catchAsyncError(async (req, res, next) => {
//     try {
//         const { userId } = req.user;

//         const users = await User.findAll({
//             where: {
//                 userId: { [Op.ne]: userId }
//             }
//         });

//         const userIds = users.map(user => user.userId);

//         const answers = await Answer.findAll({
//             where: { userId: { [Op.in]: userIds } }
//         });

//         const userAnswers = await Answer.findAll({ where: { userId } });
//         const userGender = userAnswers.find(a => a.questionId === 1)?.answer;
//         const userLookingFor = userAnswers.find(a => a.questionId === 2)?.answer;
//         const userAge = userAnswers.find(a => a.questionId === 7)?.answer;
//         const userAgeRange = userAnswers.find(a => a.questionId === 8)?.answer;
 
//         const profileData = [];
            
//         for (let user of users) {
//             const userAnswer = answers.filter(a => a.userId === user.userId);
//             const gender = userAnswer.find(a => a.questionId === 1)?.answer;
//             const lookingFor = userAnswer.find(a => a.questionId === 2)?.answer;
//             const age = userAnswer.find(a => a.questionId === 7)?.answer;
//             const ageRange = userAnswer.find(a => a.questionId === 8)?.answer;

//             console.log(userLookingFor, gender,lookingFor,userLookingFor === gender,"userLookingFor === gender",ageRange,userAgeRange[0])
            

//             if (userLookingFor === gender && lookingFor === gender && age > userAgeRange[0] || age <= userAgeRange[1]) {

//                 const personal = await personalDetails.findOne({ where: { userId: user.userId } });
//                 const other = await otherDetails.findOne({ where: { userId: user.userId } });
//                 const location = await locationDetails.findOne({ where: { userId: user.userId } });
//                 const qualification = await qualificationDetails.findOne({ where: { userId: user.userId } });

//                 profileData.push({
//                     userType: user.usertype,
//                     userId: user.userId,
//                     firstName: personal?.firstName || null,
//                     martialStatus: personal?.martialStatus || null,
//                     lastName: personal?.lastName || null,
//                     displayName: personal?.displayName || null,
//                     state: location?.state || null,
//                     country: location?.country || null,
//                     religion: other?.religion || null,
//                     age: age || null,
//                     gender: gender || null,
//                     occupation: qualification?.occupation || null
//                 });
//             }
//         }

//         return res.status(200).json({
//             success: true,
//             data: {
//                 profiles: profileData
//             }
//         });
//     } catch (error) {
//         return next(new errorhandler(error.message, 500));
//     }
// });

export const MatchedProfiles = catchAsyncError(async (req, res, next) => {
    try {
        const { userId } = req.user; // Get userId from the request context
        const { page = 1, pageSize = 20 } = req.query; // Extract pagination parameters from query

        // Make the POST request to the external service with pagination parameters in the body
        const response = await axios.post('https://recommendation.vigorify.in/get_matches2/', {
            userId,
            page,
            pageSize
        });
        console.log(response,"response");
        // Extract data from the response
        const profiles = response.data;

        // Check if any matches were found
        if (!profiles || profiles.length === 0) {
            return res.status(404).json({
                success: false,
                profiles: [],
                message: "No matches found"
            });
        }

        // Return successful response with the profiles
        return res.status(200).json({
            success: true,
            profiles
        });

    } catch (error) {
        // Pass the error to the custom error handler
        return next(new errorhandler(error.message, 500));
    }
});


export const filterProfiles = catchAsyncError(async (req, res, next) => {
    try {
    const userId = req.user.userId

    const {ageRange, heightRange , income, hasChildren,religion,ethenticity,hightestQualifcation,smokingHabbit,workingwith, maritalStatus,eatingHabbit,community,relative}=req.body

    const data = await User.findAll({
        where: {
            userId: { [Op.ne]: userId }
        }
    });

    const userIds = data.map(user => user.userId);

    const answers = await Answer.findAll({
        where: { userId: { [Op.in]: userIds } }
    });

    const userAnswers = await Answer.findAll({ where: { userId } });

    const profileData = [];

    for (let user of data) {

        const userAnswer = answers.filter(a => a.userId === user.userId);
        const age = userAnswer.find(a => a.questionId === 7)?.answer;
        const ageRange = userAnswer.find(a => a.questionId === 8)?.answer;

        if (age > ageRange[0] || age <= ageRange[1]) {

            const personal = await personalDetails.findOne({ where: { userId: user.userId } });
            const other = await otherDetails.findOne({ where: { userId: user.userId } });
            const location = await locationDetails.findOne({ where: { userId: user.userId } });
            const qualification = await qualificationDetails.findOne({ where: { userId: user.userId } });

            profileData.push({
                userType: user.usertype,

                userId: user.userId,
                firstName: personal?.firstName || null,
                maritalStatus: personal?.maritalStatus || null,
                lastName: personal?.lastName || null,
                displayName: personal?.displayName || null,
                state: location?.state || null,
                country: location?.country || null,
                religion: other?.religion || null,
                age: age || null,
                gender: personal?.gender || null,
                occupation: qualification?.occupation || null   
            });
        }
    }

    return res.status(200).json({
        success: true,
        data: {
            profiles: profileData
        }
    });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }

})


export const UserDetails = catchAsyncError(async (req, res, next) => {
    try {
        const {userId } = req.body;

       
        const personalData = await personalDetails.findOne({ where: { userId } });
        const qualificationDetailsData = await qualificationDetails.findOne({ where: { userId } });
        const locationDetailsData = await locationDetails.findOne({ where: { userId } });
        const otherDetailsData = await otherDetails.findOne({ where: { userId } });
        const imageUploadData = await imageUpload.findOne({ where: { userId } }) || "";
        const basic_lifestyle = await Answer.findOne({  where:{ userId } && {questionId: 12} });
        const gender = await Answer.findOne({  where:{ userId } && {questionId: 1} });
        const age = await Answer.findOne({  where:{ userId } && {questionId: 7} });
        const postedby = await Answer.findOne({  where:{ userId } && {questionId: 6} });
        const answer = basic_lifestyle.answer;
        const data = [
            {
                "profileImage": imageUploadData.image,
                "basic_and_lifestye": {
                    "userId": userId,
                   "firstName": personalData.firstName,
                    "lastName": personalData.lastName,
                    "displayName": personalData.displayName,
                    "gender":gender.answer,
                    "age": age.answer,
                    "about":personalData.aboutYourSelf,
                    "religion":otherDetailsData.religion,
                    "maritalStatus":personalData.maritalStatus,
                    "numberOfChildren": personalData.numberOfChildren,
                    "postedBy":postedby.answer
    
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
                    "community": otherDetailsData.community,
                    "subCommunity": otherDetailsData.subCommunity,
                    "gothra": otherDetailsData.gothra,
                    "timeOfBirth": otherDetailsData.timeOfBirth,
                    "dateOfBirth": otherDetailsData.dateOfBirth,
                    "placeOfBirth": otherDetailsData.placeOfBirth,
                    "motherTongue": otherDetailsData.motherTongue,
                },
                "location_background": {
                    "currentLocation": locationDetailsData.currentLocation,
                    "cityOfResidence": locationDetailsData.cityOfResidence || "",
                    "nationality": locationDetailsData.nationality,
                    "citizenShip": locationDetailsData.citizenShip,
                    "residencyVisaStatus": locationDetailsData.residencyVisaStatus,
                },
                "education_and_financial": {
                    "qualification": qualificationDetailsData.qualification,
                    "education": qualificationDetailsData.occupation,
                    "workingStatus": qualificationDetailsData.currentWorkingStatus,
                    "income": qualificationDetailsData.income,
                },
                "interest_and_hobbies": answer

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


export const dummyMatchedProfiles = catchAsyncError(async (req, res, next) => {
    try {
        const { userId } = req.user;

        const users = await User.findAll({
            where: {
                userId: { [Op.ne]: userId }
            }
        });

       const data = users.map(user => {
            return {
                userId: user.userId,
                firstName: user.firstName,
                email: user.email,
                fcmToken: user.fcmToken
            }
        })
        return res.status(200).json({
            success: true,
            data: {
                userdata: data
            }
        });
    } catch (error) {
        return next(new errorHandler(error.message, 500));
    }
});









