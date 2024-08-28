import express from "express";
import { isAuthenticated} from '../Middlewares/auth.js';
import {myDetails, updatePersonalDetails,updateFamilyDetails,updatePersonalBackground,updateReligiousBackground,updateLocationDetails,updateEducationAndFinancialDetails,dummyMatchedProfiles} from '../Controllers/profile.controller.js'



const profileRouter = express.Router();


profileRouter.get('/mydetails',isAuthenticated,myDetails);
profileRouter.put('/updatePersonalDetails',isAuthenticated,updatePersonalDetails);
profileRouter.put('/updateFamilyDetails',isAuthenticated,updateFamilyDetails);
profileRouter.put('/updatePersonalBackground',isAuthenticated,updatePersonalBackground);
profileRouter.put('/updateReligiousBackground',isAuthenticated,updateReligiousBackground);
profileRouter.put('/updateLocationDetails',isAuthenticated,updateLocationDetails);
profileRouter.put('/updateEducationAndFinancialDetails',isAuthenticated,updateEducationAndFinancialDetails);
// profileRouter.get('/getProfiles',isAuthenticated,MatchedProfiles)
profileRouter.get('/getDummyProfiles',isAuthenticated,dummyMatchedProfiles)

export default profileRouter
