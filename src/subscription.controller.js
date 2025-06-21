const SubscriptionService = require('./subscription.service.js');

// Helper to handle service call errors
const handleServiceError = (res, error) => {
    console.error('Subscription Service Error:', error.message || error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'An unexpected server error occurred.';
    res.status(statusCode).json({ message });
};

exports.getPlans = async (req, res) => {
  try {
    const plans = SubscriptionService.getPlans(); // This is synchronous in the service
    res.status(200).json({ plans });
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;
    const orderDetails = await SubscriptionService.createPaymentOrder(userId, planId);
    res.status(201).json(orderDetails);
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const paymentDetails = { ...req.body, userId: req.user._id };
    const subscription = await SubscriptionService.verifyPaymentAndUpdateSubscription(paymentDetails);
    res.status(200).json({ message: 'Payment verified successfully. Subscription activated!', subscription });
  } catch (error) {
    handleServiceError(res, error);
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const subscription = await SubscriptionService.getUserSubscription(userId);
    res.status(200).json(subscription);
  } catch (error) {
    handleServiceError(res, error);
  }
};

// Placeholder for admin to manage subscriptions or for webhook handlers
// exports.handleSubscriptionWebhook = async (req, res) => { /* ... */ };
// exports.cancelSubscription = async (req, res) => { /* ... */ };
