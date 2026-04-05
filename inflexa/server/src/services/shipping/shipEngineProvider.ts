import https from 'https';
import { env } from '../../config/env';
import * as shippingConfigModel from '../../models/shippingConfigModel';
import { ShippingAddress, OrderItemInput } from '../../types/order.types';
import { logger } from '../../utils/logger';

const SHIPENGINE_HOST = 'api.shipengine.com';

interface ShipEngineRequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
}

async function getApiKey(): Promise<string> {
  let apiKey = '';

  try {
    const config = await shippingConfigModel.findByProvider('shipengine');
    if (config && config.api_key.length > 0) {
      apiKey = config.api_key;
    }
  } catch (err) {
    logger.warn(`Failed to read ShipEngine config from DB, falling back to .env: ${(err as Error).message}`);
  }

  if (!apiKey) {
    apiKey = env.shipengine.apiKey;
  }

  if (!apiKey) {
    throw Object.assign(
      new Error('ShipEngine is not configured. Please set up the API key in admin Settings > Shipping.'),
      { statusCode: 400 }
    );
  }

  return apiKey;
}

function shipEngineRequest<T>(options: ShipEngineRequestOptions, apiKey: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : undefined;

    const reqOptions: https.RequestOptions = {
      hostname: SHIPENGINE_HOST,
      port: 443,
      path: options.path,
      method: options.method,
      headers: {
        'API-Key': apiKey,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = https.request(reqOptions, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        try {
          const parsed = JSON.parse(raw) as T;
          if (res.statusCode && res.statusCode >= 400) {
            logger.error(`ShipEngine API error (${res.statusCode}): ${raw.slice(0, 500)}`);
            reject(Object.assign(
              new Error('ShipEngine request failed. Please try again.'),
              { statusCode: res.statusCode }
            ));
            return;
          }
          resolve(parsed);
        } catch {
          reject(Object.assign(
            new Error(`ShipEngine returned invalid JSON: ${raw.slice(0, 200)}`),
            { statusCode: 502 }
          ));
        }
      });
    });

    req.on('error', (err) => {
      reject(Object.assign(new Error(`ShipEngine network error: ${err.message}`), { statusCode: 502 }));
    });

    req.setTimeout(15_000, () => {
      req.destroy();
      reject(Object.assign(new Error('ShipEngine API request timed out.'), { statusCode: 504 }));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

const WEIGHT_PER_ITEM_OZ = 12;
const BASE_DIMENSIONS = { length: 10, width: 8, height: 2 };

function buildPackage(totalQuantity: number) {
  const qty = Math.max(1, totalQuantity);
  return {
    weight: { value: WEIGHT_PER_ITEM_OZ * qty, unit: 'ounce' },
    dimensions: {
      length: BASE_DIMENSIONS.length,
      width: BASE_DIMENSIONS.width,
      height: BASE_DIMENSIONS.height * Math.ceil(qty / 2),
      unit: 'inch',
    },
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
  provider: 'shipengine';
}

interface ShipEngineRateResponse {
  rate_response: {
    rates: Array<{
      rate_id: string;
      carrier_friendly_name: string;
      service_type: string;
      shipping_amount: { amount: number; currency: string };
      delivery_days: number | null;
    }>;
    errors: Array<{ message: string }>;
  };
  shipment_id: string;
}

export async function getRates(
  address: ShippingAddress,
  items: OrderItemInput[]
): Promise<ShippingRatesResult> {
  const apiKey = await getApiKey();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const pkg = buildPackage(totalQuantity);

  const response = await shipEngineRequest<ShipEngineRateResponse>({
    method: 'POST',
    path: '/v1/rates',
    body: {
      shipment: {
        ship_to: {
          name: address.shipping_name,
          phone: address.shipping_phone || '',
          address_line1: address.shipping_address_line1,
          address_line2: address.shipping_address_line2 || '',
          city_locality: address.shipping_city,
          state_province: address.shipping_state,
          postal_code: address.shipping_postal_code,
          country_code: address.shipping_country || 'GB',
        },
        ship_from: {
          company_name: env.shipping.from.company,
          phone: env.shipping.from.phone,
          address_line1: env.shipping.from.street,
          city_locality: env.shipping.from.city,
          state_province: env.shipping.from.state,
          postal_code: env.shipping.from.zip,
          country_code: env.shipping.from.country,
        },
        packages: [pkg],
      },
      rate_options: {
        carrier_ids: [],
      },
    },
  }, apiKey);

  const seRates = response.rate_response?.rates || [];

  if (seRates.length === 0) {
    if (response.rate_response?.errors?.length) {
      logger.warn(`ShipEngine rate errors: ${response.rate_response.errors.map((e) => e.message).join('; ')}`);
    }
    return { rates: [], shipment_id: response.shipment_id || null, provider: 'shipengine' };
  }

  const rates: ShippingRate[] = seRates.map((r) => ({
    id: r.rate_id,
    carrier: r.carrier_friendly_name,
    service: r.service_type,
    rate: r.shipping_amount.amount.toFixed(2),
    currency: r.shipping_amount.currency,
    delivery_days: r.delivery_days ?? null,
  }));

  rates.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

  return { rates, shipment_id: response.shipment_id || null, provider: 'shipengine' };
}

interface ShipEngineLabelResponse {
  label_id: string;
  tracking_number: string;
  shipment_id: string;
}

export interface ShipResult {
  shipment_id: string;
  tracking_code: string;
  provider: 'shipengine';
}

export async function purchaseLabel(
  address: ShippingAddress,
  items: OrderItemInput[]
): Promise<ShipResult> {
  const apiKey = await getApiKey();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const pkg = buildPackage(totalQuantity);

  // First get rates to find the cheapest
  const ratesResult = await getRates(address, items);
  if (ratesResult.rates.length === 0) {
    throw Object.assign(new Error('No shipping rates available via ShipEngine.'), { statusCode: 400 });
  }

  const cheapestRateId = ratesResult.rates[0].id;

  const response = await shipEngineRequest<ShipEngineLabelResponse>({
    method: 'POST',
    path: `/v1/labels/rates/${cheapestRateId}`,
    body: {
      label_format: 'pdf',
      label_layout: '4x6',
    },
  }, apiKey);

  return {
    shipment_id: response.shipment_id || response.label_id,
    tracking_code: response.tracking_number || '',
    provider: 'shipengine',
  };
}
