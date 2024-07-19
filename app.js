import dotenv from 'dotenv';
import express from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import {ErrorMiddleware} from './Middlewares/error.js'
dotenv.config();


app.use(express.json({limit:"50mb"}));


app.use(cookieParser());


app.use(cors({
    origin: process.env.ORIGIN
}))

app.get("/test", (req, res, next) => {
    res.status(200).json({ success: true , message:"Api is working"
    })
})


app.use(ErrorMiddleware);