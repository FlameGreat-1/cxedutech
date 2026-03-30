import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = [
  'DB_USER',
  'DB_HOST',
  'DB_NAME',
  'DB_PASSWORD',
  'DB_PORT',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'PAYSTACK_SECRET_KEY',
  'PAYSTACK_WEBHOOK_SECRET',
  'EASYPOST_API_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'CLIENT_URL',
  'SHIP_FROM_STREET',
  'SHIP_FROM_CITY',
  'SHIP_FROM_STATE',
  'SHIP_FROM_ZIP',
  'SHIP_FROM_COUNTRY',
  'SHIP_FROM_PHONE',
] as const;

function validateEnv(): void {
  const missing: string[] = [];

  for (const key of requiredVars) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('\n[FATAL] Missing required environment variables:\n');
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error('\nCopy .env.example to .env and fill in all values.\n');
    process.exit(1);
  }
}

validateEnv();

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    user: process.env.DB_USER!,
    host: process.env.DB_HOST!,
    name: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    port: parseInt(process.env.DB_PORT!, 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    apiVersion: process.env.STRIPE_API_VERSION || '2024-12-18.acacia',
  },

  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY!,
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET!,
  },

  easypost: {
    apiKey: process.env.EASYPOST_API_KEY!,
  },

  smtp: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!, 10),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.EMAIL_FROM!,
  },

  shipping: {
    from: {
      company: 'Inflexa',
      street: process.env.SHIP_FROM_STREET!,
      city: process.env.SHIP_FROM_CITY!,
      state: process.env.SHIP_FROM_STATE!,
      zip: process.env.SHIP_FROM_ZIP!,
      country: process.env.SHIP_FROM_COUNTRY!,
      phone: process.env.SHIP_FROM_PHONE!,
    },
  },

  clientUrl: process.env.CLIENT_URL!,
} as const;
