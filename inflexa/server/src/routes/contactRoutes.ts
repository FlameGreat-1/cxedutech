import { Router } from 'express';
import { submitContact } from '../controllers/contactController';
import { validate } from '../middleware/validate';
import { contactRules } from '../validators/contactValidators';
import { contactLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', contactLimiter, validate(contactRules), submitContact);

export default router;
