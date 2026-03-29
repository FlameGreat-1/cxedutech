import Stripe from 'stripe';
import { env } from './env';

const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export default stripe;
