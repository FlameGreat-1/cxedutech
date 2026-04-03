import EasyPostClient from '@easypost/api';
import { env } from '../config/env';
import * as orderModel from '../models/orderModel';
import * as shippingConfigModel from '../models/shippingConfigModel';
import { sendShippingConfirmation } from './emailService';
import { IOrder } from '../types/order.types';
import { logger } from '../utils/logger';

let cachedClient: EasyPostClient | null = null;
let cachedKey: string = '';

/**
 * Returns an EasyPost client using the API key from DB dashboard settings.
 * Falls back to .env EASYPOST_API_KEY only if DB has no key.
 */
async function getEasyPostClient(): Promise<EasyPostClient> {
  let apiKey = '';

  try {
    const config = await shippingConfigModel.findByProvider('easypost');
    if (config && config.api_key.length > 0) {
      apiKey = config.api_key;
    }
  } catch (err) {
    logger.warn(`Failed to read EasyPost config from DB, falling back to .env: ${(err as Error).message}`);
  }

  // Fallback to .env if DB has no key
  if (!apiKey) {
    apiKey = env.easypost.apiKey;
  }

  if (!apiKey) {
    throw Object.assign(
      new Error('Shipping is not configured. Please set up the EasyPost API key in admin Settings.'),
      { statusCode: 503 }
    );
  }

  if (cachedClient && cachedKey === apiKey) {
    return cachedClient;
  }

  cachedClient = new EasyPostClient(apiKey);
  cachedKey = apiKey;

  return cachedClient;
}

// Standard flashcard pack parcel: 10x8x2 inches, 12 oz
const FLASHCARD_PARCEL = {
  length: 10,
  width: 8,
  height: 2,
  weight: 12,
} as const;

/**
 * Creates an EasyPost shipment, purchases the lowest rate, saves
 * tracking info to the order, updates status to Shipped, and sends
 * a shipping confirmation email.
 *
 * Called automatically by the Stripe webhook on payment success.
 * Also available as a manual admin endpoint for retry/re-trigger.
 */
export async function shipOrder(orderId: number): Promise<IOrder> {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw Object.assign(new Error('Order not found.'), { statusCode: 404 });
  }

  if (order.order_status !== 'Paid' && order.order_status !== 'Shipped') {
    throw Object.assign(
      new Error(`Order must be in Paid or Shipped status to ship. Current status: ${order.order_status}`),
      { statusCode: 400 }
    );
  }

  // Check if EasyPost shipping is enabled in dashboard settings
  try {
    const config = await shippingConfigModel.findByProvider('easypost');
    if (config && !config.is_enabled) {
      throw Object.assign(
        new Error('Automatic shipping is currently disabled. Please enable EasyPost in admin Settings or ship manually.'),
        { statusCode: 503 }
      );
    }
  } catch (err) {
    // If it's our own 503 error, re-throw it
    if ((err as Error & { statusCode?: number }).statusCode === 503) throw err;
    // Otherwise DB read failed, try to proceed with .env fallback
    logger.warn(`Failed to check shipping config from DB: ${(err as Error).message}`);
  }

  const easypost = await getEasyPostClient();

  const shipment = await easypost.Shipment.create({
    to_address: {
      name: order.shipping_name,
      email: order.shipping_email,
      phone: order.shipping_phone || undefined,
      street1: order.shipping_address_line1,
      street2: order.shipping_address_line2 || undefined,
      city: order.shipping_city,
      state: order.shipping_state,
      zip: order.shipping_postal_code,
      country: order.shipping_country,
    },
    from_address: {
      company: env.shipping.from.company,
      street1: env.shipping.from.street,
      city: env.shipping.from.city,
      state: env.shipping.from.state,
      zip: env.shipping.from.zip,
      country: env.shipping.from.country,
      phone: env.shipping.from.phone,
    },
    parcel: FLASHCARD_PARCEL,
  });

  if (!shipment.rates || shipment.rates.length === 0) {
    throw Object.assign(
      new Error('No shipping rates available for this order.'),
      { statusCode: 502 }
    );
  }

  const lowestRate = shipment.lowestRate();
  const purchased = await easypost.Shipment.buy(shipment.id, lowestRate);

  await orderModel.updateShipping(
    order.id,
    purchased.id,
    purchased.tracking_code || ''
  );

  await orderModel.updateStatus(order.id, 'Shipped');

  const updatedOrder = await orderModel.findById(order.id);
  if (!updatedOrder) {
    throw Object.assign(new Error('Order not found after shipping update.'), { statusCode: 500 });
  }

  sendShippingConfirmation(updatedOrder).catch((err) =>
    logger.error(`Failed to send shipping confirmation for order #${order.id}`, err)
  );

  logger.info(`Shipment created for order #${order.id}`, {
    shipmentId: purchased.id,
    trackingCode: purchased.tracking_code,
  });

  return updatedOrder;
}
