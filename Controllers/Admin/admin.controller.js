import Admin from '../../Models/Admin/Admin.modal.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import errorhandler from "../../Utils/errorhandler.js";
import { catchAsyncError } from "../../Middlewares/catchAsyncError.js";
import sendEmail from "../../Utils/sendMail.js";
import { redis } from "../../Utils/redis.js";
import { accessTokenOptions, refreshTokenOptions } from "../../Utils/jwt.js";

/* --------------------------------------------------
   REGISTER ADMIN
-------------------------------------------------- */
export const registerAdmin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new errorhandler("Email and Password are required", 400));
  }

  const existingAdmin = await Admin.findOne({ where: { email } });
  if (existingAdmin) {
    return next(new errorhandler("Admin already exists", 400));
  }

  const admin = await Admin.create({ email, password });

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

/* --------------------------------------------------
   LOGIN (SEND OTP)
-------------------------------------------------- */
export const adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new errorhandler("Email and Password are required", 400));
  }

  const admin = await Admin.findOne({ where: { email } });
  if (!admin) return next(new errorhandler("User does not exist", 401));

  const isPasswordValid = await admin.validPassword(password);
  if (!isPasswordValid) return next(new errorhandler("Your password is incorrect", 401));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(`otp:${email}`, otp, { EX: 300 }); // expires in 5 mins

  try {
    await sendEmail({
      email,
      subject: "Your Login OTP",
      template: "admin-login.ejs",
      data: { activationCode: otp, email },
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      email,
    });
  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
});

/* --------------------------------------------------
   VERIFY LOGIN OTP
-------------------------------------------------- */
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
  if (!admin) return next(new errorhandler("Admin not found", 404));

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

  await redis.set(
    `admin:${admin.adminId}`,
    JSON.stringify({
      adminId: admin.adminId,
      email: admin.email,
      role: admin.role,
      status: admin.status,
    }),
    { EX: 604800 } // 7 days
  );

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
      status: admin.status,
    },
    tokens: { accessToken, refreshToken },
  });
});

/* --------------------------------------------------
   LOGOUT ADMIN
-------------------------------------------------- */
export const adminLogout = catchAsyncError(async (req, res, next) => {
  const { adminId } = req.admin;

  await redis.del(`admin:${adminId}`);
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/* --------------------------------------------------
   REFRESH ACCESS TOKEN
-------------------------------------------------- */
export const updateAdminAccessToken = catchAsyncError(async (req, res, next) => {
  try {
    const refresh_token =
      req.cookies.refresh_token ||
      req.headers["refresh_token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!refresh_token) {
      return next(new errorhandler("Please login to access this resource", 400));
    }

    const decoded = jwt.verify(refresh_token, process.env.REFRESHTOKEN);
    if (!decoded) {
      return next(new errorhandler("Could not refresh token", 401));
    }

    const session = await redis.get(`admin:${decoded.adminId}`);
    if (!session) {
      return next(new errorhandler("Session expired. Please login again.", 401));
    }

    const admin = JSON.parse(session);

    const accessToken = jwt.sign(
      { adminId: admin.adminId, email: admin.email, role: admin.role },
      process.env.ACCESSTOKEN,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { adminId: admin.adminId },
      process.env.REFRESHTOKEN,
      { expiresIn: "7d" }
    );

    await redis.set(`admin:${admin.adminId}`, session, { EX: 604800 });

    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(new errorhandler(error.message, 500));
  }
});

/* --------------------------------------------------
   FORGOT PASSWORD - SEND OTP
-------------------------------------------------- */
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new errorhandler("Email is required", 400));

  const admin = await Admin.findOne({ where: { email } });
  if (!admin) return next(new errorhandler("Admin not found", 404));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(`forgot:${email}`, otp, { EX: 300 });

  await sendEmail({
    email,
    subject: "Admin Password Reset OTP",
    template: "admin-forgot.ejs",
    data: { activationCode: otp, email },
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to your email for password reset",
    email,
  });
});

/* --------------------------------------------------
   RESET PASSWORD - VERIFY OTP & CHANGE PASSWORD
-------------------------------------------------- */
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return next(new errorhandler("Email, OTP, and new password are required", 400));

  const storedOtp = await redis.get(`forgot:${email}`);
  if (!storedOtp || storedOtp !== otp.toString()) {
    return next(new errorhandler("Invalid or expired OTP", 400));
  }

  const admin = await Admin.findOne({ where: { email } });
  if (!admin) return next(new errorhandler("Admin not found", 404));

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  admin.password = hashedPassword;
  await admin.save();

  await redis.del(`forgot:${email}`);

  res.status(200).json({
    success: true,
    message: "Password reset successful. You can now login with your new password.",
  });
});

/* --------------------------------------------------
   RESEND OTP (LOGIN OR FORGOT PASSWORD)
-------------------------------------------------- */
export const resendOtp = catchAsyncError(async (req, res, next) => {
  const { email, type } = req.body; // type: 'login' or 'forgot'
  if (!email || !type)
    return next(new errorhandler("Email and type are required", 400));

  const admin = await Admin.findOne({ where: { email } });
  if (!admin) return next(new errorhandler("Admin not found", 404));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const redisKey = type === "login" ? `otp:${email}` : `forgot:${email}`;
  await redis.set(redisKey, otp, { EX: 300 });

  const subject = type === "login" ? "Your Login OTP" : "Admin Password Reset OTP";
  const template = type === "login" ? "admin-login.ejs" : "admin-forgot.ejs";

  await sendEmail({
    email,
    subject,
    template,
    data: { activationCode: otp, email },
  });

  res.status(200).json({
    success: true,
    message: "OTP resent successfully to your email",
    email,
    type,
  });
});
