import { Request, Response, NextFunction } from 'express';
import * as paymentGatewayConfigModel from '../../models/paymentGatewayConfigModel';
import * as shippingConfigModel from '../../models/shippingConfigModel';
import { IPaymentGatewayConfig, IPaymentGatewayConfigSafe, PaymentGatewayProvider } from '../../types/paymentGatewayConfig.types';
import { IShippingConfig, IShippingConfigSafe, ShippingProvider } from '../../types/shippingConfig.types';
import { sendSuccess } from '../../utils/apiResponse';

// ── Helpers ──────────────────────────────────────────────────────────

function maskKey(key: string): boolean {
  return key.length > 0;
}

function toSafeGateway(config: IPaymentGatewayConfig): IPaymentGatewayConfigSafe {
  return {
    id: config.id,
    provider: config.provider,
    currency: config.currency,
    has_secret_key: maskKey(config.secret_key),
    has_webhook_secret: maskKey(config.webhook_secret),
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

    const { currency, secret_key, webhook_secret, is_enabled } = req.body;

    const updated = await paymentGatewayConfigModel.update(provider, {
      currency,
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
    const { provider, api_key, is_enabled } = req.body;

    const validProviders: ShippingProvider[] = ['easypost', 'shippo', 'shipstation', 'manual'];
    if (!validProviders.includes(provider)) {
      res.status(400).json({ success: false, error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` });
      return;
    }

    const existing = await shippingConfigModel.findByProvider(provider);
    if (existing) {
      res.status(409).json({ success: false, error: `Shipping config for ${provider} already exists. Use PUT to update.` });
      return;
    }

    const config = await shippingConfigModel.create({ provider, api_key, is_enabled });
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

    const validProviders: ShippingProvider[] = ['easypost', 'shippo', 'shipstation', 'manual'];
    if (!validProviders.includes(provider)) {
      res.status(400).json({ success: false, error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` });
      return;
    }

    const { api_key, is_enabled } = req.body;

    const updated = await shippingConfigModel.update(provider, { api_key, is_enabled });

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
