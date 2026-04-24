import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

// ✅ correct env key
const REDIS_URL = process.env.REDIS_URL;

// optional safety
if (!REDIS_URL) {
  console.warn('⚠️ REDIS_URL not set, Redis disabled');
}

const isTls = REDIS_URL?.startsWith('rediss://');

export const redis = createClient({
  url: REDIS_URL,
  socket: {
    keepAlive: 10000,
    noDelay: true,
    reconnectStrategy(retries) {
      return Math.min(retries * 200, 5000);
    },
    tls: isTls ? {} : undefined,
  },
});

let connecting = null;

redis.on('error', (err) => {
  console.error('Redis Client Error:', err?.message || err);
});

redis.on('ready', () => {
  console.log('✅ Redis Client Ready');
});

redis.on('end', () => {
  console.warn('⚠️ Redis connection closed');
});

export async function connectRedis() {
  if (!REDIS_URL) return; // skip if not set

  if (redis.isOpen) return;

  if (!connecting) {
    connecting = redis.connect().finally(() => {
      connecting = null;
    });
  }

  await connecting;

  await redis.ping();
  console.log('✅ Redis connection established');
}

// ✅ DO NOT crash app if Redis fails
try {
  await connectRedis();
} catch (err) {
  console.error('❌ Redis failed, continuing without Redis');
}

// graceful shutdown
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    try {
      if (redis.isOpen) await redis.quit();
    } finally {
      process.exit(0);
    }
  });
}