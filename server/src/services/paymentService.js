const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');

class PaymentService {
  async createPaymentIntent(userId, amount) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // 转换为分
        currency: 'cny',
        metadata: { userId }
      });

      return paymentIntent;
    } catch (error) {
      throw error;
    }
  }

  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleSuccessfulPayment(event.data.object);
          break;
        case 'payment_intent.failed':
          await this.handleFailedPayment(event.data.object);
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  async handleSuccessfulPayment(paymentIntent) {
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100; // 转换回元

    await User.findByIdAndUpdate(userId, {
      $inc: { balance: amount }
    });
  }
}

module.exports = new PaymentService(); 