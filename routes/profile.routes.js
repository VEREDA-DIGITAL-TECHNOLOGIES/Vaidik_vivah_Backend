import express from "express";
import { isAuthenticated} from '../Middlewares/auth.js';
import {myDetails, updatePersonalDetails,updateFamilyDetails,updatePersonalBackground,updateReligiousBackground,updateLocationDetails,updateEducationAndFinancialDetails,MatchedProfiles,UserDetails,filterFieldCount,updateInterstAndHobbies,UpdatephotoUpload,adminProfileImage,matrimonialProfiles,getuserImage,allProfiles,getProfilePercentage,discoverProfiles, UpdatephotoUploadForWeb} from '../Controllers/profile.controller.js'
import { upload } from "../Middlewares/multer.js";
import { getContactNumber, updateContactNumber } from "../Controllers/personalDetailsController.js";




const profileRouter = express.Router();


profileRouter.get('/mydetails',isAuthenticated,myDetails);
profileRouter.get('/get-profile-img',isAuthenticated,adminProfileImage);
profileRouter.get('/get-matrimonial-profiles',isAuthenticated,matrimonialProfiles);
profileRouter.put('/updatePersonalDetails',isAuthenticated,updatePersonalDetails);
profileRouter.put('/updateFamilyDetails',isAuthenticated,updateFamilyDetails);
profileRouter.put('/updatePersonalBackground',isAuthenticated,updatePersonalBackground);
profileRouter.put('/updateReligiousBackground',isAuthenticated,updateReligiousBackground);
profileRouter.put('/updateLocationDetails',isAuthenticated,updateLocationDetails);
profileRouter.put('/updateInterstAndHobbies',isAuthenticated,updateInterstAndHobbies);
profileRouter.put('/updateEducationAndFinancialDetails',isAuthenticated,updateEducationAndFinancialDetails);
profileRouter.put('/updatephotoUpload',isAuthenticated,upload.array('profileImage',3),UpdatephotoUpload)
profileRouter.put('/updatephotoUploadForWed',isAuthenticated,upload.array('profileImage',3),UpdatephotoUploadForWeb)
profileRouter.get('/getProfiles',isAuthenticated,MatchedProfiles)
profileRouter.get('/filterFieldCount',isAuthenticated,filterFieldCount)
profileRouter.post('/getUserDetails',isAuthenticated,UserDetails)
// profileRouter.get('/filterProfiles' ,isAuthenticated,filterProfiles)
profileRouter.get('/getuserImage',isAuthenticated,getuserImage)
profileRouter.get('/allProfiles',isAuthenticated,allProfiles)
profileRouter.get('/discoverProfiles',isAuthenticated,discoverProfiles)
profileRouter.get('/getProfilePercentage',isAuthenticated,getProfilePercentage)

// Get contact number
profileRouter.get("/contact/:userId", getContactNumber);

// Update contact number
profileRouter.put("/contact/:userId", updateContactNumber);
export default profileRouter
