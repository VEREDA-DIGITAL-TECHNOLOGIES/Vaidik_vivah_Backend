import User from "../Models/user.js";
import dotenv from 'dotenv';
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import jwt from "jsonwebtoken";
import sendEmail from "../Utils/sendmail.js";
import { sendToken } from "../Utils/jwt.js";
import { redis } from "../Utils/redis.js";
import Answer from '../Models/answer.model.js';
import locationDetails from "../Models/locationDetails.model.js";
import otherDetails from "../Models/otherDetails.model.js";
import personalDetails from "../Models/personalDetails.model.js";
import qualificationDetails from "../Models/qualificationDetails.model.js";
import imageUpload from "../Models/imageUpload.model.js";
import recommendation from "../Models/recommendation.model.js";
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

            res.status(200).json({
                success: true, message: `Please check your email: ${email} to activate your account!`,
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

//for web app activate user
export const activateUser = catchAsyncError(async (req, res, next) => {
    try {
        const { activationToken, activationCode } = req.body;

        const newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);

        if (newUser.activationCode !== activationCode) {
            return next(new errorhandler("Invalid activation code!", 400));
        }

        const token = jwt.sign({ email: newUser.email }, process.env.ACTIVATION_SECRET, { expiresIn: "5min" });

        res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });

        return res.status(200).json({ success: true, message: "Otp verified successfully!" });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});



