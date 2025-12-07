import crypto from 'crypto';

// Generate RSA key pair for the server
const generateKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return { publicKey, privateKey };
};

// Encrypt data with AES-256-CBC
const encryptAES = (data, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
};

// Decrypt data with AES-256-CBC
const decryptAES = (encryptedData, key) => {
  const [ivBase64, encryptedBase64] = encryptedData.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};

// Encrypt AES key with RSA public key
const encryptWithRSA = (data, publicKey) => {
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(data)
  );
  return encrypted.toString('base64');
};

// Decrypt data with RSA private key
const decryptWithRSA = (encryptedData, privateKey) => {
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(encryptedData, 'base64')
  );
  return decrypted.toString('utf8');
};

// Generate a random 256-bit AES key
const generateAESKey = () => {
  return crypto.randomBytes(32);
};

export {
  generateKeyPair,
  encryptAES,
  decryptAES,
  encryptWithRSA,
  decryptWithRSA,
  generateAESKey,
};
