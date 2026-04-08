import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Variables required for the server to start at all.
 * Missing any of these = fatal, cannot serve any request.
 */
const requiredVars = [
  'DB_USER',
  'DB_HOST',
  'DB_NAME',
  'DB_PASSWORD',
  'DB_PORT',
  'JWT_SECRET',
  'CLIENT_URL',
] as const;

/**
 * Variables required for specific features.
 * Server starts without them but the related features will fail
 * gracefully at request time with a clear error.
 */
const optionalVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'PAYSTACK_SECRET_KEY',
  'PAYSTACK_WEBHOOK_SECRET',
  'EASYPOST_API_KEY',
  'SHIPENGINE_API_KEY',
  'SHIPPO_API_KEY',
  'EASYSHIP_API_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'SHIP_FROM_STREET',
  'SHIP_FROM_CITY',
  'SHIP_FROM_STATE',
  'SHIP_FROM_ZIP',
  'SHIP_FROM_COUNTRY',
  'SHIP_FROM_PHONE',
  'SHIP_FROM_COMPANY',
  'SHIP_FROM_EMAIL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const;

function validateEnv(): void {
  const missing: string[] = [];

  for (const key of requiredVars) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      missing.push(key);
    }
  }

  let activeMissing = missing;
  if (process.env.DATABASE_URL) {
    activeMissing = missing.filter(key => !key.startsWith('DB_'));
  }

  if (activeMissing.length > 0) {
    console.error('\n[FATAL] Missing required environment variables:\n');
    activeMissing.forEach((v) => console.error(`   - ${v}`));
    console.error('\nCopy .env.example to .env and fill in all values.\n');
    process.exit(1);
  }

  // Warn about missing optional vars but don't crash
  const warnings: string[] = [];
  for (const key of optionalVars) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      warnings.push(key);
    }
  }

  if (warnings.length > 0) {
    console.warn('\n[WARN] Missing optional environment variables (related features will be unavailable):\n');
    warnings.forEach((v) => console.warn(`   - ${v}`));
    console.warn('');
  }

  // Validate Cloudinary credentials when using cloudinary storage
  const storageProvider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
  if (storageProvider === 'cloudinary') {
    const cloudinaryVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missingCloudinary = cloudinaryVars.filter(
      (k) => !process.env[k] || process.env[k]!.trim() === ''
    );
    if (missingCloudinary.length > 0) {
      console.error('\n[FATAL] STORAGE_PROVIDER is set to "cloudinary" but the following variables are missing:\n');
      missingCloudinary.forEach((v) => console.error(`   - ${v}`));
      console.error('\nEither set these variables or change STORAGE_PROVIDER to "local".\n');
      process.exit(1);
    }
  }
}

validateEnv();

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    url: process.env.DATABASE_URL,
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: process.env.STRIPE_API_VERSION || '2024-12-18.acacia',
  },

  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
  },

  easypost: {
    apiKey: process.env.EASYPOST_API_KEY || '',
  },

  shipengine: {
    apiKey: process.env.SHIPENGINE_API_KEY || '',
  },

  shippo: {
    apiKey: process.env.SHIPPO_API_KEY || '',
  },

  easyship: {
    apiKey: process.env.EASYSHIP_API_KEY || '',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || '',
  },

  shipping: {
    from: {
      company: process.env.SHIP_FROM_COMPANY || 'Inflexa',
      email: process.env.SHIP_FROM_EMAIL || process.env.SMTP_USER || '',
      street: process.env.SHIP_FROM_STREET || '',
      city: process.env.SHIP_FROM_CITY || '',
      state: process.env.SHIP_FROM_STATE || '',
      zip: process.env.SHIP_FROM_ZIP || '',
      country: process.env.SHIP_FROM_COUNTRY || '',
      phone: process.env.SHIP_FROM_PHONE || '',
    },
    /** Default HS (Harmonized System) code for customs. Override per-product if needed. */
    defaultHsCode: process.env.DEFAULT_HS_CODE || '4901.99',
  },

  storageProvider: (process.env.STORAGE_PROVIDER || 'local').toLowerCase() as 'local' | 'cloudinary',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  orderCleanup: {
    maxAgeHours: parseInt(process.env.ORDER_CLEANUP_MAX_AGE_HOURS || '24', 10),
    intervalMinutes: parseInt(process.env.ORDER_CLEANUP_INTERVAL_MINUTES || '30', 10),
  },

  clientUrl: process.env.CLIENT_URL!,
} as const;
