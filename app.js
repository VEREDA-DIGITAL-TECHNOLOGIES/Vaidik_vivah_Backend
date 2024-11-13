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
import happyStoryRouter from './routes/happyStory.routes.js';
import favProfileRouter from './routes/favProfile.routes.js';
import connectionRouter from './routes/connection.routes.js';
import planRouter from './routes/plan.routes.js';
import notificationRouter from './routes/notification.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import billingRouter from './routes/billing.routes.js';


 

dotenv.config();


app.use(express.json({limit:"50mb"}));
app.use(express.static("./public"));

app.use(express.urlencoded({extended:true}));


app.use(cookieParser());



app.use(cors({
    origin: ["https://wedlock.au", "https://admin.wedlock.au",'http://localhost:5173','http://localhost:5176'],
    credentials: true,  
  }));
  

//routes
app.use("/api/v1/user",userRouter);
app.use("/api/v1/question",questionRouter);
app.use("/api/v1/form",formRouter);
app.use("/api/v1/profile",profileRouter);
app.use("/api/v1/profile/favorite",favProfileRouter);
app.use("/api/v1/connection",connectionRouter);
app.use("/api/v1/happyStories",happyStoryRouter);
app.use("/api/v1/plan",planRouter);
app.use("/api/v1/subscription",subscriptionRouter);
app.use("/api/v1/billing",billingRouter);
app.use("/api/v1/notifications",notificationRouter);

 

app.get("/test", async (req, res, next) => {
    res.status(200).json({ success: true ,message:"Api is working"
    })
})


app.use(ErrorMiddleware);