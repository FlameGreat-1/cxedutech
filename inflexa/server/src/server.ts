import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import path from 'path';
import { env } from './config/env';
import pool, { testConnection } from './config/database';
import { stripeWebhook, paystackWebhook } from './controllers/paymentController';
import routes from './routes';
import { apiLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { startOrderCleanupScheduler, stopOrderCleanupScheduler } from './services/orderCleanupService';

const app = express();

// Trust first proxy for correct client IP in rate limiting
app.set('trust proxy', 1);

// Security headers with Content-Security-Policy for API-only server
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

// CORS - locked to frontend origin(s)
// Supports comma-separated CLIENT_URL for multiple domains
const allowedOrigins = env.clientUrl.split(',').map((o: string) => o.trim());
app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  })
);

// Payment webhooks: raw body required for signature verification.
// Intentionally placed before JSON parser and outside rate limiting
// because the payment providers control request volume via their own retry policies.
app.post(
  '/api/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

app.post(
  '/api/payments/paystack/webhook',
  express.raw({ type: 'application/json' }),
  paystackWebhook
);

// JSON body parser for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Structured HTTP request logging
app.use(requestLogger);

// Serve uploaded product images
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// General rate limiting on all API routes
app.use('/api', apiLimiter);

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

let server: http.Server;

async function start(): Promise<void> {
  try {
    await testConnection();

    server = app.listen(env.port, () => {
      logger.info(`Inflexa server running on port ${env.port}`);
      logger.info(`Environment: ${env.nodeEnv}`);
    });

    // Start the periodic cleanup of stale Pending orders
    startOrderCleanupScheduler();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to start server: ${message}`);
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received. Shutting down gracefully...`);

  stopOrderCleanupScheduler();

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');
    });
  }

  try {
    await pool.end();
    logger.info('PG pool closed.');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Error closing PG pool: ${message}`);
  }

  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();

export default app;
