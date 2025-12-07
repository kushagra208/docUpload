import express from 'express';
import { getAuditLog, getFileActivityLog } from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-audit-log', authenticate, getAuditLog);
router.get('/file-activity/:fileId', authenticate, getFileActivityLog);

export default router;
