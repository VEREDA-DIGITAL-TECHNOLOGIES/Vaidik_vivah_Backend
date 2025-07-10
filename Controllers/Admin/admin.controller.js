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

  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:${email}`, otp, { EX: 300 }); // 5 minutes expiry

    try {
        
        await sendEmail({
            email,
            subject: "Your Login OTP",
            template: "admin-login.ejs",
            data: { 
                activationCode: otp, 
                email 
            }
        });

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

    // Get stored OTP
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp.toString()) {
        return next(new errorhandler("Invalid or expired OTP", 401));
    }

    // OTP verified - get admin details
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
        return next(new errorhandler("Admin not found", 404));
    }

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

    // Store session in Redis
    await redis.set(`admin:${admin.adminId}`, JSON.stringify({
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role,
        status: admin.status
    }), { EX: 604800 }); // 7 days

    // Clear OTP from Redis
    await redis.del(`otp:${email}`);

    // Set cookies
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