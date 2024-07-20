import express from "express";
const userRouter = express.Router();

import { registrationUser,activateUser,setPassword,loginUser,logoutUser } from "../Controllers/user.controller.js";
import { isAuthenticated } from "../Middlewares/auth.js";


userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/set-password", setPassword);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated,logoutUser);

export default userRouter