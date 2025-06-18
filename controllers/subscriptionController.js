const razorpay = require('../utils/razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

exports.getPlans = async (req, res) => {
  res.json({
    plans: [
      { tier: 'free', price: 0, benefits: ['Limited access', '2 mock tests/week'] },
      { tier: 'basic', price: 199, benefits: ['Full syllabus', 'Unlimited tests', '2-year PYQs'] },
      { tier: 'premium', price: 499, benefits: ['10-year PYQs', 'Mentor access', 'Leaderboard'] }
    ]
  });
};

exports.createOrder = async (req, res) => {
  try {
    const { amount, tier } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(201).json({ order, tier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
