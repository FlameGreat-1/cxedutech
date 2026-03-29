import EasyPostClient from '@easypost/api';
import { env } from '../config/env';
import * as orderModel from '../models/orderModel';
import { sendShippingConfirmation } from './emailService';
import { IOrder } from '../types/order.types';
import { logger } from '../utils/logger';

const easypost = new EasyPostClient(env.easypost.apiKey);

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
        company: 'Inflexa',
        street1: process.env.SHIP_FROM_STREET || '123 Warehouse St',
        city: process.env.SHIP_FROM_CITY || 'London',
        state: process.env.SHIP_FROM_STATE || 'England',
        zip: process.env.SHIP_FROM_ZIP || 'EC1A 1BB',
        country: process.env.SHIP_FROM_COUNTRY || 'GB',
        phone: process.env.SHIP_FROM_PHONE || '0000000000',
      },
      parcel: {
        length: 10,
        width: 8,
        height: 2,
        weight: 12,
      },
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
