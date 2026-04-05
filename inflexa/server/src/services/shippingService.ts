import * as orderModel from '../models/orderModel';
import * as shippingRouter from './shipping/index';
import { sendShippingConfirmation } from './emailService';
import { IOrder, ShippingAddress, OrderItemInput } from '../types/order.types';
import { logger } from '../utils/logger';

// Re-export types so existing imports from shippingService still work
export type { ShippingRate, ShippingRatesResult } from './shipping/index';

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
 * If shipping is DISABLED in admin settings, returns an empty rates array
 * with shipping_enabled: false. The caller should treat shipping cost as zero.
 *
 * If shipping is ENABLED, creates a shipment quote via the active provider
 * and returns the available rates for the user to choose from.
 */
export async function getShippingRates(
  address: ShippingAddress,
  items: OrderItemInput[]
): Promise<shippingRouter.ShippingRatesResult> {
  return shippingRouter.getRates(address, items);
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

  const items = order.items
    ? order.items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
    : [{ product_id: 0, quantity: 1 }];

  const result = await shippingRouter.purchaseLabel(address, items);

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

  logger.info(`Shipment created for order #${order.id}`, {
    shipmentId: result.shipment_id,
    trackingCode: result.tracking_code,
    provider: result.provider,
  });

  return updatedOrder;
}
