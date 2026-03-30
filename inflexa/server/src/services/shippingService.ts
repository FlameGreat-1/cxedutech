import EasyPostClient from '@easypost/api';
import { env } from '../config/env';
import * as orderModel from '../models/orderModel';
import { sendShippingConfirmation } from './emailService';
import { IOrder } from '../types/order.types';
import { logger } from '../utils/logger';

const easypost = new EasyPostClient(env.easypost.apiKey);

// Standard flashcard pack parcel: 10x8x2 inches, 12 oz
const FLASHCARD_PARCEL = {
  length: 10,
  width: 8,
  height: 2,
  weight: 12,
} as const;

export async function shipOrder(orderId: number): Promise<IOrder> {
  const order = await orderModel.findById(orderId);
  if (!order) {
    throw Object.assign(new Error('Order not found.'), { statusCode: 404 });
  }

  if (order.order_status !== 'Paid') {
    throw Object.assign(
      new Error(`Order must be in Paid status to ship. Current status: ${order.order_status}`),
      { statusCode: 400 }
    );
  }

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
