// Lightweight Redis helper that works locally and on Vercel
// Uses ioredis if available; returns null if not configured or module missing

type RedisClient = {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, mode: string, duration: number) => Promise<'OK'>;
};

let redisSingleton: RedisClient | null | undefined;

export async function getRedis(): Promise<RedisClient | null> {
  if (redisSingleton !== undefined) return redisSingleton;
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL; // support common envs
  if (!url) {
    redisSingleton = null;
    return redisSingleton;
  }
  try {
    const { default: IORedis } = await import('ioredis');
    // ioredis accepts a connection string
    redisSingleton = new IORedis(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    }) as unknown as RedisClient;
    // connect lazily on first command; return instance
    return redisSingleton;
  } catch (e) {
    // ioredis not installed; disable redis usage
    console.warn('[rate-limit] ioredis not available; falling back to in-memory store');
    redisSingleton = null;
    return redisSingleton;
  }
}


