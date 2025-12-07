import express from 'express';
import { IncomingForm } from 'formidable';
import crypto from 'crypto';
import {
  uploadFile,
  bulkUpload,
  getMyFiles,
  getSharedWithMe,
  downloadFile,
  deleteFile,
} from '../controllers/fileController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const handleSingleUpload = (req, res, next) => {
  const form = new IncomingForm({
    uploadDir: './uploads',
    maxFileSize: 52428800,
    maxFiles: 1,
  });

  form.parse(req, (err, fields, files) => {
    if (err) return next(err);
    req.file = files.file ? files.file[0] : null;
    next();
  });
};

const handleBulkUpload = (req, res, next) => {
  const form = new IncomingForm({
    uploadDir: './uploads',
    maxFileSize: 52428800,
    maxFiles: 10,
  });

  form.parse(req, (err, fields, files) => {
    if (err) return next(err);
    req.files = files.files || [];
    next();
  });
};

router.post('/upload', authenticate, handleSingleUpload, uploadFile);
router.post('/bulk-upload', authenticate, handleBulkUpload, bulkUpload);
router.get('/my-files', authenticate, getMyFiles);
router.get('/shared-with-me', authenticate, getSharedWithMe);
router.get('/download/:fileId', authenticate, downloadFile);
router.delete('/:fileId', authenticate, deleteFile);

export default router;
