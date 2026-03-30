import Stripe from 'stripe';
import { env } from './env';

const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: env.stripe.apiVersion as Stripe.LatestApiVersion,
  typescript: true,
});

export default stripe;
