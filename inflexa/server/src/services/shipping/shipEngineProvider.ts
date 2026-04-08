import https from 'https';
import { env } from '../../config/env';
import * as shippingConfigModel from '../../models/shippingConfigModel';
import { ShippingAddress, OrderItemInput, CustomsItem } from '../../types/order.types';
import { logger } from '../../utils/logger';

const SHIPENGINE_HOST = 'api.shipengine.com';

interface ShipEngineRequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
  timeout?: number;
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
    const timeout = options.timeout || 20_000;

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

            // Extract meaningful error messages from ShipEngine response
            let errorMessage = 'ShipEngine request failed. Please try again.';
            try {
              const errBody = JSON.parse(raw) as { errors?: Array<{ message?: string }> };
              if (errBody.errors?.length) {
                const messages = errBody.errors.map((e) => e.message).filter(Boolean);
                if (messages.length > 0) {
                  errorMessage = `ShipEngine: ${messages.join('; ')}`;
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
            new Error(`ShipEngine returned invalid JSON: ${raw.slice(0, 200)}`),
            { statusCode: 502 }
          ));
        }
      });
    });

    req.on('error', (err) => {
      reject(Object.assign(new Error(`ShipEngine network error: ${err.message}`), { statusCode: 502 }));
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      reject(Object.assign(new Error('ShipEngine API request timed out.'), { statusCode: 504 }));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

// --- Carrier ID discovery & caching ---

interface ShipEngineCarrier {
  carrier_id: string;
  carrier_code: string;
  friendly_name: string;
}

interface ShipEngineCarriersResponse {
  carriers: ShipEngineCarrier[];
}

let cachedCarrierIds: string[] | null = null;
let carrierCacheExpiry = 0;
const CARRIER_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function getCarrierIds(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedCarrierIds && cachedCarrierIds.length > 0 && now < carrierCacheExpiry) {
    return cachedCarrierIds;
  }

  try {
    const response = await shipEngineRequest<ShipEngineCarriersResponse>({
      method: 'GET',
      path: '/v1/carriers',
      timeout: 10_000,
    }, apiKey);

    const ids = (response.carriers || []).map((c) => c.carrier_id);
    if (ids.length > 0) {
      cachedCarrierIds = ids;
      carrierCacheExpiry = now + CARRIER_CACHE_TTL_MS;
      logger.info(`ShipEngine: discovered ${ids.length} carrier(s): ${ids.join(', ')}`);
    } else {
      logger.warn('ShipEngine: no carriers found on account. Rate requests will fail.');
    }
    return ids;
  } catch (err) {
    logger.error(`ShipEngine: failed to fetch carriers: ${(err as Error).message}`);
    // Return cached if available, even if expired
    if (cachedCarrierIds && cachedCarrierIds.length > 0) {
      return cachedCarrierIds;
    }
    return [];
  }
}

// --- Package building ---

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

// ── Customs items builder ────────────────────────────────────────

/**
 * Builds ShipEngine customs items from enriched order data.
 * Each CustomsItem becomes a separate customs line with accurate value.
 *
 * @see https://shipengine.github.io/shipengine-openapi/#tag/shipments
 */
function buildCustomsItems(customsItems: CustomsItem[]) {
  const originCountry = env.shipping.from.country || 'GB';

  return customsItems.map((ci) => ({
    description: ci.description,
    quantity: ci.quantity,
    value: {
      amount: ci.unit_price * ci.quantity,
      currency: ci.currency,
    },
    weight: {
      value: ci.weight_oz * ci.quantity,
      unit: 'ounce',
    },
    country_of_origin: originCountry,
    harmonized_tariff_code: env.shipping.defaultHsCode,
  }));
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

// ── Rate fetching ────────────────────────────────────────────────

export async function getRates(
  address: ShippingAddress,
  items: OrderItemInput[],
  customsItems?: CustomsItem[]
): Promise<ShippingRatesResult> {
  const apiKey = await getApiKey();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const pkg = buildPackage(totalQuantity);

  // Discover carrier IDs from the account (required for rate_options)
  const carrierIds = await getCarrierIds(apiKey);
  if (carrierIds.length === 0) {
    logger.warn('ShipEngine: no carriers available. Cannot fetch rates.');
    return { rates: [], shipment_id: null, provider: 'shipengine' };
  }

  const fromAddress = env.shipping.from;

  let shipToName = (address.shipping_name || 'Customer').trim();
  if (!shipToName.includes(' ') || shipToName.length < 5) {
    shipToName = `${shipToName} Customer`;
  }

  let shipFromName = (fromAddress.company || 'Inflexa Technologies').trim();
  if (!shipFromName.includes(' ') || shipFromName.length < 5) {
    shipFromName = 'Inflexa Technologies';
  }

  const isInternational = address.shipping_country !== (fromAddress.country || 'GB');

  // Build customs for international shipments using real product data
  let customs = undefined;
  if (isInternational && customsItems && customsItems.length > 0) {
    customs = {
      contents: 'merchandise',
      non_delivery: 'return_to_sender',
      customs_items: buildCustomsItems(customsItems),
    };
  }

  const response = await shipEngineRequest<ShipEngineRateResponse>({
    method: 'POST',
    path: '/v1/rates',
    timeout: 30_000,
    body: {
      shipment: {
        ship_to: {
          name: shipToName,
          phone: address.shipping_phone || '',
          address_line1: address.shipping_address_line1,
          address_line2: address.shipping_address_line2 || '',
          city_locality: address.shipping_city,
          state_province: address.shipping_state,
          postal_code: address.shipping_postal_code,
          country_code: address.shipping_country || 'GB',
        },
        ship_from: {
          name: shipFromName,
          company_name: fromAddress.company || undefined,
          phone: fromAddress.phone || '',
          address_line1: fromAddress.street,
          city_locality: fromAddress.city,
          state_province: fromAddress.state,
          postal_code: fromAddress.zip,
          country_code: fromAddress.country,
        },
        packages: [pkg],
        ...(customs ? { customs } : {}),
      },
      rate_options: {
        carrier_ids: carrierIds,
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

// ── Label purchase ───────────────────────────────────────────────

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
  items: OrderItemInput[],
  customsItems?: CustomsItem[]
): Promise<ShipResult> {
  const apiKey = await getApiKey();

  // First get rates to find the cheapest (customs data flows through)
  const ratesResult = await getRates(address, items, customsItems);
  if (ratesResult.rates.length === 0) {
    throw Object.assign(new Error('No rates returned by ShipEngine for the given address'), { statusCode: 400 });
  }

  const cheapestRateId = ratesResult.rates[0].id;

  const response = await shipEngineRequest<ShipEngineLabelResponse>({
    method: 'POST',
    path: `/v1/labels/rates/${cheapestRateId}`,
    timeout: 30_000,
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
