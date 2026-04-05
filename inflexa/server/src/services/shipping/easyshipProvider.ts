import https from 'https';
import { env } from '../../config/env';
import * as shippingConfigModel from '../../models/shippingConfigModel';
import { ShippingAddress, OrderItemInput } from '../../types/order.types';
import { logger } from '../../utils/logger';

const EASYSHIP_PRODUCTION_HOST = 'public-api.easyship.com';
const EASYSHIP_SANDBOX_HOST = 'public-api-sandbox.easyship.com';
const EASYSHIP_API_VERSION = '2024-09';

/**
 * Determines the correct Easyship API host based on the API key prefix.
 * - Keys starting with 'sand_' use the sandbox host
 * - Keys starting with 'prod_' (or anything else) use the production host
 */
function getEasyshipHost(apiKey: string): string {
  if (apiKey.startsWith('sand_')) {
    return EASYSHIP_SANDBOX_HOST;
  }
  return EASYSHIP_PRODUCTION_HOST;
}

interface EasyshipRequestOptions {
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  body?: Record<string, unknown>;
}

async function getApiKey(): Promise<string> {
  let apiKey = '';

  try {
    const config = await shippingConfigModel.findByProvider('easyship');
    if (config && config.api_key.length > 0) {
      apiKey = config.api_key;
    }
  } catch (err) {
    logger.warn(`Failed to read Easyship config from DB, falling back to .env: ${(err as Error).message}`);
  }

  if (!apiKey) {
    apiKey = env.easyship.apiKey;
  }

  if (!apiKey) {
    throw Object.assign(
      new Error('Easyship is not configured. Please set up the API key in admin Settings > Shipping.'),
      { statusCode: 400 }
    );
  }

  return apiKey;
}

