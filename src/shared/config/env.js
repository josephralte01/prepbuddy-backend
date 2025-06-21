const dotenv = require('dotenv');
const Joi = require('joi');
const path = require('path');

// Load .env file contents into process.env
// This will load from .env in the root directory by default.
// For different environments (test, prod), .env files can be managed accordingly.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // Adjust path based on where this file is and where .env is (project root)

// Define validation schema for environment variables
const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(5000),
    CLIENT_URL: Joi.string().uri().required().description('Frontend URL for CORS and email links'),

    MONGODB_URI: Joi.string().required().description('MongoDB connection string'),

    JWT_SECRET: Joi.string().required().min(32).description('JWT secret key (min 32 chars)'),
    JWT_EXPIRES_IN: Joi.string().default('30d').description('JWT expiry duration'),
    JWT_COOKIE_EXPIRES_IN_DAYS: Joi.number().integer().min(1).default(30).description('JWT cookie expiry in days'),

    OPENAI_API_KEY: Joi.string().optional().description('OpenAI API Key'), // Optional if AI features are not core
    OPENAI_MODEL: Joi.string().default('gpt-3.5-turbo').description('OpenAI Model'),

    // For email, these are optional if email sending is not critical or handled differently
    EMAIL_FROM: Joi.string().email().optional().description('Email address for sending emails'),
    EMAIL_PASS: Joi.string().optional().description('Password for the email account (use app-specific password for production)'),

    RAZORPAY_KEY_ID: Joi.string().optional().description('Razorpay Key ID'), // Optional if payments not used
    RAZORPAY_KEY_SECRET: Joi.string().optional().description('Razorpay Key Secret'),

    REDIS_URL: Joi.string().uri().optional().description('Redis connection URL'), // Optional if caching/Redis not used
})
.unknown(true); // Allow other undefined env variables without failing validation

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
    throw new Error(`Environment variable validation error: ${error.message}`);
}

// Export validated and processed environment variables
module.exports = {
    nodeEnv: envVars.NODE_ENV,
    port: envVars.PORT,
    clientUrl: envVars.CLIENT_URL,

    mongodb: {
        uri: envVars.MONGODB_URI,
    },

    jwt: {
        secret: envVars.JWT_SECRET,
        expiresIn: envVars.JWT_EXPIRES_IN,
        cookieExpiresInDays: envVars.JWT_COOKIE_EXPIRES_IN_DAYS,
    },

    openai: {
        apiKey: envVars.OPENAI_API_KEY,
        model: envVars.OPENAI_MODEL,
    },

    email: {
        from: envVars.EMAIL_FROM,
        pass: envVars.EMAIL_PASS, // Be cautious with this in production
    },

    razorpay: {
        keyId: envVars.RAZORPAY_KEY_ID,
        keySecret: envVars.RAZORPAY_KEY_SECRET,
    },

    redis: {
        url: envVars.REDIS_URL,
    },
    // Add other exported configs as needed
};
