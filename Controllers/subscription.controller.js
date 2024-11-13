import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import errorhandler from "../Utils/errorhandler.js";
import subscription from "../Models/subscription.model.js";
import User from '../Models/user.js'
import personalDetails from "../Models/personalDetails.model.js";
import sendMail from "../Utils/sendMail.js";
import Recommendation from "../Models/recommendation.model.js";
import {v4 as uuidv4} from "uuid";
import plan from "../Models/plan.model.js";
import Stripe from "stripe";
import cron from "node-cron";
import moment from 'moment';
import { Op } from "sequelize";
import sendEmail from "../Utils/sendMail.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = catchAsyncError(async (req, res, next) => {

    try {
        const userId = req.user.userId
        const { planId } = req.body;

        if (!planId) {
            return next(new errorhandler("Plan ID is required", 400));
        }

        const planData = await plan.findOne({ where: { planId } });

        if (!planData) {
            return next(new errorhandler("Plan not found", 404));
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'alipay', 'klarna'],
            line_items: [
                {
                    price_data: {
                        currency: "aud",
                        product_data: {
                            name: planData.planName,
                            description: planData.description,
                        },
                        unit_amount: planData.price * 100,
                    }, 
                    quantity: 1,
                },
            ],
            mode: "payment",
          
            customer_email: req.user.email,
            success_url: `${process.env.FRONTEND_URL}/Payment-Success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
                planId: planId,
                userId: userId 
            },
        });

        console.log(session, "session");
 
        res.status(201).json({
            success: true, 
            url: session.url,        
         });

    } catch (error) {
        console.error("Error creating checkout session:", error);
        return next(new errorhandler("Failed to create checkout session. Please try again later.", 500));
    }
});


export const handlePaymentSuccess = catchAsyncError(async (req, res, next) => {
    try {

        const  session_id  = req.params.session_id;

        console.log(session_id, "session_id");
        
        if (!session_id) {
            return next(new errorhandler("Session ID is missing", 400));
        }
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return next(new errorhandler("Payment not completed", 400));
        }

        const planId = session.metadata.planId;
        const userId = session.metadata.userId;

        const planData = await plan.findOne({ where: { planId } });

        if (!planData) {
            return next(new errorhandler("Plan not found!", 404));
        }
        const user  = await User.findOne({ where: { userId } });
        const personalDetail = await personalDetails.findOne({ where: { userId } });

        const endDate = moment().add(planData.durationInMonths, 'months').toDate();

        const orderId = `WDL${uuidv4().split('-')[0].toUpperCase()}`;


       const subscriptionData =  await subscription.create({
            orderId,
            planId,
            userId,
            paymentSucessId: session.id,
            endDate,
            deviceType: 'Web',
            paymentStatus: 'Completed',
        });

       if(subscriptionData !== null){
           const user = await User.findOne({ where: { userId } });
           if(user!==null){
                await User.update({ usertype: planData.planName },{ where: { userId }})
                await Recommendation.update({ usertype: planData.planName }, { where: { userId }})
           }

       }
       const inclusive_Tax =  ((planData.price * 10) / 100 ).toFixed(2);
       const email = user.email;

       console.log(inclusive_Tax,email,"data")
       const validUpto = moment(endDate).format('LLL');

       const data = {
           name: personalDetail.firstName + " " + personalDetail.lastName,
           orderId:orderId,
           planName:planData.planName,
           planType: planData.planType,
           validUpto:validUpto,
           includedTax: inclusive_Tax,
           price: planData.price,
           features:planData.featureList,
           total:planData.price,

       }

       console.log(data,"data")


      await sendEmail({ email, subject: `Your Wedlock.au order #${orderId}`, template: "order-mail.ejs", data });

      // console.log(resL,"testing...")

        res.status(201).json({
            success: true,
            message: "Subscription created successfully!",
        });

        
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
    
})

export const  handlePaymentProcessForMobile = catchAsyncError(async (req, res, next) => {

    try {

        const userId = req.user.userId;
        

        const { paymentSucessId, planId } = req.body;


         console.log(paymentSucessId, planId, "session_id, planId");


        if (!paymentSucessId || !planId) {
            return next(new errorhandler("Session ID or plan ID is missing", 400));
        }

        const planData = await plan.findOne({ where: { planId } });

        if (!planData) {
            return next(new errorhandler("Plan not found!", 404));
        }

        const endDate = moment().add(planData.durationInMonths, 'months').toDate();

        const orderId = `WDL${uuidv4().split('-')[0].toUpperCase()}`;

        const subscriptionData =  await subscription.create({
            orderId,
            planId,
            userId,
            paymentSucessId,
            endDate,
            deviceType: 'Mobile',
            paymentStatus: 'Completed',
        });

        if (subscriptionData !== null) {

            const user = await User.findOne({ where: { userId } });
            if (user !== null) {
                await User.update({ usertype: planData.planName }, { where: { userId } });
                await Recommendation.update({ usertype: planData.planName }, { where: { userId } });
            }
        }






        res.status(201).json({
            success: true,
            message: "Subscription created successfully!",
        });


    } catch (error) {

        return next(new errorhandler(error.message, 500));
        
    }
})



export const handleAutoExpiry = catchAsyncError(async (req, res, next) => {

    try {   
        const subscriptionData = await subscription.findAll();

        if (!subscriptionData) {
            return next(new errorhandler("Subscription not found!", 404));
        }

        const today = new Date();

        subscriptionData.forEach(async (subscription) => {

            if (subscription.endDate && subscription.endDate < today) {
                await subscription.update({ paymentStatus: 'Expired' });
            }

        });

        console.log("Subscription updated successfully!");
    } catch (error) {
        console.error("Error updating subscriptions:", error.message);
    }

})


export const getSubscriptionPurchaseHistory = catchAsyncError(async (req, res, next) => {

    try{
    const userId = req.user.userId;

    const subscriptionData = await subscription.findAll({
        where: { userId }
    });

    const planData = await plan.findAll({
        where: { planId: { [Op.in]: subscriptionData.map((sub) => sub.planId) } },
    });

    if (!subscriptionData || subscriptionData.length === 0) {
        return next(new errorhandler("Subscription not found!", 404));
    }
    

    

    const data = subscriptionData.map((sub)=>{
        return {
            orderId: sub.orderId,
            paymentStatus: sub.paymentStatus,
            planName: planData.find((plan) => plan.planId === sub.planId).planName.split(' ').join('-'),
            purchaseDate: moment(sub.createdAt).format('DD-MM-YYYY'),
            amount : planData.find((plan) => plan.planId === sub.planId).price
        }
    })




    res.status(200).json({
        success: true,
        message: "Subscription fetched successfully!",
        data: data
    });
} catch (error) {
    return next (new errorhandler(error.message, 500));
}
});


cron.schedule('0 0 * * *', async () => {
    console.log('Running subscription expiry check at midnight...');
     handleAutoExpiry();
});