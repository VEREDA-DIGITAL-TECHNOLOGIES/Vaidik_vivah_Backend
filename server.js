import dotenv from 'dotenv';
import {app} from './app.js'
import connectDB from './Utils/db.js'
dotenv.config();

app.listen(process.env.PORT , ()=>{
    console.log(`server is running on ${process.env.PORT}`)
    connectDB();
})
 