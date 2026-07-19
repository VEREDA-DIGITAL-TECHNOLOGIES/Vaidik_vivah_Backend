import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../Models/user.js';
import { redis } from './redis.js'; // same client
dotenv.config();

const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300000');       // ms
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '604800000');  // ms

export const accessTokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire),
  maxAge: accessTokenExpire,
  httpOnly: false,
  sameSite: 'Lax',
  secure: false,
};

export const refreshTokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire),
  maxAge: refreshTokenExpire,
  httpOnly: false,
  sameSite: 'Lax',
  secure: false,
};

export const sendToken = async (user, statusCode, res, message) => {
  const accessToken = user.signAccessToken();
  const refreshToken = user.signRefreshToken();

  // Save lightweight session; TTL = refresh life
  const ttlSeconds = Math.floor(refreshTokenExpire / 1000);
  await redis.set(
    `session:${user.userId}`,
    JSON.stringify({ userId: user.userId, role: user.role }),
    { EX: ttlSeconds }
  );

  res.cookie('access_token', accessToken, accessTokenOptions);
  res.cookie('refresh_token', refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
    refreshToken,
    message,
  });
};
