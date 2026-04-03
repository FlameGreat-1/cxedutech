import { Router } from 'express';
import { search } from '../../controllers/admin/adminSearchController';

const router = Router();

router.get('/', search);

export default router;
