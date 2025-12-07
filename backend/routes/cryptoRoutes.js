import express from 'express';
import { getPublicKey } from '../controllers/cryptoController.js';

const router = express.Router();

router.get('/public-key', getPublicKey);

export default router;
