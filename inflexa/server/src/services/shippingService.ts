import pool from '../config/database';
import * as orderModel from '../models/orderModel';
import * as orderItemModel from '../models/orderItemModel';
import * as shippingRouter from './shipping/index';
import { sendShippingConfirmation } from './emailService';
import { notifyOrderShipped } from './notificationService';
import { IOrder, ShippingAddress, OrderItemInput, CustomsItem } from '../types/order.types';
import { IProduct } from '../types/product.types';
import { logger } from '../utils/logger';

// Re-export types so existing imports from shippingService still work
export type { ShippingRate, ShippingRatesResult } from './shipping/index';

// ── Defaults for parcel weight estimation ────────────────────────

/** Per-item fallback weight in oz when product weight is unknown */
const DEFAULT_WEIGHT_PER_ITEM_OZ = 12;

// ── Product data resolution ─────────────────────────────────────

/**
 * Resolves OrderItemInput[] (product_id + quantity) into CustomsItem[]
 * by looking up each product's title, price, and currency from the database.
 *
 * This is the single point where raw cart items are enriched with real
 * product data for customs declarations. Every shipping provider consumes
 * CustomsItem[] so they never need to hardcode prices or descriptions.
 */
export async function resolveCustomsItems(
  items: OrderItemInput[],
  currency?: string
): Promise<CustomsItem[]> {
  if (items.length === 0) return [];

  const productIds = items.map((i) => i.product_id);

  const { rows: products } = await pool.query<IProduct>(
    `SELECT id, title, price, currency
     FROM products
     WHERE id = ANY($1)`,
    [productIds]
  );

  const productMap = new Map(products.map((p) => [p.id, p]));

  return items.map((item) => {
    const product = productMap.get(item.product_id);

    if (!product) {
      logger.warn(
        `Product #${item.product_id} not found during customs resolution. ` +
        `Using fallback description and zero value.`
      );
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        description: `Product #${item.product_id}`,
        unit_price: 0,
        currency: currency || 'GBP',
        weight_oz: DEFAULT_WEIGHT_PER_ITEM_OZ,
      };
    }

    return {
      product_id: product.id,
      quantity: item.quantity,
      description: product.title,
      unit_price: Number(product.price),
      currency: currency || product.currency || 'GBP',
      weight_oz: DEFAULT_WEIGHT_PER_ITEM_OZ,
    };
  });
}

/**
 * Builds CustomsItem[] from saved order items (IOrderItem[]).
 * Used when shipping an existing order (post-payment webhook),
 * where unit_price and product_title are already stored.
 */
function buildCustomsItemsFromOrder(
  orderItems: { product_id: number; quantity: number; unit_price: number; currency: string; product_title?: string }[]
): CustomsItem[] {
  return orderItems.map((item) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    description: item.product_title || `Product #${item.product_id}`,
    unit_price: Number(item.unit_price),
    currency: item.currency,
    weight_oz: DEFAULT_WEIGHT_PER_ITEM_OZ,
  }));
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Checks if any shipping provider is enabled in admin dashboard settings.
 */
export async function isShippingEnabled(): Promise<boolean> {
  return shippingRouter.isAnyProviderEnabled();
}

/**
 * Returns all enabled shipping providers for the gateway status endpoint.
 */
export async function getEnabledProviders(): Promise<string[]> {
  return shippingRouter.getEnabledProviders();
}

/**
 * Fetches shipping rates from the active provider for the given address and items.
 *
 * Automatically resolves product data from the database to build customs items
 * with real prices and descriptions. This ensures international shipments
 * include legally accurate customs declarations.
 *
 * If shipping is DISABLED in admin settings, returns an empty rates array
 * with shipping_enabled: false. The caller should treat shipping cost as zero.
 */
export async function getShippingRates(
  address: ShippingAddress,
  items: OrderItemInput[],
  customsItems?: CustomsItem[]
): Promise<shippingRouter.ShippingRatesResult> {
  // If caller already resolved customs items (e.g. orderService), use them.
  // Otherwise, resolve from the database.
  const enriched = customsItems || await resolveCustomsItems(items);
  return shippingRouter.getRates(address, items, enriched);
}

/**
 * Creates a shipment via the active provider, purchases the lowest rate,
 * saves tracking info to the order, updates status to Shipped, and sends
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

  // Verify at least one shipping provider is enabled
  const enabled = await shippingRouter.isAnyProviderEnabled();
  if (!enabled) {
    throw Object.assign(
      new Error('Automatic shipping is currently disabled. Please enable a shipping provider in admin Settings > Shipping.'),
      { statusCode: 400 }
    );
  }

  // Build the address from the order record
  const address: ShippingAddress = {
    shipping_name: order.shipping_name,
    shipping_email: order.shipping_email,
    shipping_phone: order.shipping_phone || undefined,
    shipping_address_line1: order.shipping_address_line1,
    shipping_address_line2: order.shipping_address_line2 || undefined,
    shipping_city: order.shipping_city,
    shipping_state: order.shipping_state,
    shipping_postal_code: order.shipping_postal_code,
    shipping_country: order.shipping_country,
  };

  // Load order items — these contain the real unit_price and product_title
  // that were locked in at order creation time
  const orderItems = await orderItemModel.findByOrderId(order.id);
  const items: OrderItemInput[] = orderItems.length > 0
    ? orderItems.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
    : [{ product_id: 0, quantity: 1 }];

  // Build enriched customs items from the stored order data
  const customsItems = orderItems.length > 0
    ? buildCustomsItemsFromOrder(orderItems)
    : undefined;

  const result = await shippingRouter.purchaseLabel(address, items, customsItems);

  await orderModel.updateShipping(
    order.id,
    result.shipment_id,
    result.tracking_code,
    result.provider
  );

  await orderModel.updateStatus(order.id, 'Shipped');

  const updatedOrder = await orderModel.findById(order.id);
  if (!updatedOrder) {
    throw Object.assign(new Error('Order not found after shipping update.'), { statusCode: 500 });
  }

  sendShippingConfirmation(updatedOrder).catch((err) =>
    logger.error(`Failed to send shipping confirmation for order #${order.id}`, err)
  );

  notifyOrderShipped(order.id, result.tracking_code, result.provider);

  logger.info(`Shipment created for order #${order.id}`, {
    shipmentId: result.shipment_id,
    trackingCode: result.tracking_code,
    provider: result.provider,
  });

  return updatedOrder;
}
