import { Router } from 'express';
import { getMe, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { changePasswordRules } from '../validators/authValidators';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/me', authenticate, getMe);
router.put('/password', authenticate, authLimiter, validate(changePasswordRules), changePassword);

export default router;
