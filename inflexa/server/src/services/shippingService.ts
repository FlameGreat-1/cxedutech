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

export async function createShipmentForOrder(order: IOrder): Promise<void> {
  try {
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

    if (shipment.rates && shipment.rates.length > 0) {
      const lowestRate = shipment.lowestRate();
      const purchased = await easypost.Shipment.buy(shipment.id, lowestRate);

      await orderModel.updateShipping(
        order.id,
        purchased.id,
        purchased.tracking_code || ''
      );

      await orderModel.updateStatus(order.id, 'Shipped');

      const updatedOrder = await orderModel.findById(order.id);
      if (updatedOrder) {
        await sendShippingConfirmation(updatedOrder);
      }

      logger.info(`Shipment created for order #${order.id}`, {
        shipmentId: purchased.id,
        trackingCode: purchased.tracking_code,
      });
    } else {
      logger.warn(`No shipping rates available for order #${order.id}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Shipping failed for order #${order.id}: ${message}`);
    throw error;
  }
}
