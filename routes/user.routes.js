import express from "express";
const userRouter = express.Router();



import { registrationUser,activateUser,setPassword } from "../Controllers/user.controller.js";


userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/set-password", setPassword);


export default userRouter