//for web app set password
export const setPassword = catchAsyncError(async (req, res, next) => {
    try {
        const { password, answer } = req.body;

        console.log(req.body);

        if(!password ) {
            return next(new errorhandler("Password is required!", 400));
        }
        if(!answer ) {
            return next(new errorhandler("Answer is required!", 400));
        }
    


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
        await recommendation.create({
            userId: existingUser.userId,
            email: existingUser.email,
            gender: answerValue[0],
            lookingFor: answerValue[1],
            triedOnlineBefore: answerValue[2],
            weddingGoles: answerValue[3],
            longlookingBefore: answerValue[4],
            whomlookingFor: answerValue[5],
            age: answerValue[6],
            lookingPartnerage: answerValue[7],
            livinginAustralia: answerValue[8],
            horoscopeMatch: answerValue[9],
            castReligionMatterOrNot: answerValue[10],
            interest_and_hobbies: answerValue[11],
        })


        res.clearCookie("token");
        sendToken(existingUser, 200, res, "Password set successfully!");

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

//for mobile app activation
export const activateUserForMobile = catchAsyncError(async (req, res, next) => {
    try {
        const { activationToken, activationCode } = req.body;
        const newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);

        if (newUser.activationCode !== activationCode) {
            return next(new errorhandler("Invalid activation code!", 400));
        }
        const token = jwt.sign({ email: newUser.email }, process.env.ACTIVATION_SECRET, { expiresIn: "5min" });

        return res.status(200).json({ success: true, message: "Otp verified successfully!" ,token});

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

//set password for mobile app
export const setPasswordForMobile = catchAsyncError(async (req, res, next) => {
    try {
        const { password, answer,token } = req.body;

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

        await recommendation.create({
            userId: existingUser.userId,
            email: existingUser.email,
            gender: answerValue[0],
            lookingFor: answerValue[1],
            triedOnlineBefore: answerValue[2],
            weddingGoles: answerValue[3],
            longlookingBefore: answerValue[4],
            whomlookingFor: answerValue[5],
            age: answerValue[6],
            lookingPartnerage: answerValue[7],
            livinginAustralia: answerValue[8],
            horoscopeMatch: answerValue[9],
            castReligionMatterOrNot: answerValue[10],
            interest_and_hobbies: answerValue[11],
        })



        sendToken(existingUser, 200, res, "Password set successfully!");

    }catch(error){
        return next(new errorhandler(error.message, 500));
    }

});

export const loginUser = catchAsyncError(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        console.log(email, password, "email password");
        console.log(user)

        if (!user) {
            return next(new errorhandler("You are not registered!", 400));
        }
        if (!email || !password) {
            return next(new errorhandler("Please enter email and password!", 400));
        }

        const isPasswordMatched = await user.validPassword(password);

        if (!isPasswordMatched) {
            return next(new errorhandler("Invalid email or password!", 400));
        }

        // const userData = {
        //     userid: user.userId,
        //     email: user.email,
        //     usertype: user.usertype,
        //     role: user.role,
        //     isVerified: user.isVerified
        // }
        sendToken(user, 200, res, "Login successfull!");
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }

});

export const logoutUser = catchAsyncError(async (req, res, next) => {
    try {

        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        redis.del(req.user.userId);
        res.status(200).json({ success: true, message: "Logout successful!" });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
})

export const forgotPassword = catchAsyncError(async (req, res, next) => {
    try {
        const { email } = req.body;


        if (!email) {
            return next(new errorhandler("Email is required!", 400));
        }

        const user = await User.findOne({ where: { email } });

         
        if (!user) {
            return next(new errorhandler("Email not found!", 400));
        }

        const activationToken = createActivationToken(email);
        const activationCode = activationToken.activationCode;

        const data = {
            activationCode,
            email,
        };



        try {
            await sendEmail({ email, subject: "Reset Your Password", template: "forgotPassword-mail.ejs", data });

            res.status(200).json({
                success: true, message: `Please check your email: ${email} to Reset your Password!`,
                activationToken: activationToken.token,
            });
        } catch (error) {
            return next(new errorhandler(error.message, 500));
        }

    }
    catch (error) {
        return next(new errorhandler(error.message, 500));
    }

})

//for web app verify otp
export const verifyOtp = catchAsyncError(async (req, res, next) => {
    try {
        const { activationToken, activationCode } = req.body;
        const newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);

        if (newUser.activationCode !== activationCode) {
            return next(new errorhandler("Invalid Reset code!", 400));
        }
        const token = jwt.sign({ email: newUser.email }, process.env.ACTIVATION_SECRET, { expiresIn: "5min" });

        res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });

        return res.status(200).json({ success: true, message: "Reset Otp verified successfully!" });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
})

//for app verify otp
export const verifyOtpForMobile = catchAsyncError(async (req, res, next) => {

    try {
        const { activationToken, activationCode } = req.body;
        const newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);

        if (newUser.activationCode !== activationCode) {
            return next(new errorhandler("Invalid Reset code!", 400));
        }
        const token = jwt.sign({ email: newUser.email }, process.env.ACTIVATION_SECRET, { expiresIn: "5min" });


        return res.status(200).json({ success: true, message: "Reset Otp verified successfully!" ,token});

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
    
})

//for web app reset password
export const resetPassword = catchAsyncError(async (req, res, next) => {
    try {
        const { password } = req.body;

        const token = req.cookies.token;

        if (!token) {
            return next(new errorhandler("Please Verify your email first!", 400));
        }

        const verifiedUser = jwt.verify(token, process.env.ACTIVATION_SECRET);

        if (!verifiedUser) {
            return next(new errorhandler("Please Verify your email first!", 400));
        }
        const user = await User.findOne({ where: { email:verifiedUser.email } });

        user.password = password;

        const updatedUser = await user.save();

        res.clearCookie("token");
        sendToken(updatedUser, 200, res, "Password changed successfully!");
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }

})

//for app reset password
export const resetPasswordForMobile = catchAsyncError(async (req, res, next) => {
    try {
        const { password,token } = req.body;

        if (!token) {
            return next(new errorhandler("Please Verify your email first!", 400));
        }

        const verifiedUser = jwt.verify(token, process.env.ACTIVATION_SECRET);

        if (!verifiedUser) {
            return next(new errorhandler("Please Verify your email first!", 400));
        }
        const user = await User.findOne({ where: { email:verifiedUser.email } });

        user.password = password;

        const updatedUser = await user.save();

        sendToken(updatedUser, 200, res, "Password changed successfully!");
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }

})

export const createOrUpdateFCMToken = catchAsyncError(async(req , res , next) =>{
    try {
        const userId = req.user.userId;

        const { fcmToken } = req.body;

        let user = await User.findOne({ where: { userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        
       const token = user.fcmToken = fcmToken;
       console.log(token);

        // Save the changes
        await user.save();
        res.status(201).json({
            success: true,
            message: "FCM token updated successfully",
            user
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }

})


export const deleteUser = catchAsyncError(async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) {
            return next(new errorhandler("User not found!", 404));
        }

        await User.destroy({ where: { id: req.user.id } });
        await Answer.destroy({ where: { userId: req.user.id } });
        await locationDetails.destroy({ where: { userId: req.user.id } });
        await otherDetails.destroy({ where: { userId: req.user.id } });
        await personalDetails.destroy({ where: { userId: req.user.id } });
        await qualificationDetails.destroy({ where: { userId: req.user.id } });
        await imageUpload.destroy({ where: { userId: req.user.id } });

        res.status(200).json({ success: true, message: "User deleted successfully!" });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
})


export const dummyRegister = catchAsyncError(async (req, res, next) => {
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
            res.status(200).json({
                success: true, message: `Please check your email: ${email} to activate your account!`,
                activationToken: activationToken.token,
            });
        } catch (error) {
            return next(new errorhandler(error.message, 500));
        }
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
})


export const dummyactivateUserForMobile = catchAsyncError(async (req, res, next) => {
    try {
        const { activationToken, activationCode } = req.body;

        // if (newUser.activationCode !== activationCode) {
        //     return next(new errorhandler("Invalid activation code!", 400));
        // }
        const token = jwt.sign({ email: newUser.email }, process.env.ACTIVATION_SECRET, { expiresIn: "5min" });

        return res.status(200).json({ success: true, message: "Otp verified successfully!" ,token});

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});


export const dummyPasswordForMobile = catchAsyncError(async (req, res, next) => {
    try {
        const { password, answer,token } = req.body;

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

        sendToken(existingUser, 200, res, "Password set successfully!");

    }catch(error){
        return next(new errorhandler(error.message, 500));
    }

});

