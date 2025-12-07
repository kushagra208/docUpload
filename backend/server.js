import express from 'express';
import cors from 'cors';
import compressionMiddleware from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';

import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import cryptoRoutes from './routes/cryptoRoutes.js';
import { decryptionMiddleware, encryptResponseMiddleware } from './middleware/decryption.js';
import { initializeKeys } from './utils/keyManager.js';

dotenv.config();

// Initialize encryption keys
initializeKeys();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(compressionMiddleware());
app.use(decryptionMiddleware);
app.use(encryptResponseMiddleware);

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/crypto', cryptoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
