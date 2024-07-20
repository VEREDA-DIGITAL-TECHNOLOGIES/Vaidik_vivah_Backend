import dotenv from 'dotenv';
import express from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import {ErrorMiddleware} from './Middlewares/error.js'
import userRouter from './routes/user.routes.js';
import questionRouter from "./routes/question.routes.js"
dotenv.config();


app.use(express.json({limit:"50mb"}));


app.use(cookieParser());



app.use(cors({
    origin: process.env.ORIGIN
}))
//routes
app.use("/api/user", userRouter);
app.use("/api/question",questionRouter);

app.get("/test", (req, res, next) => {
    res.status(200).json({ success: true , message:"Api is working"
    })
})


app.use(ErrorMiddleware);