const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
})();

module.exports = redisClient;
