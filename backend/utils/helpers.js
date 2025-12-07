import crypto from 'crypto';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';

export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const compressFile = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const source = fs.createReadStream(inputPath);
    const destination = fs.createWriteStream(outputPath);
    const gzip = zlib.createGzip();

    source
      .pipe(gzip)
      .pipe(destination)
      .on('finish', () => resolve(outputPath))
      .on('error', reject);
  });
};

export const decompressFile = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const source = fs.createReadStream(inputPath);
    const destination = fs.createWriteStream(outputPath);
    const gunzip = zlib.createGunzip();

    source
      .pipe(gunzip)
      .pipe(destination)
      .on('finish', () => resolve(outputPath))
      .on('error', reject);
  });
};

export const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
};

export const isValidFileType = (fileType) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
  ];
  return allowedTypes.includes(fileType);
};
