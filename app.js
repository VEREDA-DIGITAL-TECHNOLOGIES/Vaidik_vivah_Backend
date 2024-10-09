import dotenv from 'dotenv';
import express from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import {ErrorMiddleware} from './Middlewares/error.js'
import userRouter from './routes/user.routes.js';
import questionRouter from "./routes/question.routes.js"
import formRouter from "./routes/forms.routes.js"
import profileRouter from './routes/profile.routes.js';
import favProfileRouter from './routes/favProfile.routes.js';

dotenv.config();


app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({extended:true}));


app.use(cookieParser());



app.use(cors({
    origin: ["https://kashishmashala.com"], 
    credentials: true,  
  }));
  

//routes
app.use("/api/v1/user",userRouter);
app.use("/api/v1/question",questionRouter);
app.use("/api/v1/form",formRouter);
app.use("/api/v1/profile",profileRouter);
app.use("/api/v1/profile/favorite",favProfileRouter);
 

app.get("/test", async (req, res, next) => {
    res.status(200).json({ success: true ,message:"Api is working"
    })
})


app.use(ErrorMiddleware);