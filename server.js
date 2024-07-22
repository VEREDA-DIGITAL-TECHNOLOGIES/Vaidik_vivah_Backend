import dotenv from 'dotenv';
import {app} from './app.js';
import connectDB from './Utils/db.js';
import { User, Answer } from './Models/association.js';

dotenv.config();


const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        await User.sync({ force: false });
        await Answer.sync({ force: false });
        console.log('Tables synchronized');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error synchronizing tables or starting server:', error);
    }
};

startServer();

 