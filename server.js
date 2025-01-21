import dotenv from 'dotenv';
import {app} from './app.js';
import connectDB from './Utils/db.js';
import { User, Answer , personalDetails, otherDetails, locationDetails, imageUpload, qualificationDetails,FavProfile,happyStories,Connection,dropDownType,dropdown } from './Models/association.js';
import Recommendation from './Models/recommendation.model.js';
import plan from './Models/plan.model.js';
import subscription from './Models/subscription.model.js';

dotenv.config();


const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

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
        await plan.sync({ force: false });
        await subscription.sync({ force: true });
        await dropDownType.sync({ force: false });
        await dropdown.sync({ force: false });
        

        console.log('Tables synchronized');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error synchronizing tables or starting server:', error);
    }
};

startServer();

 