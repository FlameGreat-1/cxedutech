import https from 'https';
import { env } from '../../config/env';
import * as shippingConfigModel from '../../models/shippingConfigModel';
import { ShippingAddress, OrderItemInput, CustomsItem } from '../../types/order.types';
import { logger } from '../../utils/logger';

const SHIPPO_HOST = 'api.goshippo.com';

interface ShippoRequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
}

async function getApiKey(): Promise<string> {
  let apiKey = '';

  try {
    const config = await shippingConfigModel.findByProvider('shippo');
    if (config && config.api_key.length > 0) {
      apiKey = config.api_key;
    }
  } catch (err) {
    logger.warn(`Failed to read Shippo config from DB, falling back to .env: ${(err as Error).message}`);
  }

  if (!apiKey) {
    apiKey = env.shippo.apiKey;
  }

  if (!apiKey) {
    throw Object.assign(
      new Error('Shippo is not configured. Please set up the API key in admin Settings > Shipping.'),
      { statusCode: 400 }
    );
  }

  return apiKey;
}

function shippoRequest<T>(options: ShippoRequestOptions, apiKey: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : undefined;

    const reqOptions: https.RequestOptions = {
      hostname: SHIPPO_HOST,
      port: 443,
      path: options.path,
      method: options.method,
      headers: {
        'Authorization': `ShippoToken ${apiKey}`,
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
            logger.error(`Shippo API error (${res.statusCode}): ${raw.slice(0, 500)}`);
            reject(Object.assign(
              new Error('Shippo request failed. Please try again.'),
              { statusCode: res.statusCode }
            ));
            return;
          }
          resolve(parsed);
        } catch {
          reject(Object.assign(
            new Error(`Shippo returned invalid JSON: ${raw.slice(0, 200)}`),
            { statusCode: 502 }
          ));
        }
      });
    });

    req.on('error', (err) => {
      reject(Object.assign(new Error(`Shippo network error: ${err.message}`), { statusCode: 502 }));
    });

    req.setTimeout(15_000, () => {
      req.destroy();
      reject(Object.assign(new Error('Shippo API request timed out.'), { statusCode: 504 }));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

const WEIGHT_PER_ITEM_OZ = 12;
const BASE_DIMENSIONS = { length: 10, width: 8, height: 2 };

function buildParcel(totalQuantity: number) {
  const qty = Math.max(1, totalQuantity);
  return {
    length: String(BASE_DIMENSIONS.length),
    width: String(BASE_DIMENSIONS.width),
    height: String(BASE_DIMENSIONS.height * Math.ceil(qty / 2)),
    distance_unit: 'in',
    weight: String(WEIGHT_PER_ITEM_OZ * qty),
    mass_unit: 'oz',
  };
}

// ── Customs declaration builder ──────────────────────────────────

/**
 * Builds a Shippo customs_declaration object from enriched order items.
 * Uses real product prices and descriptions — never hardcoded values.
 *
 * @see https://docs.goshippo.com/docs/international/customs_declarations/
 */
function buildCustomsDeclaration(customsItems: CustomsItem[]) {
  const originCountry = env.shipping.from.country || 'GB';
  const certifySigner = env.shipping.from.company || 'Inflexa';

  const items = customsItems.map((ci) => ({
    description: ci.description,
    quantity: ci.quantity,
    net_weight: String(ci.weight_oz * ci.quantity),
    mass_unit: 'oz',
    value_amount: (ci.unit_price * ci.quantity).toFixed(2),
    value_currency: ci.currency,
    origin_country: originCountry,
    tariff_number: env.shipping.defaultHsCode,
  }));

  return {
    contents_type: 'MERCHANDISE',
    non_delivery_option: 'RETURN',
    certify: true,
    certify_signer: certifySigner,
    incoterm: 'DDU',
    eel_pfc: 'NOEEI_30_37_a',
    items,
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
  provider: 'shippo';
}

interface ShippoShipmentResponse {
  object_id: string;
  rates: Array<{
    object_id: string;
    provider: string;
    servicelevel: { name: string; token: string };
    amount: string;
    currency: string;
    estimated_days: number | null;
  }>;
}

// ── Rate fetching ────────────────────────────────────────────────

export async function getRates(
  address: ShippingAddress,
  items: OrderItemInput[],
  customsItems?: CustomsItem[]
): Promise<ShippingRatesResult> {
  const apiKey = await getApiKey();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const parcel = buildParcel(totalQuantity);

  const isInternational = address.shipping_country !== (env.shipping.from.country || 'GB');

  // Build customs declaration from real product data for international shipments
  let customs_declaration = undefined;
  if (isInternational && customsItems && customsItems.length > 0) {
    customs_declaration = buildCustomsDeclaration(customsItems);
  }

  const fromAddress = env.shipping.from;

  const response = await shippoRequest<ShippoShipmentResponse>({
    method: 'POST',
    path: '/shipments',
    body: {
      ...(customs_declaration ? { customs_declaration } : {}),
      address_to: {
        name: address.shipping_name,
        email: address.shipping_email,
        phone: address.shipping_phone || '',
        street1: address.shipping_address_line1,
        street2: address.shipping_address_line2 || '',
        city: address.shipping_city,
        state: address.shipping_state,
        zip: address.shipping_postal_code,
        country: address.shipping_country || 'GB',
      },
      address_from: {
        name: fromAddress.company,
        company: fromAddress.company,
        email: fromAddress.email || '',
        street1: fromAddress.street,
        city: fromAddress.city,
        state: fromAddress.state,
        zip: fromAddress.zip,
        country: fromAddress.country,
        phone: fromAddress.phone || '',
      },
      parcels: [parcel],
      async: false,
    },
  }, apiKey);

  const shippoRates = response.rates || [];

  if (shippoRates.length === 0) {
    logger.warn('Shippo returned no shipping rates for the given address.');
    return { rates: [], shipment_id: response.object_id || null, provider: 'shippo' };
  }

  const rates: ShippingRate[] = shippoRates.map((r) => ({
    id: r.object_id,
    carrier: r.provider,
    service: r.servicelevel.name,
    rate: r.amount,
    currency: r.currency,
    delivery_days: r.estimated_days ?? null,
  }));

  rates.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

  return { rates, shipment_id: response.object_id || null, provider: 'shippo' };
}

// ── Label purchase ───────────────────────────────────────────────

interface ShippoTransactionResponse {
  object_id: string;
  tracking_number: string;
  status: string;
  messages?: Array<{ source: string, code: string, text: string }>;
}

export interface ShipResult {
  shipment_id: string;
  tracking_code: string;
  provider: 'shippo';
}

export async function purchaseLabel(
  address: ShippingAddress,
  items: OrderItemInput[],
  customsItems?: CustomsItem[]
): Promise<ShipResult> {
  const apiKey = await getApiKey();

  // Get rates first to find the cheapest (customs data flows through)
  const ratesResult = await getRates(address, items, customsItems);
  if (ratesResult.rates.length === 0) {
    throw Object.assign(new Error('No rates returned by Shippo for the given address'), { statusCode: 400 });
  }

  const cheapestRateId = ratesResult.rates[0].id;

  const transaction = await shippoRequest<ShippoTransactionResponse>({
    method: 'POST',
    path: '/transactions',
    body: {
      rate: cheapestRateId,
      label_file_type: 'PDF',
      async: false,
    },
  }, apiKey);

  if (transaction.status !== 'SUCCESS') {
    const errorDetails = transaction.messages && transaction.messages.length > 0
      ? transaction.messages.map(m => m.text).join('; ')
      : 'Unknown error';
    logger.error(`Shippo transaction failed. Status: ${transaction.status}. Messages: ${errorDetails}`);
    throw Object.assign(
      new Error(`Shippo label purchase failed: ${errorDetails}`),
      { statusCode: 502 }
    );
  }

  return {
    shipment_id: transaction.object_id,
    tracking_code: transaction.tracking_number || '',
    provider: 'shippo',
  };
}
