import * as shippingConfigModel from '../../models/shippingConfigModel';
import { ShippingProvider } from '../../types/shippingConfig.types';
import { ShippingAddress, OrderItemInput } from '../../types/order.types';
import { logger } from '../../utils/logger';

import * as easypostProvider from './easypostProvider';
import * as shipEngineProvider from './shipEngineProvider';
import * as shippoProvider from './shippoProvider';
import * as easyshipProvider from './easyshipProvider';

// ── Unified types returned by all providers ──────────────────────

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
  shipping_enabled: boolean;
  provider: ShippingProvider | null;
}

export interface ShipResult {
  shipment_id: string;
  tracking_code: string;
  provider: ShippingProvider;
}

// ── Provider resolution ──────────────────────────────────────────

const SUPPORTED_PROVIDERS: ShippingProvider[] = ['easypost', 'shipengine', 'shippo', 'easyship'];

/**
 * Returns the first enabled shipping provider from the DB.
 * Checks providers in a deterministic order.
 * Returns null if no provider is enabled.
 */
export async function getActiveProvider(): Promise<ShippingProvider | null> {
  try {
    const configs = await shippingConfigModel.findAll();
    for (const provider of SUPPORTED_PROVIDERS) {
      const config = configs.find((c) => c.provider === provider);
      if (config && config.is_enabled && config.api_key.length > 0) {
        return config.provider;
      }
    }
  } catch (err) {
    logger.warn(`Failed to resolve active shipping provider from DB: ${(err as Error).message}`);
  }
  return null;
}

/**
 * Checks if any shipping provider is enabled.
 */
export async function isAnyProviderEnabled(): Promise<boolean> {
  const provider = await getActiveProvider();
  return provider !== null;
}

/**
 * Returns all enabled shipping providers (for gateway status endpoint).
 */
export async function getEnabledProviders(): Promise<ShippingProvider[]> {
  try {
    const configs = await shippingConfigModel.findAll();
    return configs
      .filter((c) => SUPPORTED_PROVIDERS.includes(c.provider) && c.is_enabled && c.api_key.length > 0)
      .map((c) => c.provider);
  } catch (err) {
    logger.warn(`Failed to list enabled shipping providers: ${(err as Error).message}`);
    return [];
  }
}

// ── Rate fetching (delegates to active provider) ─────────────────

export async function getRates(
  address: ShippingAddress,
  items: OrderItemInput[]
): Promise<ShippingRatesResult> {
  const provider = await getActiveProvider();

  if (!provider) {
    return { rates: [], shipment_id: null, shipping_enabled: false, provider: null };
  }

  let result: { rates: ShippingRate[]; shipment_id: string | null };

  switch (provider) {
    case 'easypost':
      result = await easypostProvider.getRates(address, items);
      break;
    case 'shipengine':
      result = await shipEngineProvider.getRates(address, items);
      break;
    case 'shippo':
      result = await shippoProvider.getRates(address, items);
      break;
    case 'easyship':
      result = await easyshipProvider.getRates(address, items);
      break;
    default:
      logger.warn(`Unsupported shipping provider: ${provider}`);
      return { rates: [], shipment_id: null, shipping_enabled: false, provider: null };
  }

  return {
    rates: result.rates,
    shipment_id: result.shipment_id,
    shipping_enabled: true,
    provider,
  };
}

// ── Label purchase (delegates to active provider) ────────────────

export async function purchaseLabel(
  address: ShippingAddress,
  items: OrderItemInput[]
): Promise<ShipResult> {
  const provider = await getActiveProvider();

  if (!provider) {
    throw Object.assign(
      new Error('No shipping provider is enabled. Please configure one in admin Settings > Shipping.'),
      { statusCode: 400 }
    );
  }

  switch (provider) {
    case 'easypost':
      return easypostProvider.purchaseLabel(address, items);
    case 'shipengine':
      return shipEngineProvider.purchaseLabel(address, items);
    case 'shippo':
      return shippoProvider.purchaseLabel(address, items);
    case 'easyship':
      return easyshipProvider.purchaseLabel(address, items);
    default:
      throw Object.assign(
        new Error(`Unsupported shipping provider: ${provider}`),
        { statusCode: 400 }
      );
  }
}
