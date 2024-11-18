import personalDetails from "../Models/personalDetails.model.js";
import qualificationDetails from "../Models/qualificationDetails.model.js";
import locationDetails from "../Models/locationDetails.model.js";
import otherDetails from "../Models/otherDetails.model.js";
import calculateCompletion from "../Utils/calculateCompletion.js";
import imageUpload from "../Models/imageUpload.model.js";
import question from "../Models/question.model.js";
import Answer from "../Models/answer.model.js";
import User from "../Models/user.js";
import dotenv from "dotenv";
import connection from "../Models/connection.model.js";
import { Op, where } from "sequelize";
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { uploadCloudinary } from "../Utils/cloudinary.js";
import recommendation from "../Models/recommendation.model.js";
import { redis } from "../Utils/redis.js";
import axios from "axios";
import moment from 'moment';
dotenv.config();

export const myDetails = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user.userId;


    const user = await  User.findOne({where:{userId}});
    const fcmToken =  user.fcmToken;
    const personalData = await personalDetails.findOne({ where: { userId } });
    const qualificationDetailsData = await qualificationDetails.findOne({
      where: { userId },
    });
    const locationDetailsData = await locationDetails.findOne({
      where: { userId },
    });
    const otherDetailsData = await otherDetails.findOne({ where: { userId } });
    const imageUploadData =(await imageUpload.findOne({ where: { userId } })) || "";
    const basic_lifestyle = await Answer.findOne({
      where: { userId, questionId: 12 },
    });
    const gender = await Answer.findOne({ where: { userId } });
    const age = await Answer.findOne({ where: { userId, questionId: 7 } });
    const postedby = await Answer.findOne({ where: { userId, questionId: 6 } });
    const answer = basic_lifestyle.answer;
    const data = [
      {
        fcmToken:fcmToken,
        profileImage: imageUploadData.image,
        basic_and_lifestye: {
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          displayName: personalData.displayName,
          gender: gender.answer,
          age: age.answer,
          about: personalData.aboutYourSelf,
          religion: otherDetailsData.religion,
          maritalStatus: personalData.maritalStatus,
          numberOfChildren: personalData.numberOfChildren,
          postedBy: postedby.answer,
        },
        family_details: {
          fatherOccupation: otherDetailsData.fatherOccupation,
          motherOccupation: otherDetailsData.motherOccupation,
          numberOfSiblings: otherDetailsData.numberOfSiblings,
          livingWithFamily: otherDetailsData.livingWithFamily,
        },
        personal_background: {
          height: otherDetailsData.height,
          weight: otherDetailsData.weight,
          bodyType: otherDetailsData.bodyType,
          language: otherDetailsData.language,
          smokingHabbit: otherDetailsData.smokingHabbit,
          drinkingHabbit: otherDetailsData.drinkingHabbit,
          diet: otherDetailsData.diet,
          complexion: otherDetailsData.complexion,
        },
        religious_background: {
          religion: otherDetailsData.religion,
          community: otherDetailsData.community,
          subCommunity: otherDetailsData.subCommunity,
          gothra: otherDetailsData.gothra,
          timeOfBirth: otherDetailsData.timeOfBirth,
          dateOfBirth: otherDetailsData.dateOfBirth,
          placeOfBirth: otherDetailsData.placeOfBirth,
          motherTongue: otherDetailsData.motherTongue,
        },
        location_background: {
          currentLocation: locationDetailsData.currentLocation,
          cityOfResidence: locationDetailsData.cityOfResidence || "",
          nationality: locationDetailsData.nationality,
          citizenShip: locationDetailsData.citizenShip,
          residencyVisaStatus: locationDetailsData.residencyVisaStatus,
        },
        education_and_financial: {
          qualification: qualificationDetailsData.qualification,
          education: qualificationDetailsData.occupation,
          workingStatus: qualificationDetailsData.currentWorkingStatus,
          income: qualificationDetailsData.income,
        },
        interest_and_hobbies: answer,
      },
    ];




    return res.status(200).json({
      success: true,
      data,
      message: "Profile fetched successfully!",
    });
  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
});

