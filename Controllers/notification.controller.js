//  import * as admin from "firebase-admin";
//  import errorhandler from "../Utils/errorhandler.js";
//  import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
//  import { Op } from "sequelize";


//  const sendNotification = catchAsyncError(async (req, res, next) => {
//     try{
//         const {fcmToken,message,Notification} = req.body;

//         if(!fcmToken){
//          return next(new errorhandler("fcmToken is required", 400));
//         }

//         if(!message){
//         return next(new errorhandler("message is required", 400));
//         }

//         if(!Notification){
//         return next(new errorhandler("Notification is required", 400));
//         }

//         const messageData = {
//           token : fcmToken,
//           Notification:{
//             title: Notification.title,
//             body: Notification.body,
//           },
//           data:{
//             message: message
//           }
//         }

//         const response = await admin.messaging().send( messageData);
//         res.status(200).json({
//          success: true,
//          data: response
//         })  
//     }
//     catch(error){
//         return next(new errorhandler(error.message, 500));
//     }
// })