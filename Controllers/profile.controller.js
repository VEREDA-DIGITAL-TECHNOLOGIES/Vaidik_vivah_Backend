import personalDetails from "../Models/personalDetails.model.js";
import qualificationDetails from "../Models/qualificationDetails.model.js";
import locationDetails from "../Models/locationDetails.model.js";
import otherDetails from "../Models/otherDetails.model.js";
import imageUpload from "../Models/imageUpload.model.js";
import question from "../Models/question.model.js";
import Answer from "../Models/answer.model.js";
import User from "../Models/user.js";
import dotenv from "dotenv";
import { Op } from "sequelize";
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { uploadCloudinary } from "../Utils/cloudinary.js";
import recommendation from "../Models/recommendation.model.js";
import { redis } from "../Utils/redis.js";
import axios from "axios";
dotenv.config();

export const myDetails = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const personalData = await personalDetails.findOne({ where: { userId } });
    const qualificationDetailsData = await qualificationDetails.findOne({
      where: { userId },
    });
    const locationDetailsData = await locationDetails.findOne({
      where: { userId },
    });
    const otherDetailsData = await otherDetails.findOne({ where: { userId } });
    const imageUploadData =
      (await imageUpload.findOne({ where: { userId } })) || "";
    const basic_lifestyle = await Answer.findOne({
      where: { userId, questionId: 12 },
    });
    const gender = await Answer.findOne({ where: { userId } });
    const age = await Answer.findOne({ where: { userId, questionId: 7 } });
    const postedby = await Answer.findOne({ where: { userId, questionId: 6 } });
    const answer = basic_lifestyle.answer;
    const data = [
      {
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

  if (
    !fatherOccupation ||
    !motherOccupation ||
    !numberOfSiblings ||
    !livingWithFamily
  ) {
    return next(new errorhandler("All fields are required!", 400));
  }

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

export const updatePersonalBackground = catchAsyncError(
  async (req, res, next) => {
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

    if (
      !height ||
      !weight ||
      !bodyType ||
      !language ||
      !smokingHabbit ||
      !drinkingHabbit ||
      !diet ||
      !complexion
    ) {
      return next(new errorhandler("All fields are required!", 400));
    }

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
);

export const updateReligiousBackground = catchAsyncError(
  async (req, res, next) => {
    const userId = req.user.userId;
    const { religion, community, subCommunity, gothra, motherTongue } =
      req.body;

    if (!religion || !community || !subCommunity || !gothra || !motherTongue) {
      return next(new errorhandler("All fields are required!", 400));
    }

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
);

export const updateLocationDetails = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId;
  const {
    currentLocation,
    cityOfResidence,
    nationality,
    citizenShip,
    residencyVisaStatus,
  } = req.body;

  if (
    !currentLocation ||
    !cityOfResidence ||
    !nationality ||
    !citizenShip ||
    !residencyVisaStatus
  ) {
    return next(new errorhandler("All fields are required!", 400));
  }

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
    const { qualification, currentWorkingStatus, income } = req.body;

    if (!qualification || !currentWorkingStatus || !income) {
      return next(new errorhandler("All fields are required!", 400));
    }

    const qualificationDetailsData = await qualificationDetails.findOne({
      where: { userId },
    });

    if (!qualificationDetailsData) {
      return next(new errorhandler("Qualification details not found!", 400));
    }

    const updateQualificationDetails = await qualificationDetails.update(
      { qualification, currentWorkingStatus, income },
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
      return next(new errorhandler("All fields are required!", 400));
    }

    const interstAndHobbiesData = await Answer.findOne({
      where: { userId },
      questionId: 12,
    });

    if (!interstAndHobbiesData) {
      return next(new errorhandler("Interst and Hobbies not found!", 400));
    }

    const updateInterstAndHobbies = await Answer.update(
      { answer: hobbies },
      { where: { userId }, questionId: 12 }
    );

    await recommendation.update({ hobbies }, { where: { userId } });

    res.status(201).json({
      success: true,
      message: "Interst and Hobbies updated successfully",
      updateInterstAndHobbies,
    });
  }
);

export const MatchedProfiles = catchAsyncError(async (req, res, next) => {
  try {
    const { userId } = req.user; // Get userId from the request context
    const { page = 1, pageSize = 20 } = req.query; // Extract pagination parameters from query

    // Make the POST request to the external service with pagination parameters in the body
    const response = await axios.post(
      "https://recommendation.vigorify.in/get_matches2/",
      {
        userId,
        page,
        pageSize,
      }
    );

    const profiles = response.data;

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
    const { userId } = req.body;

    const personalData = await personalDetails.findOne({ where: { userId } });
    const qualificationDetailsData = await qualificationDetails.findOne({
      where: { userId },
    });
    const locationDetailsData = await locationDetails.findOne({
      where: { userId },
    });
    const otherDetailsData = await otherDetails.findOne({ where: { userId } });
    const imageUploadData =
      (await imageUpload.findOne({ where: { userId } })) || "";
    const basic_lifestyle = await Answer.findOne({
      where: { userId, questionId: 12 },
    });
    const gender = await Answer.findOne({
      where: { userId, questionId: 1 },
    });
    const age = await Answer.findOne({
      where: { userId, questionId: 7 },
    });
    const postedby = await Answer.findOne({
      where: { userId, questionId: 6 },
    });
    const answer = basic_lifestyle.answer;
    const data = [
      {
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
        lookingFor: lookingFor,
        [Op.or]: [
          { age: { [Op.between]: [age1, age2] } } ,
          { height: { [Op.between]: [height1, height2] } },
          { income: income ? income : { [Op.ne]: null } },
          { nationality: ethnicity ? ethnicity : { [Op.ne]: null } }, 
          { religion: religion ? religion : { [Op.ne]: null } }, 
          { qualification: highestQualification ? highestQualification : { [Op.ne]: null } }, 
          { smokingHabbit: smokingHabbit ? smokingHabbit : { [Op.ne]: null } }, 
          { diet: eatingHabbits ? eatingHabbits : { [Op.ne]: null } },
          { occupation: workingwith ? workingwith : { [Op.ne]: null } }, 
          { maritalStatus: maritalStatus ? maritalStatus : { [Op.ne]: null } },
          { community: community ? community : { [Op.ne]: null } }, 
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
        firstName : user.firstName,
        lastName : user.lastName,
        displayName : user.displayName,
        occupation : user.occupation,
        state : user.state,
        country : user.country,
        userType  : user.usertype,
        profileImage : user.image,
        matchPercentage: matchPercentage,

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
