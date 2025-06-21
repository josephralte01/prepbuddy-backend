const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Path: ./users/user.model.js from src/
    required: true,
    unique: true // Each user has one subscription document representing their current/last subscription
  },
  planId: { // Identifier for the plan (e.g., 'basic_monthly', 'premium_annual')
    type: String,
    // required: true // Might not be required if it's a 'free' tier default
  },
  tier: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    required: true,
    default: 'free'
  },
  status: { // More descriptive status
    type: String,
    enum: ['active', 'pending_payment', 'cancelled', 'expired', 'payment_failed', 'free_trial'],
    default: 'pending_payment' // Or 'free_trial' / 'free' if user starts on free
  },
  // Razorpay or other payment provider details
  paymentProvider: {
    type: String, // e.g., 'razorpay', 'stripe'
  },
  providerOrderId: String,    // Was razorpayOrderId
  providerPaymentId: String,  // Was razorpayPaymentId
  providerSignature: String,  // Was razorpaySignature

  // isActive: { type: Boolean, default: false }, // Covered by 'status' field now

  startDate: { // When the current paid period started or subscription became active
    type: Date,
    // default: Date.now // Set when payment is verified or subscription activated
  },
  endDate: { // When the current paid period ends
    type: Date
  },
  // trialEndDate: Date, // If offering trials

  // autoRenew: { type: Boolean, default: false }, // For recurring subscriptions
  // cancelledAt: Date, // If user cancels before endDate

  // history: [{ // Optional: to keep track of past subscription periods for this user
  //   tier: String,
  //   startDate: Date,
  //   endDate: Date,
  //   paymentId: String
  // }]
}, {
  timestamps: true // createdAt, updatedAt
});

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ status: 1, endDate: 1 }); // For finding soon-to-expire or active subs

module.exports = mongoose.model('Subscription', subscriptionSchema);
