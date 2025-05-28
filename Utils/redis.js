import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.REDISURL,
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Redis Client Connected');
});

export async function connectRedis() {
  try {
    await client.connect();
    console.log('Redis connection established');
  } catch (err) {
    console.error('Redis connection error', err);
  }
}

connectRedis();

export const redis = client;