export const getuserImage = catchAsyncError(async (req, res, next) => {
  try{
  const userId = req.user.userId;

  const imageUploadData =(await imageUpload.findOne({ where: { userId } })) || "";

  const singleImage  = imageUploadData.image[0] || "";

  res.status(200).json({
    success: true,
    data : singleImage
  });

  if (!imageUploadData) {
    return next(new errorhandler("Image not found!", 400));
  }


}
catch(error){
  return next(new errorhandler(error.message, 500));
}

});

export const updatePersonalDetails = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId;

  const { firstName, lastName, displayName, maritalStatus, aboutYourSelf } =
    req.body;

  const personalData = await personalDetails.findOne({ where: { userId } });

  if (!personalData) {
    return next(new errorhandler("Personal details not found!", 400));
  }

  await personalDetails.update(
    { firstName, lastName, displayName, aboutYourSelf, maritalStatus },
    { where: { userId } }
  );

  await recommendation.update(
    { firstName, lastName, displayName },
    { where: { userId } }
  );

  res.status(201).json({
    success: true,
    message: "Personal details updated successfully",
  });
});

export const updateFamilyDetails = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId;
  const {
    fatherOccupation,
    motherOccupation,
    numberOfSiblings,
    livingWithFamily,
  } = req.body;

  const otherDetailsData = await otherDetails.findOne({ where: { userId } });

  if (!otherDetailsData) {
    return next(new errorhandler("Other details not found!", 400));
  }

  const updateOtherDetails = await otherDetails.update(
    { fatherOccupation, motherOccupation, numberOfSiblings, livingWithFamily },
    { where: { userId } }
  );

  await recommendation.update(
    { fatherOccupation, motherOccupation, numberOfSiblings, livingWithFamily },
    { where: { userId } }
  );

  res.status(201).json({
    success: true,
    message: "Family details updated successfully",
    updateOtherDetails,
  });
});

export const updatePersonalBackground = catchAsyncError( async (req, res, next) => {
  try {

    const userId = req.user.userId;
    const {
      height,
      weight,
      bodyType,
      language,
      smokingHabbit,
      drinkingHabbit,
      diet,
      complexion,
    } = req.body;

    

    const otherDetailsData = await otherDetails.findOne({ where: { userId } });

    if (!otherDetailsData) {
      return next(new errorhandler("Other details not found!", 400));
    }

    const updateOtherDetails = await otherDetails.update(
      {
        height,
        weight,
        bodyType,
        language,
        smokingHabbit,
        drinkingHabbit,
        diet,
        complexion,
      },
      { where: { userId } }
    );

    await recommendation.update(
      {
        height,
        weight,
        bodyType,
        language,
        smokingHabbit,
        drinkingHabbit,
        diet,
        complexion,
      },
      { where: { userId } }
    );

    res.status(201).json({
      success: true,
      message: "Personal Background details updated successfully",
      updateOtherDetails,
    });
  }
  catch (error) {
    return next(new errorhandler(error.message, 500));
  }
});

export const updateReligiousBackground = catchAsyncError(async (req, res, next) => {

  try{
    const userId = req.user.userId;
    const { religion, community, subCommunity, gothra, motherTongue } =
      req.body;


    const otherDetailsData = await otherDetails.findOne({ where: { userId } });

    if (!otherDetailsData) {
      return next(new errorhandler("Other details not found!", 400));
    }

    const updateOtherDetails = await otherDetails.update(
      { religion, community, subCommunity, gothra, motherTongue },
      { where: { userId } }
    );

    await recommendation.update(
      { religion, community, subCommunity, gothra, motherTongue },
      { where: { userId } }
    );

    res.status(201).json({
      success: true,
      message: "Religious Background details updated successfully",
      updateOtherDetails,
    });
  }
catch (error) {
  return next(new errorhandler(error.message, 500));
}});

export const updateLocationDetails = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId;
  const {
    currentLocation,
    cityOfResidence,
    nationality,
    citizenShip,
    residencyVisaStatus,
  } = req.body;

 
  const locationDetailsData = await locationDetails.findOne({
    where: { userId },
  });

  if (!locationDetailsData) {
    return next(new errorhandler("Location details not found!", 400));
  }

  const updateOtherDetails = await otherDetails.update(
    { currentLocation, cityOfResidence },
    { where: { userId } }
  );

  const updateLocationDetails = await locationDetails.update(
    {
      currentLocation,
      cityOfResidence,
      nationality,
      citizenShip,
      residencyVisaStatus,
    },
    { where: { userId } }
  );

  await recommendation.update(
    {
      currentLocation,
      cityOfResidence,
      nationality,
      citizenShip,
      residencyVisaStatus,
    },
    { where: { userId } }
  );

  const data = [...updateOtherDetails, ...updateLocationDetails];

  res.status(201).json({
    success: true,
    message: "Location  details updated successfully",
    data,
  });
});

