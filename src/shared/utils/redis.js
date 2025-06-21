const redis = require('redis');
const config = require('../config/env.js'); // Import config

let redisClient;

if (config.redis.url) {
    redisClient = redis.createClient({
        url: config.redis.url
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));

    // Connect to Redis
    // It's better to handle connection promise and export client after connection or provide a connect method.
    // For simplicity here, we'll attempt to connect. Consumer should check client.isReady.
    redisClient.connect().catch(err => {
        console.error('Failed to connect to Redis:', err);
        // Application might still run, but caching features will be unavailable.
        // Or, could implement a more robust retry or error handling strategy.
    });

} else {
    console.warn("Redis URL not configured. Caching features will be disabled.");
    // Create a mock client that doesn't do anything or throws errors,
    // to prevent crashes if parts of the app expect a Redis client.
    redisClient = {
        get: async (key) => { console.warn("Redis not configured: GET called"); return null; },
        set: async (key, value, options) => { console.warn("Redis not configured: SET called"); return null; },
        setEx: async (key, duration, value) => { console.warn("Redis not configured: SETEX called"); return null; },
        del: async (key) => { console.warn("Redis not configured: DEL called"); return null; },
        on: (event, handler) => { if(event === 'error') handler(new Error("Redis not configured."))}, // Mock error handler
        connect: async () => { console.warn("Redis not configured: CONNECT called"); throw new Error("Redis not configured."); },
        isReady: false, // Indicate client is not ready
        // Add other methods used by your application
    };
}

module.exports = redisClient;
