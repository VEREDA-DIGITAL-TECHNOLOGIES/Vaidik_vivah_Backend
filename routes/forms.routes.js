import express from "express";
import { isAuthenticated} from '../Middlewares/auth.js';
import { personalDetailsRegister,qualificationDetailsRegister,locationDetailsRegister,otherDetailsRegister,imageUploadRegister, gayatripa } from "../Controllers/form.controller.js";
import { upload } from "../Middlewares/multer.js";




const formRouter = express.Router();


formRouter.post('/personalDetails', isAuthenticated,personalDetailsRegister);
formRouter.post('/qualificationDetails',isAuthenticated,qualificationDetailsRegister);
formRouter.post('/locationDetails',isAuthenticated,locationDetailsRegister);
formRouter.post('/otherDetails',isAuthenticated,otherDetailsRegister);
formRouter.post('/profileImageUpload',isAuthenticated,upload.array('profileImage',3),imageUploadRegister);
formRouter.post('/gayatriDetails', isAuthenticated, gayatripa);


export default formRouter 