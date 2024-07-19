import dotenv from 'dotenv';
import { Sequelize } from "sequelize";
dotenv.config();

const connectDB = ()=>{
    const sequelize = new Sequelize( 
        process.env.DATABASE,
        process.env.USER,
        process.env.PASSWORD,
        {
            host: process.env.HOST,
            dialect: "postgres"
        }
    )
    
    sequelize.authenticate().then(() => {
        console.log("Database Connection has been established successfully.");
    }).catch((error) => {
        console.log(error.message);
        setTimeout(connectDB, 5000);
    })
}

export default connectDB ;
