import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const DAILY_LIMIT = 15;

export async function checkLimit(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const key = `rate-limit:${userId}:${today}`;

  const count = (await redis.get<number>(key)) ?? 0;
  const allowed = count < DAILY_LIMIT;
  const remaining = DAILY_LIMIT - count;

  return { allowed, count, remaining, limit: DAILY_LIMIT };
}

export async function incrementCount(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const key = `rate-limit:${userId}:${today}`;

  // Atomically increment
  const newCount = await redis.incr(key);

  // Ensure the key expires in 24h (so next day it resets)
  if (newCount === 1) {
    await redis.expire(key, 60 * 60 * 24);
  }

  return newCount;
}
