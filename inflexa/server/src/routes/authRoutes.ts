import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { registerRules, loginRules } from '../validators/authValidators';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(registerRules), register);
router.post('/login', authLimiter, validate(loginRules), login);

export default router;
