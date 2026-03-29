import { Router } from 'express';
import { getMe } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/me', authenticate, getMe);

export default router;
