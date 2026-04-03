ALTER TABLE payment_gateway_configs ADD COLUMN IF NOT EXISTS public_key TEXT NOT NULL DEFAULT '';
