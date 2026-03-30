import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const health: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    health.database = { status: 'connected', latency_ms: Date.now() - start };
  } catch {
    health.database = { status: 'disconnected' };
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