export const updateEducationAndFinancialDetails = catchAsyncError(
  async (req, res, next) => {
    const userId = req.user.userId;
    const { qualification, currentWorkingStatus, income,highestQualification } = req.body;


    const qualificationDetailsData = await qualificationDetails.findOne({
      where: { userId },
    });

    if (!qualificationDetailsData) {
      return next(new errorhandler("Qualification details not found!", 400));
    }

    const updateQualificationDetails = await qualificationDetails.update(
      {  currentWorkingStatus, income, qualification:highestQualification },
      { where: { userId } }
    );

    await recommendation.update(
      { qualification, currentWorkingStatus, income },
      { where: { userId } }
    );

    res.status(201).json({
      success: true,
      message: "Education and Financial details updated successfully",
      updateQualificationDetails,
    });
  }
);

export const updateInterstAndHobbies = catchAsyncError(
  async (req, res, next) => {
    const userId = req.user.userId;
    const { hobbies } = req.body;

    if (!hobbies) {
      return next(new errorhandler("Hobbies field is required!", 400));
    }

    // Check if the Answer exists for the given question and user
    const interestAndHobbiesData = await Answer.findOne({
      where: { userId, questionId: 12 },
    });


    if (!interestAndHobbiesData) {
      return next(new errorhandler("Interest and Hobbies not found!", 404));
    }

    // Update the hobbies in the Answer table
    const updateInterestAndHobbies = await Answer.update(
      { answer: hobbies },
      { where: { userId, questionId: 12 } }
    );

    await recommendation.update({interest_and_hobbies: hobbies },{ where: { userId, } });

    res.status(200).json({
      success: true,
      message: "Interest and Hobbies updated successfully",
      updateInterestAndHobbies,
    });
  }
);
export const UpdatephotoUpload = catchAsyncError(async (req, res, next) => {
  try{
    const userId = req.user.userId;

    console.log(userId)

        if (!req.files) {
            return next(new errorhandler("Please upload an image!", 400));
        }
    
    
        let userImageUrls;
    
        if (req.files && req.files.length > 0) {
            const userImagesLocal = req.files.map((file) => file.path);
    
            const userImages = await uploadCloudinary(userImagesLocal);
    
            userImageUrls = Array.isArray(userImages) ? userImages.map((image) => image.url)
                : [userImages.url];
        }
    
        const imageUploadData = await imageUpload.update({ image: userImageUrls},{ where: { userId } });

    
           await recommendation.update({image: userImageUrls}, { where: { userId } });
    
           await User.update({isImageFormFilled: true}, { where: { userId } });
    
          res.status(201).json({
            success: true,
            message: "Image uploaded successfully",
        })
  }catch(error){
    return next(new errorhandler(error.message, 500));
  }
  
})

export const MatchedProfiles = catchAsyncError(async (req, res, next) => {
  try {
    const { userId } = req.user; // Get userId from the request context
    const { page = 1, pageSize = 20 } = req.query; 

    // Make the POST request to the external service with pagination parameters in the body
    const response = await axios.post(
      "https://recommendation.vigorify.in/get_matches2/",
      {
        userId,
        page,
        pageSize,
      }
    );
        

    const profiles = response.data.filter((profile)=>profile.gender !== null && profile.age !== null && profile.firstName !== null && profile.lastName !== null && profile.displayName !== null && profile.occupation !== null && profile.state !== null && profile.country !== null && profile.maritalStatus !== null && profile.profileImages !== null);

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({
        success: false,
        profiles: [],
        message: "No matches found",
      });
    }

    return res.status(200).json({
      success: true,
      profiles,
    });
  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
});

