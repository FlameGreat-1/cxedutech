import * as taxConfigModel from '../models/taxConfigModel';
import { logger } from '../utils/logger';

export interface TaxCalculation {
  tax_amount: number;
  tax_rate: number;
  tax_label: string;
  is_enabled: boolean;
}

/**
 * Calculates tax for a given subtotal.
 *
 * If tax is disabled in admin settings, returns zero.
 * If tax is enabled, applies the configured rate.
 *
 * @param subtotal - The pre-tax amount (product total, NOT including shipping)
 * @param region  - The tax region to look up (defaults to 'GB')
 */
export async function calculateTax(
  subtotal: number,
  region: string = 'GB'
): Promise<TaxCalculation> {
  try {
    const config = await taxConfigModel.findByRegion(region);

    if (!config || !config.is_enabled) {
      return {
        tax_amount: 0,
        tax_rate: 0,
        tax_label: config?.tax_label || 'VAT',
        is_enabled: false,
      };
    }

    const rate = Number(config.tax_rate);
    const taxAmount = Math.round(subtotal * (rate / 100) * 100) / 100;

    return {
      tax_amount: taxAmount,
      tax_rate: rate,
      tax_label: config.tax_label,
      is_enabled: true,
    };
  } catch (err) {
    logger.error(`Tax calculation failed, defaulting to zero: ${(err as Error).message}`);
    return {
      tax_amount: 0,
      tax_rate: 0,
      tax_label: 'VAT',
      is_enabled: false,
    };
  }
}

/**
 * Returns the current tax configuration status for public display.
 */
export async function getTaxStatus(
  region: string = 'GB'
): Promise<{ is_enabled: boolean; tax_rate: number; tax_label: string }> {
  try {
    const config = await taxConfigModel.findByRegion(region);
    if (!config) {
      return { is_enabled: false, tax_rate: 0, tax_label: 'VAT' };
    }
    return {
      is_enabled: config.is_enabled,
      tax_rate: config.is_enabled ? Number(config.tax_rate) : 0,
      tax_label: config.tax_label,
    };
  } catch {
    return { is_enabled: false, tax_rate: 0, tax_label: 'VAT' };
  }
}
