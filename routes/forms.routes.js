import express from "express";
import { isAuthenticated } from '../Middlewares/auth.js';
import { personalDetailsRegister,qualificationDetailsRegister,locationDetailsRegister,otherDetailsRegister } from "../Controllers/form.controller.js";


const formRouter = express.Router();


formRouter.post('/personalDetails', isAuthenticated,personalDetailsRegister);
formRouter.post('/qualificationDetails',isAuthenticated,qualificationDetailsRegister);
formRouter.post('/locationDetails',isAuthenticated,locationDetailsRegister);
formRouter.post('/otherDetails',isAuthenticated,otherDetailsRegister);

export default formRouter 