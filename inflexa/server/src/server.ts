import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { env } from './config/env';
import pool, { testConnection } from './config/database';
import { stripeWebhook } from './controllers/paymentController';
import routes from './routes';
import { apiLimiter } from './middleware/rateLimiter';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Security headers
app.use(helmet());

// CORS - locked to frontend origin
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// Stripe webhook needs raw body BEFORE json parser
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// JSON body parser for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to start server: ${message}`);
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received. Shutting down gracefully...`);

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
