import { Request, Response, NextFunction } from 'express';
import * as paymentGatewayConfigModel from '../../models/paymentGatewayConfigModel';
import * as shippingConfigModel from '../../models/shippingConfigModel';
import * as taxConfigModel from '../../models/taxConfigModel';
import { IPaymentGatewayConfig, IPaymentGatewayConfigSafe, PaymentGatewayProvider } from '../../types/paymentGatewayConfig.types';
import { IShippingConfig, IShippingConfigSafe, ShippingProvider } from '../../types/shippingConfig.types';
import { ITaxConfig, ITaxConfigSafe } from '../../types/taxConfig.types';
import { sendSuccess } from '../../utils/apiResponse';

// ── Helpers ──────────────────────────────────────────────────────────

function maskKey(key: string): boolean {
  return key.length > 0;
}

function getMaskedKey(key: string): string | undefined {
  if (!key || key.length === 0) return undefined;
  if (key.length <= 8) return '*'.repeat(key.length);
  const start = key.slice(0, 4);
  const end = key.slice(-4);
  const hidden = '*'.repeat(Math.min(key.length - 8, 16)); // cap stars
  return `${start}${hidden}${end}`;
}

function toSafeGateway(config: IPaymentGatewayConfig): IPaymentGatewayConfigSafe {
  return {
    id: config.id,
    provider: config.provider,
    currency: config.currency,
    has_public_key: maskKey(config.public_key),
    has_secret_key: maskKey(config.secret_key),
    has_webhook_secret: maskKey(config.webhook_secret),
    masked_public_key: getMaskedKey(config.public_key),
    masked_secret_key: getMaskedKey(config.secret_key),
    masked_webhook_secret: getMaskedKey(config.webhook_secret),
    is_enabled: config.is_enabled,
    created_at: config.created_at,
    updated_at: config.updated_at,
  };
}

function toSafeShipping(config: IShippingConfig): IShippingConfigSafe {
  return {
    id: config.id,
    provider: config.provider,
    has_api_key: maskKey(config.api_key),
    masked_api_key: getMaskedKey(config.api_key),
    is_enabled: config.is_enabled,
    fallback_rate: Number(config.fallback_rate),
    created_at: config.created_at,
    updated_at: config.updated_at,
  };
}

function toSafeTax(config: ITaxConfig): ITaxConfigSafe {
  return {
    id: config.id,
    region: config.region,
    tax_label: config.tax_label,
    tax_rate: Number(config.tax_rate),
    is_enabled: config.is_enabled,
    created_at: config.created_at,
    updated_at: config.updated_at,
  };
}

// ── Payment Gateway Configs ─────────────────────────────────────────

export async function getPaymentGatewayConfigs(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const configs = await paymentGatewayConfigModel.findAll();
    sendSuccess(res, configs.map(toSafeGateway));
  } catch (error: unknown) {
    next(error);
  }
}

export async function updatePaymentGatewayConfig(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const provider = req.params.provider as PaymentGatewayProvider;

    if (provider !== 'stripe' && provider !== 'paystack') {
      res.status(400).json({ success: false, error: 'Invalid provider. Must be stripe or paystack.' });
      return;
    }

    const { currency, public_key, secret_key, webhook_secret, is_enabled } = req.body;

    const updated = await paymentGatewayConfigModel.update(provider, {
      currency,
      public_key,
      secret_key,
      webhook_secret,
      is_enabled,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'Payment gateway config not found.' });
      return;
    }

    sendSuccess(res, toSafeGateway(updated));
  } catch (error: unknown) {
    next(error);
  }
}

// ── Shipping Configs ────────────────────────────────────────────────

export async function getShippingConfigs(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const configs = await shippingConfigModel.findAll();
    sendSuccess(res, configs.map(toSafeShipping));
  } catch (error: unknown) {
    next(error);
  }
}

export async function createShippingConfig(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { provider, api_key, is_enabled, fallback_rate } = req.body;

    const validProviders: ShippingProvider[] = ['easypost', 'shipengine', 'shippo', 'easyship'];
    if (!validProviders.includes(provider)) {
      res.status(400).json({ success: false, error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` });
      return;
    }

    const existing = await shippingConfigModel.findByProvider(provider);
    if (existing) {
      res.status(409).json({ success: false, error: `Shipping config for ${provider} already exists. Use PUT to update.` });
      return;
    }

    // If this new provider is being created as enabled, disable all other providers first.
    // Only one shipping provider should be active at a time so that getActiveProvider()
    // deterministically returns the intended provider regardless of array iteration order.
    if (is_enabled) {
      const allConfigs = await shippingConfigModel.findAll();
      for (const cfg of allConfigs) {
        if (cfg.is_enabled && cfg.provider !== provider) {
          await shippingConfigModel.update(cfg.provider, { is_enabled: false });
        }
      }
    }

    const config = await shippingConfigModel.create({ provider, api_key, is_enabled, fallback_rate });
    sendSuccess(res, toSafeShipping(config), 201);
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateShippingConfig(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const provider = req.params.provider as ShippingProvider;

    const validProviders: ShippingProvider[] = ['easypost', 'shipengine', 'shippo', 'easyship'];
    if (!validProviders.includes(provider)) {
      res.status(400).json({ success: false, error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` });
      return;
    }

    const { api_key, is_enabled, fallback_rate } = req.body;

    // Enforce mutual exclusivity: when enabling a provider, disable all others.
    // Only one shipping provider should be active at a time so that
    // getActiveProvider() deterministically returns the intended provider
    // regardless of the fixed iteration order in SUPPORTED_PROVIDERS.
    if (is_enabled === true) {
      const allConfigs = await shippingConfigModel.findAll();
      for (const cfg of allConfigs) {
        if (cfg.is_enabled && cfg.provider !== provider) {
          await shippingConfigModel.update(cfg.provider, { is_enabled: false });
        }
      }
    }

    const updated = await shippingConfigModel.update(provider, { api_key, is_enabled, fallback_rate });

    if (!updated) {
      res.status(404).json({ success: false, error: 'Shipping config not found.' });
      return;
    }

    sendSuccess(res, toSafeShipping(updated));
  } catch (error: unknown) {
    next(error);
  }
}

export async function deleteShippingConfig(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const provider = req.params.provider as ShippingProvider;
    const deleted = await shippingConfigModel.remove(provider);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Shipping config not found.' });
      return;
    }

    sendSuccess(res, { message: `Shipping config for ${provider} deleted.` });
  } catch (error: unknown) {
    next(error);
  }
}

// ── Tax Configs ─────────────────────────────────────────────────────

export async function getTaxConfigs(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const configs = await taxConfigModel.findAll();
    sendSuccess(res, configs.map(toSafeTax));
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateTaxConfig(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const region = req.params.region as string;

    if (!region || region.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Region parameter is required.' });
      return;
    }

    const { tax_label, tax_rate, is_enabled } = req.body;

    // Validate tax_rate if provided
    if (tax_rate !== undefined) {
      const rate = parseFloat(tax_rate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        res.status(400).json({ success: false, error: 'Tax rate must be between 0 and 100.' });
        return;
      }
    }

    const updated = await taxConfigModel.update(region.toUpperCase(), {
      tax_label,
      tax_rate: tax_rate !== undefined ? parseFloat(tax_rate) : undefined,
      is_enabled,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'Tax config not found for this region.' });
      return;
    }

    sendSuccess(res, toSafeTax(updated));
  } catch (error: unknown) {
    next(error);
  }
}
