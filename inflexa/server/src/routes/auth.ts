import express from 'express';
import { register, login } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validation';

const router = express.Router();

// Registration route
router.post('/register', validateRegistration, register);

// Login route
router.post('/login', validateLogin, login);

export default router;