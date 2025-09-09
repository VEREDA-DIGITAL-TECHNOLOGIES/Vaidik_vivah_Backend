// redis.js
import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const isTls = process.env.REDISURL?.startsWith('rediss://');

export const redis = createClient({
  url: process.env.REDISURL,
  socket: {
    // keep the TCP socket alive so load balancers / NATs don't drop it
    keepAlive: 10_000,
    noDelay: true,
    // simple backoff: 0.2s, 0.4s, ... up to 5s
    reconnectStrategy(retries) {
      return Math.min(retries * 200, 5000);
    },
    // enable TLS if using "rediss://"
    tls: isTls ? {} : undefined,
  },
});

let connecting = null;

redis.on('error', (err) => {
  console.error('Redis Client Error:', err?.message || err);
});
redis.on('ready', () => {
  console.log('Redis Client Ready');
});
redis.on('end', () => {
  console.warn('Redis connection closed');
});

export async function connectRedis() {
  if (redis.isOpen) return;
  if (!connecting) {
    connecting = redis.connect().finally(() => { connecting = null; });
  }
  await connecting;
  // quick health check
  await redis.ping();
  console.log('Redis connection established');
}

// connect once at startup
await connectRedis();

// graceful shutdown
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    try { await redis.quit(); } finally { process.exit(0); }
  });
}
