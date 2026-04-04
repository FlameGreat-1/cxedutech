import EasyPostClient from '@easypost/api';
import { env } from '../config/env';
import * as orderModel from '../models/orderModel';
import * as shippingConfigModel from '../models/shippingConfigModel';
import { sendShippingConfirmation } from './emailService';
import { IOrder, ShippingAddress, OrderItemInput } from '../types/order.types';
import { logger } from '../utils/logger';

type EasyPostInstance = InstanceType<typeof EasyPostClient>;

let cachedClient: EasyPostInstance | null = null;
let cachedKey: string = '';

/**
 * Returns an EasyPost client using the API key from DB dashboard settings.
 * Falls back to .env EASYPOST_API_KEY only if DB has no key.
 */
async function getEasyPostClient(): Promise<EasyPostInstance> {
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
      { statusCode: 400 }
    );
  }

  if (cachedClient && cachedKey === apiKey) {
    return cachedClient;
  }

  cachedClient = new EasyPostClient(apiKey);
  cachedKey = apiKey;

  return cachedClient;
}

/**
 * Base flashcard pack parcel dimensions (inches).
 * Weight scales with quantity: 12 oz per pack.
 */
const BASE_PARCEL = {
  length: 10,
  width: 8,
  height: 2,
} as const;

const WEIGHT_PER_ITEM_OZ = 12;

/**
 * Calculates parcel dimensions based on total item quantity.
 * Height increases with quantity to reflect stacking.
 */
function buildParcel(totalQuantity: number): { length: number; width: number; height: number; weight: number } {
  const qty = Math.max(1, totalQuantity);
  return {
    length: BASE_PARCEL.length,
    width: BASE_PARCEL.width,
    height: BASE_PARCEL.height * Math.ceil(qty / 2),
    weight: WEIGHT_PER_ITEM_OZ * qty,
  };
}

// ── Shipping Rate ────────────────────────────────────────────────

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  rate: string;
  currency: string;
  delivery_days: number | null;
}

export interface ShippingRatesResult {
  rates: ShippingRate[];
  shipment_id: string | null;
  shipping_enabled: boolean;
}

/**
 * Checks if EasyPost shipping is enabled in admin dashboard settings.
 */
export async function isShippingEnabled(): Promise<boolean> {
  try {
    const config = await shippingConfigModel.findByProvider('easypost');
    if (config) return config.is_enabled;
  } catch {
    // DB unreachable
  }
  return env.easypost.apiKey.length > 0;
}

/**
 * Fetches shipping rates from EasyPost for the given address and items.
 *
 * If shipping is DISABLED in admin settings, returns an empty rates array
 * with shipping_enabled: false. The caller should treat shipping cost as zero.
 *
 * If shipping is ENABLED, creates an EasyPost shipment (without buying)
 * and returns the available rates for the user to choose from.
 */
export async function getShippingRates(
  address: ShippingAddress,
  items: OrderItemInput[]
): Promise<ShippingRatesResult> {
  const enabled = await isShippingEnabled();

  if (!enabled) {
    return {
      rates: [],
      shipment_id: null,
      shipping_enabled: false,
    };
  }

  const easypost = await getEasyPostClient();

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const parcel = buildParcel(totalQuantity);

  const shipment = await easypost.Shipment.create({
    to_address: {
      name: address.shipping_name,
      email: address.shipping_email,
      phone: address.shipping_phone || undefined,
      street1: address.shipping_address_line1,
      street2: address.shipping_address_line2 || undefined,
      city: address.shipping_city,
      state: address.shipping_state,
      zip: address.shipping_postal_code,
      country: address.shipping_country || 'GB',
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
    parcel,
  });

  if (!shipment.rates || shipment.rates.length === 0) {
    logger.warn('EasyPost returned no shipping rates for the given address.');
    return {
      rates: [],
      shipment_id: shipment.id,
      shipping_enabled: true,
    };
  }

  const rates: ShippingRate[] = shipment.rates.map((r) => ({
    id: r.id,
    carrier: r.carrier,
    service: r.service,
    rate: r.rate,
    currency: r.currency,
    delivery_days: r.delivery_days ?? null,
  }));

  // Sort by price ascending so cheapest is first
  rates.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

  return {
    rates,
    shipment_id: shipment.id,
    shipping_enabled: true,
  };
}

// ── Ship Order (post-payment fulfillment) ────────────────────────

/**
 * Creates an EasyPost shipment, purchases the lowest rate, saves
 * tracking info to the order, updates status to Shipped, and sends
 * a shipping confirmation email.
 *
 * Called automatically by the Stripe/Paystack webhook on payment success.
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
    if (!config || !config.is_enabled) {
      throw Object.assign(
        new Error('Automatic shipping is currently disabled. Please enable EasyPost in admin Settings or ship manually.'),
        { statusCode: 400 }
      );
    }
  } catch (err) {
    // If it's our own 400 error, re-throw it
    if ((err as Error & { statusCode?: number }).statusCode === 400) throw err;
    // Otherwise DB read failed, try to proceed with .env fallback
    logger.warn(`Failed to check shipping config from DB: ${(err as Error).message}`);
  }

  const easypost = await getEasyPostClient();

  const totalQuantity = order.items
    ? order.items.reduce((sum, item) => sum + item.quantity, 0)
    : 1;
  const parcel = buildParcel(totalQuantity);

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
    parcel,
  });

  if (!shipment.rates || shipment.rates.length === 0) {
    throw Object.assign(
      new Error('No shipping rates available for this order.'),
      { statusCode: 400 }
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
