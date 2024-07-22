import User from "../Models/user.js";
import dotenv from 'dotenv';
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import jwt from "jsonwebtoken";
import sendEmail from "../Utils/sendmail.js";
import { sendToken } from "../Utils/jwt.js";
import { redis } from "../Utils/redis.js";
import Answer from '../Models/answer.model.js';


dotenv.config();

// Register user
export const registrationUser = catchAsyncError(async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log(email);

        if (!email) {
            return next(new errorhandler("Email is required!", 400));
        }

        const isEmailExist = await User.findOne({ where: { email } });

        if (isEmailExist) {
            return next(new errorhandler("You are already registered!", 400));
        }

        const activationToken = createActivationToken(email);
        const activationCode = activationToken.activationCode;



        const data = {
            activationCode,
            email
        };


        try {
            await sendEmail({ email, subject: "Activate Your Account", template: "activation-mail.ejs", data });
            res.status(200).json({ success: true, message: `Please check your email: ${email} to activate your account!`,         
                activationToken: activationToken.token,
            });
        } catch (error) {
            return next(new errorhandler(error.message, 500));
        }
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

export const createActivationToken = (email) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign({ email, activationCode }, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });

    return { activationCode, token };
};

export const activateUser = catchAsyncError(async (req, res, next) => {
    try {
        const { activationToken, activationCode } = req.body;
        const newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);
        
        if (newUser.activationCode !== activationCode) {
            return next(new errorhandler("Invalid activation code!", 400));
        }
        const token = jwt.sign({email: newUser.email}, process.env.ACTIVATION_SECRET, {expiresIn: "5min"});

        res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });

        return res.status(200).json({ success: true, message: "Otp verified successfully!"});
    } catch (error) {        
        return next(new errorhandler(error.message, 500));
    }
});

export const setPassword1 = catchAsyncError(async (req, res, next) => {
    try {
        const {password } = req.body;
        const token = req.cookies.token;

        if (!token) {
            return next(new errorhandler("Please Verify your email first!", 400));
        }

        const user = jwt.verify(token, process.env.ACTIVATION_SECRET);
        const { email } = user;


        if (password.length < 8) {
            return next(new errorhandler("Password must be at least 8 characters!", 400));
        }
        
         User.create({
            email,
            password,
            isVerified: true,
            otp: null
        });

        res.clearCookie("token");
        res.status(200).json({ success: true, message: "Password set successfully!" });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});


export const setPassword = catchAsyncError(async (req, res, next) => {
    try {
        const { password, answer } = req.body;
        const token = req.cookies.token;

        if (!token) {
            return next(new errorhandler("Please Verify your email first!", 400));
        }

        const user = jwt.verify(token, process.env.ACTIVATION_SECRET);
        const { email } = user;

        if (password.length < 8) {
            return next(new errorhandler("Password must be at least 8 characters!", 400));
        }

        const existingUser = await User.create({
            email,
            password,
            isVerified: true,
            otp: null
        });

        if (Array.isArray(answer)) {
            for (const ans of answer) {
                const { questionId, answerValue } = ans;

                console.log(`Saving answer for question ID ${questionId}:`, answerValue);

                await Answer.create({
                    userId: existingUser.userId,
                    questionId,
                    answer: answerValue
                });
            }
        }

        res.clearCookie("token");
        res.status(200).json({ success: true, message: "Password set and answers stored successfully!" });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

export const loginUser = catchAsyncError(async (req, res, next) => {
    try{
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return next(new errorhandler("You are not registered!", 400));
        }
        if(!email || !password ){
            return next(new errorhandler("Please enter email and password!", 400));
        }
        
        const isPasswordMatched = await user.validPassword(password);

        if (!isPasswordMatched) {
            return next(new errorhandler("Invalid email or password!", 400));
        }
        
        const userData = {
            userid : user.userId,
            email: user.email,
            usertype: user.usertype,
            role: user.role,
            isVerified: user.isVerified
        }
        sendToken(user, 200, res);        
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }

});

export const logoutUser = catchAsyncError(async (req, res, next) => {
    try {
       
        res.cookie("access_token", "",{maxAge: 1});
        res.cookie("refresh_token", "",{maxAge: 1});
        redis.del(req.user.userId);
        res.status(200).json({ success: true, message: "Logout successful!" });
      
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
}) 