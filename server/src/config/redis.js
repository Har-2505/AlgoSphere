const { createClient } = require('redis');

const redisclient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'rosegold-lace-floral-45855.db.redis.io',
        port: 17304
    }
});



module.exports = redisclient;