export const UserDetails = catchAsyncError(async (req, res, next) => {

  try {
    const connectedUserId = req.user.userId
    const { userId } = req.body;

    const user = await  User.findOne({where:{userId}});
    const fcmToken =  user.fcmToken;
    const personalData = await personalDetails.findOne({ where: { userId } });
    const qualificationDetailsData = await qualificationDetails.findOne({ where: { userId }, });
    const locationDetailsData = await locationDetails.findOne({ where: { userId },});
    const otherDetailsData = await otherDetails.findOne({ where: { userId } });
    const imageUploadData = (await imageUpload.findOne({ where: { userId } })) || "";
    const basic_lifestyle = await Answer.findOne({ where: { userId, questionId: 12 },});
    const gender = await Answer.findOne({where: { userId, questionId: 1 },});
    const age = await Answer.findOne({where: { userId, questionId: 7 },});
    const postedby = await Answer.findOne({where: { userId, questionId: 6 },});
    const answer = basic_lifestyle.answer;
    const connectionStatus = await connection.findOne({
      where: {
        [Op.or]: [
          { senderId: connectedUserId, receiverId: userId }, // user2 sent request to user1
          { receiverId: connectedUserId, senderId: userId } // user1 sent request to user2
        ]
      }
    });


  
  const connection_status = (() => {
    if (connectionStatus) {
        if (connectionStatus.status === 'cancelled' || connectionStatus.status === 'rejected') {
            return 'no connection';  
        }
        return connectionStatus.status;  
    }
    return 'no connection';
    })();

    const isSender = connectionStatus && connectionStatus.senderId === connectedUserId; // user2 sent the request
    const isReceiver = connectionStatus && connectionStatus.receiverId === connectedUserId; // user2 received the request

// Determine connection type to display appropriate status
const connectionType = (() => {
    if (isSender) {
        return 'sender';
    } else if (isReceiver) {
        return 'receiver';
    } else {
        return 'none';
    }
})(); 



    const data = [
      {
        fcmToken:fcmToken,
        profileImage: imageUploadData.image,
        basic_and_lifestye: {
          userId: userId,
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          displayName: personalData.displayName,
          gender: gender.answer,
          age: age.answer,
          about: personalData.aboutYourSelf,
          religion: otherDetailsData.religion,
          maritalStatus: personalData.maritalStatus,
          numberOfChildren: personalData.numberOfChildren,
          postedBy: postedby.answer,
        },
        family_details: {
          fatherOccupation: otherDetailsData.fatherOccupation,
          motherOccupation: otherDetailsData.motherOccupation,
          numberOfSiblings: otherDetailsData.numberOfSiblings,
          livingWithFamily: otherDetailsData.livingWithFamily,
        },
        personal_background: {
          height: otherDetailsData.height,
          weight: otherDetailsData.weight,
          bodyType: otherDetailsData.bodyType,
          language: otherDetailsData.language,
          smokingHabbit: otherDetailsData.smokingHabbit,
          drinkingHabbit: otherDetailsData.drinkingHabbit,
          diet: otherDetailsData.diet,
          complexion: otherDetailsData.complexion,
        },
        religious_background: {
          religion: otherDetailsData.religion,
          community: otherDetailsData.community,
          subCommunity: otherDetailsData.subCommunity,
          gothra: otherDetailsData.gothra,
          timeOfBirth: otherDetailsData.timeOfBirth,
          dateOfBirth: otherDetailsData.dateOfBirth,
          placeOfBirth: otherDetailsData.placeOfBirth,
          motherTongue: otherDetailsData.motherTongue,
        },
        location_background: {
          currentLocation: locationDetailsData.currentLocation,
          cityOfResidence: locationDetailsData.cityOfResidence || "",
          nationality: locationDetailsData.nationality,
          citizenShip: locationDetailsData.citizenShip,
          residencyVisaStatus: locationDetailsData.residencyVisaStatus,
        },
        education_and_financial: {
          qualification: qualificationDetailsData.qualification,
          education: qualificationDetailsData.occupation,
          workingStatus: qualificationDetailsData.currentWorkingStatus,
          income: qualificationDetailsData.income,
        },
        interest_and_hobbies: answer,
        connection_status: connection_status,
        connectionType: connectionType, 

    },
    ];

    res.status(200).json({
      success: true,
      data,
      message: "Profile fetched successfully!",
    });
  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
});

export const filterProfiles = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      ageRange,
      heightRange,
      income,
      religion,
      ethnicity,
      highestQualification,
      smokingHabbit,
      workingwith,
      maritalStatus,
      eatingHabbits,
      community,
    } = req.body;


    const currentUser = await recommendation.findOne({ where: { userId } });
    const lookingFor = currentUser?.lookingFor;

    const Users = await User.findAll({
      where: {
        userId: { [Op.ne]: userId },
      },
    });


    const userIds = Users.map((user) => user.userId);
    const age1 = ageRange.split("-")[0];
    const age2 = ageRange.split("-")[1];
    const height1 = heightRange.split("-")[0];
    const height2 = heightRange.split("-")[1];
    console.log(userIds, "userIds");


    const recommendedUsers = await recommendation.findAll({
      where: {
        userId: { [Op.in]: userIds },
        gender: lookingFor,
        [Op.or]: [
          { age: { [Op.between]: [age1, age2] } },
          { height: { [Op.between]: [height1, height2] } },
          { income: income ? income : { [Op.ne]: null } },
          { nationality: (ethnicity && !ethnicity.includes('All')) ? { [Op.in]: ethnicity } : { [Op.ne]: null } },
          {
            religion: (religion && !religion.includes('All'))
              ? { [Op.in]: religion }
              : { [Op.ne]: null },
          },
          { qualification: (highestQualification && highestQualification !== 'All') ? highestQualification : { [Op.ne]: null } },
          { smokingHabbit: smokingHabbit ? smokingHabbit : { [Op.ne]: null } },
          { diet: (eatingHabbits && eatingHabbits !== 'All') ? eatingHabbits : (eatingHabbits ? eatingHabbits : { [Op.ne]: null }) },
          { occupation: (workingwith && workingwith !== 'All') ? workingwith : (workingwith ? workingwith : { [Op.ne]: null }) },
          { maritalStatus: (maritalStatus && maritalStatus !== 'All') ? maritalStatus : (maritalStatus ? maritalStatus : { [Op.ne]: null }) },
          { community: (community && community !== 'All') ? community : (community ? community : { [Op.ne]: null }) },
        ],
      },
    });

    const totalScore = 100;
    const weights = {
      religion: 10,
      age: 10,
      height: 10,
      income: 10,
      ethnicity: 10,
      highestQualification: 10,
      smokingHabbit: 10,
      occupation: 10,
      maritalStatus: 10,
      eatingHabbits: 10,
      community: 10,
    };


    const data = recommendedUsers.map((user) => {
      let matchScore = 0;

      if (user.religion === currentUser.religion) matchScore += weights.religion;
      if (user.age >= ageRange.min && user.age <= ageRange.max) matchScore += weights.age;
      if (user.height >= heightRange.min && user.height <= heightRange.max) matchScore += weights.height;
      if (user.income === income) matchScore += weights.income;
      if (user.nationality === ethnicity) matchScore += weights.ethnicity;
      if (user.qualification === highestQualification) matchScore += weights.highestQualification;
      if (user.smokingHabbit === smokingHabbit) matchScore += weights.smokingHabbit;
      if (user.occupation === workingwith) matchScore += weights.occupation;
      if (user.maritalStatus === maritalStatus) matchScore += weights.maritalStatus;
      if (user.diet === eatingHabbits) matchScore += weights.eatingHabbits;
      if (user.community === community) matchScore += weights.community;

      const matchPercentage = (matchScore / totalScore) * 100;
      return {
        userId: user.userId,
        gender: user.gender,
        religion: user.religion,
        age: user.age,
        maritalStatus: user.maritalStatus,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        occupation: user.occupation,
        state: user.state,
        country: user.country,
        userType: user.usertype,
        profileImages: user.image,
        match_percentage: matchPercentage,

      };
    });




    return res.status(200).json({
      success: true,
      data: {
        profiles: data,
      },
    });
  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
});

