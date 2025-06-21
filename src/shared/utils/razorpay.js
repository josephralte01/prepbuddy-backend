const Razorpay = require('razorpay');
const config = require('../config/env.js'); // Import config

let razorpayInstance;

if (config.razorpay.keyId && config.razorpay.keySecret) {
    razorpayInstance = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret
    });
} else {
    console.warn("Razorpay KEY_ID or KEY_SECRET not configured. Payment features will not work.");
    // Provide a mock or null implementation if needed to prevent app crashes
    // For now, razorpayInstance will be undefined if not configured.
    // Functions using it will need to check.
    razorpayInstance = {
        orders: {
            create: async () => {
                console.error("Razorpay not configured, cannot create order.");
                throw new Error("Payment service (Razorpay) not configured.");
            }
            // Mock other methods as needed if you want graceful degradation
        }
        // Add other Razorpay client methods if used directly and need mocking
    };
}

module.exports = razorpayInstance;
