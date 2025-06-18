const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL // e.g. redis://localhost:6379 or Redis Cloud URI
});

client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await client.connect();
})();

module.exports = client;