export const filterFieldCount = catchAsyncError(async (req, res, next) => {

  try {

   const data = [];


   const Religion ={
    Hinduism: await otherDetails.count({ where:  { religion: 'Hinduism' }, }),
    Islam: await otherDetails.count({ where: { religion: 'Islamic' } }),
    Buddhism: await otherDetails.count({ where: { religion: 'Buddhism' } }),
    Christian: await otherDetails.count({ where: { religion: 'Christianity' } }),
    judaism: await otherDetails.count({ where: { religion: 'Judaism' } }),

   }

   const Ethinicity = {
    Indian: await locationDetails.count({ where: { nationality: 'Indian' } }),
    American: await locationDetails.count({ where: { nationality: 'American' } }),
    Africaners: await locationDetails.count({ where: { nationality: 'African' } }),
    Japanese: await locationDetails.count({ where: { nationality: 'Japanese' } }),
   }

   const HighestQualification = {
    Masters: await qualificationDetails.count({ where: { qualification: 'Masters' } }),
    Bachelor: await qualificationDetails.count({ where: { qualification: 'Bachelors' } }),
    Tenth: await qualificationDetails.count({ where: { qualification: '10th' } }),
    Tweleventh: await qualificationDetails.count({ where: { qualification: '12th' } }),
   }

   const workingwith = {
    Private: await qualificationDetails.count({ where: { occupation: 'Private' } }),
    Non_Working: await qualificationDetails.count({ where: { occupation: 'Non_Working' } }),
    Businness: await qualificationDetails.count({ where: { occupation: 'Business' } }),
    Government: await qualificationDetails.count({ where: { occupation: 'Government' } }),
    Defense: await qualificationDetails.count({ where: { occupation: 'Defense' } }),
   }

   const maritalStatus = {
    NeverMarried: await personalDetails.count({ where: { maritalStatus: 'NeverMarried' } }),
    Married: await personalDetails.count({ where: { maritalStatus: 'Married' } }),
    Divorced: await personalDetails.count({ where: { maritalStatus: 'Divorced' } }),
    Widowed: await personalDetails.count({ where: { maritalStatus: 'Widowed' } }),
    AwatingDivorce: await personalDetails.count({ where: { maritalStatus: 'Awaiting Divorce' } }),
    Annualed: await personalDetails.count({ where: { maritalStatus: 'Annualed' } }),
   }

   const eatingHabbits = {
    Vegetarian: await otherDetails.count({ where: { diet: 'Vegetarian' } }),
    Non_Vegetarian: await otherDetails.count({ where: { diet: 'Non-Vegetarian' } }),
    Eggetarian: await otherDetails.count({ where: { diet: 'Eggetarian' } }),
    Jain: await otherDetails.count({ where: { diet: 'Jain' } }),
    Vegan: await otherDetails.count({ where: { diet: 'Vegan' } }),
   }


   const community = {
    Gujarati: await otherDetails.count({ where: { community: 'Gujarati' } }),
    Vaishnav: await otherDetails.count({ where: { community: 'Vaishnav' } }),
    Brahmin: await otherDetails.count({ where: { community: 'Brahmin' } }),
    Patel: await otherDetails.count({ where: { community: 'Patel' } }),
    Lohana: await otherDetails.count({ where: { community: 'Lohana' } }),
    Vania: await otherDetails.count({ where: { community: 'Vania' } }),
    Suthar: await otherDetails.count({ where: { community: 'Suthar' } }),
   }

   data.push(Religion, Ethinicity, HighestQualification, workingwith, maritalStatus, eatingHabbits, community);
   return res.status(200).json({
    success: true,
    message: "Filter count fetched successfully!",
    data: data
   })


   

  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
  
})

export const matrimonialProfiles = catchAsyncError(async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;

    // Fetch all users excluding the current user
    const users = await User.findAll({
      where: {
        userId: { [Op.ne]: currentUserId } // Exclude the current user
      },
      order: [["createdAt", "DESC"]],
    });

    if (!users || users.length === 0) {
      return next(new errorhandler("Users not found!", 404));
    }

    // Process each user to fetch the related details
    const profiles = await Promise.all(users.map(async (user) => {
      const personalData = await personalDetails.findOne({ where: { userId: user.userId } });
      const otherDetailsData = await otherDetails.findOne({ where: { userId: user.userId } });

      // Fetch age and postedBy details from the Answer table
      const ageDetail = await Answer.findOne({
        where: { questionId: 7, userId: user.userId }
      });

      const postedByDetail = await Answer.findOne({
        where: { questionId: 6, userId: user.userId }
      });

      return {
        id: user.userId,
        name: personalData ? `${personalData.firstName} ${personalData.lastName}` : null,
        age: ageDetail ? ageDetail.answer : null,
        religion: otherDetailsData ? otherDetailsData.religion : null,
        postedBy: postedByDetail ? postedByDetail.answer : null,
      };
    }));

    res.status(200).json({
      success: true,
      data: profiles,
    });

  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
});

