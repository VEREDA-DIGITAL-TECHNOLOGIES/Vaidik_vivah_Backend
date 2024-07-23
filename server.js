import dotenv from 'dotenv';
import {app} from './app.js';
import connectDB from './Utils/db.js';
import { User, Answer , personal, otherDetails, locationDetails, imageUpload, qualificationDetails} from './Models/association.js';

dotenv.config();


const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        await User.sync({ force: false });
        await Answer.sync({ force: false });
        await personal.sync({ force: false });
        await otherDetails.sync({ force: false });
        await locationDetails.sync({ force: false });
        await imageUpload.sync({ force: false });
        await qualificationDetails.sync({ force: false });

        console.log('Tables synchronized');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error synchronizing tables or starting server:', error);
    }
};

startServer();

 