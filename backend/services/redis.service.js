import redis from 'ioredis';

const redisClient = new redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,

    
    maxRetriesPerRequest: 1,
    connectTimeout: 750,
    enableOfflineQueue: false,
    retryStrategy: () => null
});

redisClient.on('connect', () => {
    console.log('Redis Connected')
});

redisClient.on('error', (err) => {
    
    console.log('Redis error:', err?.message || err);
});

export default redisClient;