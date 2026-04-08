import EasyPostClient from '@easypost/api';
import { env } from '../../config/env';
import * as shippingConfigModel from '../../models/shippingConfigModel';
import { ShippingAddress, OrderItemInput, CustomsItem } from '../../types/order.types';
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

// ── Customs info builder ─────────────────────────────────────────

/**
 * Builds EasyPost customs_info from enriched order items.
 * Uses real product prices and descriptions for legally accurate forms.
 *
 * @see https://docs.easypost.com/docs/customs-info
 */
function buildCustomsInfo(customsItems: CustomsItem[]) {
  const originCountry = env.shipping.from.country || 'GB';

  const customs_items = customsItems.map((ci) => ({
    description: ci.description,
    quantity: ci.quantity,
    weight: ci.weight_oz * ci.quantity,
    value: ci.unit_price * ci.quantity,
    currency: ci.currency,
    origin_country: originCountry,
    hs_tariff_number: env.shipping.defaultHsCode,
  }));

  return {
    contents_type: 'merchandise',
    non_delivery_option: 'return',
    restriction_type: 'none',
    eel_pfc: 'NOEEI 30.37(a)',
    customs_certify: true,
    customs_signer: env.shipping.from.company || 'Inflexa',
    customs_items,
  };
}

// ── Types ────────────────────────────────────────────────────────

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

// ── Rate fetching ────────────────────────────────────────────────

export async function getRates(
  address: ShippingAddress,
  items: OrderItemInput[],
  customsItems?: CustomsItem[]
): Promise<ShippingRatesResult> {
  const easypost = await getClient();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const parcel = buildParcel(totalQuantity);

  const isInternational = address.shipping_country !== (env.shipping.from.country || 'GB');

  const fromAddress = env.shipping.from;

  // Build customs info for international shipments using real product data
  let customs_info = undefined;
  if (isInternational && customsItems && customsItems.length > 0) {
    customs_info = buildCustomsInfo(customsItems);
  }

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
      company: fromAddress.company,
      street1: fromAddress.street,
      city: fromAddress.city,
      state: fromAddress.state,
      zip: fromAddress.zip,
      country: fromAddress.country,
      phone: fromAddress.phone,
    },
    parcel,
    ...(customs_info ? { customs_info } : {}),
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

// ── Label purchase ───────────────────────────────────────────────

export interface ShipResult {
  shipment_id: string;
  tracking_code: string;
  provider: 'easypost';
}

export async function purchaseLabel(
  address: ShippingAddress,
  items: OrderItemInput[],
  customsItems?: CustomsItem[]
): Promise<ShipResult> {
  const easypost = await getClient();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const parcel = buildParcel(totalQuantity);

  const isInternational = address.shipping_country !== (env.shipping.from.country || 'GB');
  const fromAddress = env.shipping.from;

  let customs_info = undefined;
  if (isInternational && customsItems && customsItems.length > 0) {
    customs_info = buildCustomsInfo(customsItems);
  }

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
      company: fromAddress.company,
      street1: fromAddress.street,
      city: fromAddress.city,
      state: fromAddress.state,
      zip: fromAddress.zip,
      country: fromAddress.country,
      phone: fromAddress.phone,
    },
    parcel,
    ...(customs_info ? { customs_info } : {}),
  });

  if (!shipment.rates || shipment.rates.length === 0) {
    throw Object.assign(new Error('No rates returned by EasyPost for the given address'), { statusCode: 400 });
  }

  const lowestRate = shipment.lowestRate();
  const purchased = await easypost.Shipment.buy(shipment.id, lowestRate);

  return {
    shipment_id: purchased.id,
    tracking_code: purchased.tracking_code || '',
    provider: 'easypost',
  };
}
