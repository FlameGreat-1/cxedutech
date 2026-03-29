import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Payment } from '../models/Payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2020-08-27',
});

// Process payment
export const processPayment = async (req: Request, res: Response) => {
  const { amount, currency, source } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: source,
      confirm: true,
    });

    // Save payment details to the database
    const payment = new Payment({
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentMethod: paymentIntent.payment_method,
    });

    await payment.save();

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve payment details
export const getPaymentDetails = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};