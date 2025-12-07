import { generateKeyPair } from './encryption.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keysDir = path.join(__dirname, '../.keys');
const publicKeyPath = path.join(keysDir, 'public.key');
const privateKeyPath = path.join(keysDir, 'private.key');

// Ensure keys directory exists
const ensureKeysDir = () => {
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }
};

// Generate and save keys if they don't exist
const initializeKeys = () => {
  ensureKeysDir();

  if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
    console.log('Generating new RSA key pair...');
    const { publicKey, privateKey } = generateKeyPair();
    fs.writeFileSync(publicKeyPath, publicKey);
    fs.writeFileSync(privateKeyPath, privateKey);
    console.log('RSA keys generated and saved');
  }
};

// Get server keys
const getServerKeys = () => {
  ensureKeysDir();
  
  if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
    throw new Error('RSA keys not found. Call initializeKeys first.');
  }

  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

  return { publicKey, privateKey };
};

export { initializeKeys, getServerKeys };
