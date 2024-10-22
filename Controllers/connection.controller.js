import { Op } from "sequelize";
import Connection from "../Models/connection.model.js";
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";

export const sendConnectionRequest = catchAsyncError(async (req, res, next) => {


    try {
        const senderId = req.user.userId;
        const { receiverId } = req.body;

        if (senderId === receiverId) {
            return next(new errorhandler("You can't connect with yourself!", 400));
        }


        const existingConnection = await Connection.findOne({
            where: {
                [Op.or]: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });

        if (!existingConnection) {
            const connection = await Connection.create({ senderId, receiverId, status: 'pending' });
            return res.status(201).json({ success: true, message: "Connection request sent successfully!", data: connection });

        }


        if (existingConnection.status === 'accepted' || existingConnection.status === 'pending') {
            return next(new errorhandler("Connection already exists!", 400));
        }

    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

export const cancelConnectionRequest = catchAsyncError(async (req, res, next) => {


    try {

        const senderId = req.user.userId;
        const { receiverId } = req.body;

        if (senderId === receiverId) {
            return next(new errorhandler("You can't cancel connection with yourself!", 400));
        }


        const connection = await Connection.findOne({
            where: {
                [Op.or]: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });

        if (!connection) {
            return next(new errorhandler("Connection not found!", 404));
        }

        if (connection.status === 'accepted') {
            return next(new errorhandler("Connection already accepted!", 400));
        }

        connection.status = 'cancelled';
        await connection.save();

        return res.status(200).json({ success: true, message: "Connection cancelled successfully!" });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

export const removeConnection = catchAsyncError(async (req, res, next) => {
    try {
        const senderId = req.user.userId;
        const { receiverId } = req.body;

        if (senderId === receiverId) {
            return next(new errorhandler("You can't remove connection with yourself!", 400));
        }

        const connection = await Connection.findOne({
            where: {
                [Op.or]: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });


        if (!connection) {
            return next(new errorhandler("Connection not found!", 404));
        }

        await connection.destroy();

        return res.status(200).json({ success: true, message: "Connection removed successfully!" });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

export const acceptConnectionRequest = catchAsyncError(async (req, res, next) => {
    try {
        const receiverId = req.user.userId;
        const { senderId } = req.body;

        if (receiverId === senderId) {
            return next(new errorhandler("You can't accept your own connection request!", 400));
        }

        const connection = await Connection.findOne({
            where: {
                senderId: senderId,
                receiverId: receiverId,
                status: 'pending'
            }
        });

        if (!connection) {
            return next(new errorhandler("Connection request not found!", 404));
        }

        if (connection.status === 'accepted') {
            return next(new errorhandler("Connection Request already accepted!", 400));
        }

        connection.status = 'accepted';
        await connection.save();

        return res.status(200).json({ success: true, message: "Connection request accepted successfully!" });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});

export const rejectConnectionRequest = catchAsyncError(async (req, res, next) => {


    try {
        const receiverId = req.user.userId;
        const { senderId } = req.body;

        if (receiverId === senderId) {
            return next(new errorhandler("You can't reject your own connection request!", 400));
        }

        const connection = await Connection.findOne({
            where: {
                senderId: senderId,
                receiverId: receiverId,
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

