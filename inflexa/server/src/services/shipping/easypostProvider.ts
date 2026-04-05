import EasyPostClient from '@easypost/api';
import { env } from '../../config/env';
import * as shippingConfigModel from '../../models/shippingConfigModel';
import { ShippingAddress, OrderItemInput } from '../../types/order.types';
import { logger } from '../../utils/logger';

type EasyPostInstance = InstanceType<typeof EasyPostClient>;

let cachedClient: EasyPostInstance | null = null;
let cachedKey: string = '';

/**
 * Returns an EasyPost client using the API key from DB dashboard settings.
 * Falls back to .env EASYPOST_API_KEY only if DB has no key.
 */
async function getClient(): Promise<EasyPostInstance> {
  let apiKey = '';

  try {
    const config = await shippingConfigModel.findByProvider('easypost');
    if (config && config.api_key.length > 0) {
      apiKey = config.api_key;
    }
  } catch (err) {
    logger.warn(`Failed to read EasyPost config from DB, falling back to .env: ${(err as Error).message}`);
  }

  if (!apiKey) {
    apiKey = env.easypost.apiKey;
  }

  if (!apiKey) {
    throw Object.assign(
      new Error('EasyPost is not configured. Please set up the API key in admin Settings > Shipping.'),
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

const BASE_PARCEL = { length: 10, width: 8, height: 2 } as const;
const WEIGHT_PER_ITEM_OZ = 12;

function buildParcel(totalQuantity: number): { length: number; width: number; height: number; weight: number } {
  const qty = Math.max(1, totalQuantity);
  return {
    length: BASE_PARCEL.length,
    width: BASE_PARCEL.width,
    height: BASE_PARCEL.height * Math.ceil(qty / 2),
    weight: WEIGHT_PER_ITEM_OZ * qty,
  };
}

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
  provider: 'easypost';
}

export async function getRates(
  address: ShippingAddress,
  items: OrderItemInput[]
): Promise<ShippingRatesResult> {
  const easypost = await getClient();
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
    return { rates: [], shipment_id: shipment.id, provider: 'easypost' };
  }

  const rates: ShippingRate[] = shipment.rates.map((r) => ({
    id: r.id,
    carrier: r.carrier,
    service: r.service,
    rate: r.rate,
    currency: r.currency,
    delivery_days: r.delivery_days ?? null,
  }));

  rates.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

  return { rates, shipment_id: shipment.id, provider: 'easypost' };
}

export interface ShipResult {
  shipment_id: string;
  tracking_code: string;
  provider: 'easypost';
}

export async function purchaseLabel(
  address: ShippingAddress,
  items: OrderItemInput[]
): Promise<ShipResult> {
  const easypost = await getClient();
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
    throw Object.assign(new Error('Auto-shipping could not be completed via EasyPost. No rates were returned for the given address.'), { statusCode: 400 });
  }

  const lowestRate = shipment.lowestRate();
  const purchased = await easypost.Shipment.buy(shipment.id, lowestRate);

  return {
    shipment_id: purchased.id,
    tracking_code: purchased.tracking_code || '',
    provider: 'easypost',
  };
}