//admin profile image
export const adminProfileImage = catchAsyncError(async (req, res, next) => {

  try {
    const userId = req.user.userId
    console.log(userId)
    const imageUploadData =(await imageUpload.findOne({ where: { userId } })) || "";
    const image = imageUploadData.image[0] || "";

    res.status(200).json({
      success: true,
      image: image
    })

  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
      
})


export const allProfiles = catchAsyncError(async (req, res, next) => {
  try {

    const currentUserId = req.user.userId;
    const currentDate = moment().startOf('day').toDate();

    const users = await User.findAll({
      where: {
        userId: { [Op.ne]: currentUserId },
        isImageFormFilled: true,
        isPersonalFormFilled: true,
        isQualificationFormFilled: true,
        isLocationFormFilled: true,
        isOtherFormFilled: true,
        createdAt: {
          [Op.gte]: currentDate,
          [Op.lt]: moment(currentDate).add(1, 'days').toDate(),
        },
      },
    });


   const profiles = users.map((user) => {
      return {
        userId: user.userId,
      };
    });

    res.status(200).json({
      success: true,
      data: profiles,
      message: "All profiles fetched successfully!",
    });
  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
});


export const getProfilePercentage = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const personalData = await personalDetails.findOne({ where: { userId } });
    const qualificationDetailsData = await qualificationDetails.findOne({ where: { userId } });
    const locationDetailsData = await locationDetails.findOne({ where: { userId } });
    const otherDetailsData = await otherDetails.findOne({ where: { userId } });
    const basic_lifestyle = await Answer.findOne({ where: { userId, questionId: 12 } });
    const gender = await Answer.findOne({ where: { userId } });
    const age = await Answer.findOne({ where: { userId, questionId: 7 } });
    const postedby = await Answer.findOne({ where: { userId, questionId: 6 } });
    const answer = basic_lifestyle.answer;

    const data = {
      basic_and_lifestye: {
        firstName: personalData.firstName,
        lastName: personalData.lastName,
        displayName: personalData.displayName,
        gender: gender.answer,
        age: age.answer,
        about: personalData.aboutYourSelf,
        religion: otherDetailsData.religion,
        maritalStatus: personalData.maritalStatus,
        numberOfChildren: personalData.numberOfChildren,
        postedBy: postedby.answer,
      },
      family_details: {
        fatherOccupation: otherDetailsData.fatherOccupation,
        motherOccupation: otherDetailsData.motherOccupation,
        numberOfSiblings: otherDetailsData.numberOfSiblings,
        livingWithFamily: otherDetailsData.livingWithFamily,
      },
      personal_background: {
        height: otherDetailsData.height,
        weight: otherDetailsData.weight,
        bodyType: otherDetailsData.bodyType,
        language: otherDetailsData.language,
        smokingHabbit: otherDetailsData.smokingHabbit,
        drinkingHabbit: otherDetailsData.drinkingHabbit,
        diet: otherDetailsData.diet,
        complexion: otherDetailsData.complexion,
      },
      religious_background: {
        religion: otherDetailsData.religion,
        community: otherDetailsData.community,
        subCommunity: otherDetailsData.subCommunity,
        gothra: otherDetailsData.gothra,
        timeOfBirth: otherDetailsData.timeOfBirth,
        dateOfBirth: otherDetailsData.dateOfBirth,
        placeOfBirth: otherDetailsData.placeOfBirth,
        motherTongue: otherDetailsData.motherTongue,
      },
      location_background: {
        currentLocation: locationDetailsData.currentLocation,
        cityOfResidence: locationDetailsData.cityOfResidence || "",
        nationality: locationDetailsData.nationality,
        citizenShip: locationDetailsData.citizenShip,
        residencyVisaStatus: locationDetailsData.residencyVisaStatus,
      },
      education_and_financial: {
        qualification: qualificationDetailsData.qualification,
        education: qualificationDetailsData.occupation,
        workingStatus: qualificationDetailsData.currentWorkingStatus,
        income: qualificationDetailsData.income,
      },
      interest_and_hobbies: answer,
    };

    const percentage = calculateCompletion(data);

    res.status(200).json({
      success: true,
      percentage:  percentage,
      message: "Profile percentage fetched successfully!",
    });


  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }


})

