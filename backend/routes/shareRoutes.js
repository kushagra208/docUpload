import express from 'express';
import {
  shareWithUser,
  generateShareLink,
  accessViaLink,
  revokeShare,
  revokeLink,
  getFileShares,
} from '../controllers/shareController.js';
import { authenticate, optional } from '../middleware/auth.js';

const router = express.Router();

router.post('/share-with-user', authenticate, shareWithUser);
router.post('/generate-link', authenticate, generateShareLink);
router.get('/access/:token', accessViaLink);
router.delete('/revoke-share/:shareId', authenticate, revokeShare);
router.delete('/revoke-link/:linkId', authenticate, revokeLink);
router.get('/file-shares/:fileId', authenticate, getFileShares);

export default router;