function easyshipRequest<T>(options: EasyshipRequestOptions, apiKey: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : undefined;
    const hostname = getEasyshipHost(apiKey);
    const versionedPath = `/${EASYSHIP_API_VERSION}${options.path}`;

    const reqOptions: https.RequestOptions = {
      hostname,
      port: 443,
      path: versionedPath,
      method: options.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    logger.info(`Easyship request: ${options.method} https://${hostname}${versionedPath}`);

    const req = https.request(reqOptions, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        try {
          const parsed = JSON.parse(raw) as T;
          if (res.statusCode && res.statusCode >= 400) {
            logger.error(`Easyship API error (${res.statusCode}): ${raw.slice(0, 500)}`);

            // Extract meaningful error message from Easyship response
            let errorMessage = 'Easyship request failed. Please try again.';
            try {
              const errBody = JSON.parse(raw) as { error?: { message?: string; details?: string[] } | string };
              if (typeof errBody.error === 'string') {
                errorMessage = `Easyship: ${errBody.error}`;
              } else if (errBody.error?.message) {
                errorMessage = `Easyship: ${errBody.error.message}`;
                if (errBody.error.details?.length) {
                  errorMessage += ` Details: ${errBody.error.details.join('; ')}`;
                }
              }
            } catch { /* use default message */ }

            reject(Object.assign(
              new Error(errorMessage),
              { statusCode: res.statusCode }
            ));
            return;
          }
          resolve(parsed);
        } catch {
          reject(Object.assign(
            new Error(`Easyship returned invalid JSON: ${raw.slice(0, 200)}`),
            { statusCode: 502 }
          ));
        }
      });
    });

    req.on('error', (err) => {
      reject(Object.assign(new Error(`Easyship network error: ${err.message}`), { statusCode: 502 }));
    });

    req.setTimeout(20_000, () => {
      req.destroy();
      reject(Object.assign(new Error('Easyship API request timed out.'), { statusCode: 504 }));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

const WEIGHT_PER_ITEM_KG = 0.34; // ~12 oz
const BASE_DIMENSIONS_CM = { length: 25.4, width: 20.3, height: 5.1 }; // ~10x8x2 inches

function buildItems(totalQuantity: number) {
  const qty = Math.max(1, totalQuantity);
  return {
    actual_weight: WEIGHT_PER_ITEM_KG * qty,
    dimensions: {
      length: BASE_DIMENSIONS_CM.length,
      width: BASE_DIMENSIONS_CM.width,
      height: BASE_DIMENSIONS_CM.height * Math.ceil(qty / 2),
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
  provider: 'easyship';
}

interface EasyshipRateResponse {
  shipment: {
    easyship_shipment_id: string;
    rates: Array<{
      courier_id: string;
      courier_name: string;
      courier_service_name: string;
      total_charge: number;
      currency: string;
      min_delivery_time: number | null;
      max_delivery_time: number | null;
    }>;
  };
}

export async function getRates(
  address: ShippingAddress,
  items: OrderItemInput[]
): Promise<ShippingRatesResult> {
  const apiKey = await getApiKey();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const pkg = buildItems(totalQuantity);

  const response = await easyshipRequest<EasyshipRateResponse>({
    method: 'POST',
    path: '/rates',
    body: {
      origin_address: {
        line_1: env.shipping.from.street,
        city: env.shipping.from.city,
        state: env.shipping.from.state,
        postal_code: env.shipping.from.zip,
        country_alpha2: env.shipping.from.country,
        contact_phone: env.shipping.from.phone,
        company_name: env.shipping.from.company,
      },
      destination_address: {
        line_1: address.shipping_address_line1,
        line_2: address.shipping_address_line2 || '',
        city: address.shipping_city,
        state: address.shipping_state,
        postal_code: address.shipping_postal_code,
        country_alpha2: address.shipping_country || 'GB',
        contact_name: address.shipping_name,
        contact_email: address.shipping_email,
        contact_phone: address.shipping_phone || '',
      },
      incoterms: 'DDU',
      insurance: { is_insured: false },
      parcels: [
        {
          total_actual_weight: pkg.actual_weight,
          box: {
            length: pkg.dimensions.length,
            width: pkg.dimensions.width,
            height: pkg.dimensions.height,
          },
          items: [
            {
              description: 'Flashcard Pack',
              category: 'education_supplies',
              quantity: totalQuantity,
              actual_weight: WEIGHT_PER_ITEM_KG,
              declared_currency: 'GBP',
              declared_customs_value: 10,
              hs_code: '4901.99',
            },
          ],
        },
      ],
    },
  }, apiKey);

  const esRates = response.shipment?.rates || [];

  if (esRates.length === 0) {
    logger.warn('Easyship returned no shipping rates for the given address.', {
      shipment_id: response.shipment?.easyship_shipment_id || null,
      origin_country: env.shipping.from.country,
      destination_country: address.shipping_country || 'GB',
      destination_postal: address.shipping_postal_code,
      parcel_weight_kg: pkg.actual_weight,
    });
    return {
      rates: [],
      shipment_id: response.shipment?.easyship_shipment_id || null,
      provider: 'easyship',
    };
  }

  const rates: ShippingRate[] = esRates.map((r) => ({
    id: r.courier_id,
    carrier: r.courier_name,
    service: r.courier_service_name,
    rate: r.total_charge.toFixed(2),
    currency: r.currency,
    delivery_days: r.max_delivery_time ?? r.min_delivery_time ?? null,
  }));

  rates.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

  return {
    rates,
    shipment_id: response.shipment?.easyship_shipment_id || null,
    provider: 'easyship',
  };
}

interface EasyshipLabelResponse {
  shipment: {
    easyship_shipment_id: string;
    tracking_number: string;
  };
}

export interface ShipResult {
  shipment_id: string;
  tracking_code: string;
  provider: 'easyship';
}

export async function purchaseLabel(
  address: ShippingAddress,
  items: OrderItemInput[]
): Promise<ShipResult> {
  const apiKey = await getApiKey();

  // Get rates first to find the cheapest
  const ratesResult = await getRates(address, items);
  if (ratesResult.rates.length === 0) {
    throw Object.assign(new Error('No shipping rates available via Easyship.'), { statusCode: 400 });
  }

  if (!ratesResult.shipment_id) {
    throw Object.assign(new Error('Easyship shipment ID missing from rate response.'), { statusCode: 502 });
  }

  const cheapestCourierId = ratesResult.rates[0].id;

  // Select the courier on the shipment
  await easyshipRequest({
    method: 'PATCH',
    path: `/shipments/${ratesResult.shipment_id}`,
    body: {
      selected_courier_id: cheapestCourierId,
    },
  }, apiKey);

  // Confirm and buy the label
  const labelResponse = await easyshipRequest<EasyshipLabelResponse>({
    method: 'POST',
    path: `/shipments/${ratesResult.shipment_id}/buy_label`,
    body: {},
  }, apiKey);

  return {
    shipment_id: labelResponse.shipment.easyship_shipment_id,
    tracking_code: labelResponse.shipment.tracking_number || '',
    provider: 'easyship',
  };
}
