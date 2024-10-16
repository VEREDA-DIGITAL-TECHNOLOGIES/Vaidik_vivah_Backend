import  {catchAsyncError}  from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import Connection from "../Models/connection.model.js";
import { Op } from "sequelize";

export const addConnection = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;
    const { connectionUserId } = req.body;

    try {
        const existingConnection = await Connection.findOne({
            where: {
                [Op.or]: [
                    { userId, connectionUserId },
                    { userId: connectionUserId, connectionUserId: userId }
                ]
            }
        });

        if (existingConnection) {
            return next(new errorhandler("Connection already exists!", 400));
        }

        const connection = await Connection.create({ userId, connectionUserId, status: 'pending' });
        return res.status(201).json({ success: true, message: "Connection request sent successfully!", data: connection });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});


export const acceptConnection = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId; 
    const { connectionUserId } = req.body;

    try {
        const connection = await Connection.findOne({
            where: {
                userId: connectionUserId,
                connectionUserId: userId,
                status: 'pending'
            }
        });

        if (!connection) {
            return next(new errorhandler("Connection request not found!", 404));
        }

        connection.status = 'accepted';
        await connection.save();

        return res.status(200).json({ success: true, message: "Connection request accepted successfully!" });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});


export const rejectConnection = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;
    const { connectionUserId } = req.body;

    try {
        const connection = await Connection.findOne({
            where: {
                userId: connectionUserId,
                connectionUserId: userId,
                status: 'pending'
            }
        });

        if (!connection) {
            return next(new errorhandler("Connection request not found!", 404));
        }

        connection.status = 'rejected';
        await connection.save();

        return res.status(200).json({ success: true, message: "Connection request rejected successfully!" });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});


export const blockConnection = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;
    const { connectionUserId } = req.body;

    try {
        const connection = await Connection.findOne({
            where: {
                userId: connectionUserId,
                connectionUserId: userId
            }
        });

        if (!connection) {
            return next(new errorhandler("Connection not found!", 404));
        }

        connection.status = 'blocked';
        await connection.save();

        return res.status(200).json({ success: true, message: "Connection blocked successfully!" });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});



