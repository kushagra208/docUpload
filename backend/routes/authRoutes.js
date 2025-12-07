import express from 'express';
import { register, login, getProfile, getAllUsers, refreshToken } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/profile', authenticate, getProfile);
router.get('/users', getAllUsers);

export default router;
