import Admin from '../../Models/Admin/Admin.modal.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import errorhandler from "../../Utils/errorhandler.js";
import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import sendEmail from "../../Utils/sendMail.js";
import { redis } from "../../Utils/redis.js";
import { accessTokenOptions, refreshTokenOptions } from "../../Utils/jwt.js";


export const registerAdmin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new errorhandler("Email and Password are required", 400));
    }

    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
        return next(new errorhandler("Admin already exists", 400));
    }

    // Create admin with provided fields (others get defaults)
    const admin = await Admin.create({ 
        email, 
        password,
        // Add any other required fields here
    });

    res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        admin: {
            adminId: admin.adminId,
            email: admin.email,
            role: admin.role,
            status: admin.status
        }
    });
});

export const adminLogin = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new errorhandler("Email and Password are required", 400));
    }

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
        return next(new errorhandler("Invalid credentials", 401));
    }

    const isPasswordValid = await admin.validPassword(password);
    if (!isPasswordValid) {
        return next(new errorhandler("Invalid credentials", 401));
    }

  
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp='123456'
    await redis.set(`otp:${email}`, otp, { EX: 300 });


    try {
        
        // await sendEmail({
        //     email,
        //     subject: "Your Login OTP",
        //     template: "admin-login.ejs",
        //     data: { 
        //         activationCode: otp, 
        //         email 
        //     }
        // });

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            email
        });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});




export const verifyLoginOtp = catchAsyncError(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new errorhandler("Email and OTP are required", 400));
    }


    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp.toString()) {
        return next(new errorhandler("Invalid or expired OTP", 401));
    }

  
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
        return next(new errorhandler("Admin not found", 404));
    }

    
    req.admin = {
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role
    };

    // Generate tokens
    const accessToken = jwt.sign(
        { adminId: admin.adminId, email: admin.email, role: admin.role },
        process.env.ACCESSTOKEN,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { adminId: admin.adminId },
        process.env.REFRESHTOKEN,
        { expiresIn: '7d' }
    );

    await redis.set(`admin:${admin.adminId}`, JSON.stringify({
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role,
        status: admin.status
    }), { EX: 604800 }); // 7 days

  
    await redis.del(`otp:${email}`);


    res.cookie('access_token', accessToken, accessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        admin: {
            adminId: admin.adminId,
            email: admin.email,
            role: admin.role,
            status: admin.status
        },
        tokens: {
            accessToken,
            refreshToken
        }
    });
});



export const adminLogout = catchAsyncError(async (req, res, next) => {
    const { adminId } = req.admin;

   
    await redis.del(`admin:${adminId}`);

   
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(200).json({ 
        success: true, 
        message: "Logged out successfully" 
    });
});

export const updateAdminAccessToken = catchAsyncError(async (req, res, next) => {
    try {
        const refresh_token = req.cookies.refresh_token || 
                            req.headers["refresh_token"] || 
                            req.headers.authorization?.split(" ")[1];

        if (!refresh_token) {
            return next(new errorhandler("Please login to access this resource", 400));
        }

        const decoded = jwt.verify(refresh_token, process.env.REFRESHTOKEN);
        const message = 'Could not refresh token';
        
        if (!decoded) {
            return next(new errorhandler(message, 401));
        }

        const session = await redis.get(`admin:${decoded.adminId}`);
        if (!session) {
            return next(new errorhandler(message, 401));
        }

        const admin = JSON.parse(session);

        const accessToken = jwt.sign(
            { adminId: admin.adminId, email: admin.email, role: admin.role },
            process.env.ACCESSTOKEN,
            { expiresIn: "5m" }
        );

        const refreshToken = jwt.sign(
            { adminId: admin.adminId },
            process.env.REFRESHTOKEN,
            { expiresIn: "7d" }
        );

        // Update the session in Redis
        await redis.set(`admin:${admin.adminId}`, session, { EX: 604800 }); // 7 days

        // Set cookies
        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        res.status(200).json({ 
            success: true, 
            accessToken, 
            refreshToken 
        });

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});


