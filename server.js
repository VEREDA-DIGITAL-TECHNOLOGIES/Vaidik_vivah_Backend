import dotenv from 'dotenv';
import {app} from './app.js';
import connectDB from './Utils/db.js';
import { User, Answer , personalDetails, otherDetails, locationDetails, imageUpload, qualificationDetails,FavProfile,happyStories,Connection,dropDownType,dropdown,ToggleSection, Plan,gayatri, Application } from './Models/association.js';
import Recommendation from './Models/recommendation.model.js';
import subscription from './Models/subscription.model.js';
import call from './Models/call.model.js';
import Notification from './Models/notification.model.js';
import { createServer } from 'http';
import { intializeSocket } from './config/socketConfig.js';
import block from './Models/block.model.js';
import documentUpload from './Models/gayatri.model.js';
import report from './Models/report.model.js';
import Admin from './Models/Admin/Admin.modal.js';
import AdminApiLog from './Models/Admin/AdminApiLog.model.js';
import Banner from './Models/Admin/app.banner.js';
import Contact from './Models/Contact.js';

dotenv.config();


const PORT = process.env.PORT || 3000;



const startServer = async () => {
    try {
    await  connectDB();
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
        await gayatri.sync({ force: false }); 
        await block.sync({ force: false })
        await documentUpload.sync({ force:false});
        await report.sync({ force: false }); 
        await Admin.sync({ force: false }); 
        await AdminApiLog.sync({ force: false }); 
        await Banner.sync({force:false});
        await Contact.sync({force:false});
        await Application.sync({alter:true});

        console.log('Tables synchronized');



        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
        


    } catch (error) {
        console.error('Error synchronizing tables or starting server:', error);
    }
};

startServer();

 