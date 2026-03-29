import Stripe from 'stripe';
import { env } from './env';

const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
});

export default stripe;
