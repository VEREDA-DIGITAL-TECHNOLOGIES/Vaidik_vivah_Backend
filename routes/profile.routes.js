import express from "express";
import { isAuthenticated} from '../Middlewares/auth.js';
import {myDetails, updatePersonalDetails,updateFamilyDetails,updatePersonalBackground,updateReligiousBackground,updateLocationDetails,updateEducationAndFinancialDetails,MatchedProfiles,UserDetails,filterProfiles,filterFieldCount,updateInterstAndHobbies,UpdatephotoUpload} from '../Controllers/profile.controller.js'
import { upload } from "../Middlewares/multer.js";




const profileRouter = express.Router();


profileRouter.get('/mydetails',isAuthenticated,myDetails);
profileRouter.put('/updatePersonalDetails',isAuthenticated,updatePersonalDetails);
profileRouter.put('/updateFamilyDetails',isAuthenticated,updateFamilyDetails);
profileRouter.put('/updatePersonalBackground',isAuthenticated,updatePersonalBackground);
profileRouter.put('/updateReligiousBackground',isAuthenticated,updateReligiousBackground);
profileRouter.put('/updateLocationDetails',isAuthenticated,updateLocationDetails);
profileRouter.put('/updateInterstAndHobbies',isAuthenticated,updateInterstAndHobbies);
profileRouter.put('/updateEducationAndFinancialDetails',isAuthenticated,updateEducationAndFinancialDetails);
profileRouter.put('/updatephotoUpload',isAuthenticated,upload.array('profileImage',3),UpdatephotoUpload)
profileRouter.get('/getProfiles',isAuthenticated,MatchedProfiles)
profileRouter.get('/filterFieldCount',isAuthenticated,filterFieldCount)
profileRouter.post('/getUserDetails',isAuthenticated,UserDetails)
profileRouter.post('/filterProfiles',isAuthenticated,filterProfiles)


export default profileRouter
