import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { registerRules, loginRules, forgotPasswordRules, resetPasswordRules } from '../validators/authValidators';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(registerRules), register);
router.post('/login', authLimiter, validate(loginRules), login);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordRules), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordRules), resetPassword);

export default router;
