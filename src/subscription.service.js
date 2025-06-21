const crypto = require('crypto');
const Subscription = require('../subscription.model.js'); // Path from src/
const User = require('../users/user.model.js'); // Path from src/
const razorpay = require('../shared/utils/razorpay.js'); // Path from src/, will use config internally
const config = require('../shared/config/env.js'); // Import config

// Plan details should ideally be managed in a config or DB, not hardcoded in service.
// For now, mirroring the structure from controller for consistency during refactor.
const PLANS = {
    basic: { id: 'basic_monthly', name: 'Basic', price: 199, durationDays: 30, benefits: ['Full syllabus', 'Unlimited tests', '2-year PYQs'] },
    premium: { id: 'premium_monthly', name: 'Premium', price: 499, durationDays: 30, benefits: ['10-year PYQs', 'Mentor access', 'Leaderboard'] },
    free: { id: 'free_tier', name: 'Free', price: 0, durationDays: null, benefits: ['Limited access', '2 mock tests/week'] }
};

class SubscriptionService {
    getPlans() {
        return Object.values(PLANS).map(p => ({
            tier: p.id, // Using planId as 'tier' for client consistency with createOrder
            name: p.name,
            price: p.price,
            benefits: p.benefits,
            durationDays: p.durationDays
        }));
    }

    async createPaymentOrder(userId, planId) {
        const selectedPlan = Object.values(PLANS).find(p => p.id === planId);
        if (!selectedPlan || selectedPlan.price <= 0) {
            throw { statusCode: 400, message: 'Invalid plan selected or plan is free.' };
        }

        const amountInPaise = selectedPlan.price * 100;
        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_user_${userId}_${Date.now()}`,
            notes: {
                userId: userId.toString(),
                planId: selectedPlan.id,
                tierName: selectedPlan.name
            }
        };

        const order = await razorpay.orders.create(options);
        if (!order) {
            throw { statusCode: 500, message: "Failed to create Razorpay order." };
        }
        return { orderId: order.id, amount: order.amount, currency: order.currency, plan: selectedPlan };
    }

    async verifyPaymentAndUpdateSubscription({ userId, razorpay_order_id, razorpay_payment_id, razorpay_signature, planId }) {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
            throw { statusCode: 400, message: "Payment verification details are incomplete." };
        }

        const selectedPlan = Object.values(PLANS).find(p => p.id === planId);
        if (!selectedPlan) {
            throw { statusCode: 400, message: "Invalid plan ID associated with payment." };
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', config.razorpay.keySecret) // Use config
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            // Log failed attempt, potentially update a pending subscription to 'payment_failed'
            // For now, just throwing an error.
            throw { statusCode: 400, message: 'Payment verification failed. Invalid signature.' };
        }

        // Payment is authentic
        const now = new Date();
        const endDate = selectedPlan.durationDays ? new Date(now.getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000) : null;

        let subscription = await Subscription.findOne({ user: userId });
        if (!subscription) {
            subscription = new Subscription({ user: userId });
        }

        subscription.planId = selectedPlan.id;
        subscription.tier = selectedPlan.name.toLowerCase();
        subscription.status = 'active';
        subscription.paymentProvider = 'razorpay';
        subscription.providerOrderId = razorpay_order_id;
        subscription.providerPaymentId = razorpay_payment_id;
        subscription.providerSignature = razorpay_signature;
        subscription.startDate = now;
        subscription.endDate = endDate;
        // Consider adding to a history sub-document if keeping track of all subscription changes
        // subscription.history.push({ /* ... */ });
        await subscription.save();

        await User.findByIdAndUpdate(userId, { subscriptionTier: subscription.tier });

        // TODO: Emit event or notification for successful subscription (e.g., using an event emitter)

        return subscription; // Return the updated subscription document
    }

    async getUserSubscription(userId) {
        let subscription = await Subscription.findOne({ user: userId })
            .select('-providerPaymentId -providerSignature -providerOrderId'); // Exclude sensitive/internal details

        if (!subscription) {
            const user = await User.findById(userId).select('subscriptionTier');
            // Default to a free plan representation if no explicit subscription doc exists
            return {
                user: userId,
                status: 'active', // Free tier is always 'active'
                tier: user ? user.subscriptionTier : 'free',
                planId: PLANS.free.id,
                startDate: user ? user.createdAt : new Date(), // Assuming free starts at user creation
                endDate: null, // Free plan doesn't expire
                message: "User is currently on the default free plan."
            };
        }
        return subscription;
    }
}

module.exports = new SubscriptionService();
