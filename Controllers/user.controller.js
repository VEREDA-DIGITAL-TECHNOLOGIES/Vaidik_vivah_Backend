import User from "../Models/user.js";
import dotenv from 'dotenv';
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import jwt from "jsonwebtoken";
import sendEmail from "../Utils/sendmail.js";

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
        const { email } = newUser;
        return res.status(200).json({ success: true, message: "Otp verified successfully!", email });
    } catch (error) {        
        return next(new errorhandler(error.message, 500));
    }
});

export const setPassword = catchAsyncError(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return next(new errorhandler("User not found!", 400));
        }

        user.email = email;
        user.password = password;
        user.isVerified = true;
        user.otp = null;
        
        await user.save();
       
        res.status(200).json({ success: true, message: "Password set successfully!" });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});
