import { Redis } from "ioredis";
import dotenv from 'dotenv';
dotenv.config();

const redisClient = ()=>{
    if(process.env.REDISURL){
        console.log(`Redis Connected `);
        return process.env.REDISURL;
    }
    throw new Error('Redis connection failed')
}

export const redis =  new Redis(redisClient());