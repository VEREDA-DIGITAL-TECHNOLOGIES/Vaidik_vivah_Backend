import dotenv from 'dotenv';
import {app} from './app.js';
import connectDB from './Utils/db.js';
import { User, Answer , personalDetails, otherDetails, locationDetails, imageUpload, qualificationDetails,FavProfile,happyStories,Connection,dropDownType,dropdown,ToggleSection, Plan } from './Models/association.js';
import Recommendation from './Models/recommendation.model.js';
import subscription from './Models/subscription.model.js';
import call from './Models/call.model.js';
import Notification from './Models/notification.model.js';
import { createServer } from 'http';
import { intializeSocket } from './config/socketConfig.js';




dotenv.config();


const PORT = process.env.PORT || 3000;



const startServer = async () => {
    try {
        await connectDB();
        const server = createServer(app);
        intializeSocket(server);
                
        await Plan.sync({force: false});
        await User.sync({ force: false });
        await Answer.sync({ force: false });
        await personalDetails.sync({ force: false });
        await otherDetails.sync({ force: false });
        await locationDetails.sync({ force: false }); 
        await imageUpload.sync({ force: false });
        await qualificationDetails.sync({ force: false });
        await Recommendation.sync({ force: false });
        await FavProfile.sync({ force: false });
        await happyStories.sync({ force: false });
        await Connection.sync({ force: false });
        await subscription.sync({ force: false });
        await dropDownType.sync({ force: false });
        await dropdown.sync({ force: false });
        await subscription.sync({ force: false });
        await call.sync({ force: false });
        await Notification.sync({ force: false });
        await ToggleSection.sync({ force: false }); 
        

        console.log('Tables synchronized');


        // app.listen(PORT, () => {
        //     console.log(`Server is running on port ${PORT}`);
        // });

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
        


    } catch (error) {
        console.error('Error synchronizing tables or starting server:', error);
    }
};

startServer();

 