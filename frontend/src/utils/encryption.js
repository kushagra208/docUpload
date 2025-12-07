// Frontend encryption utilities using Web Crypto API (no external dependencies needed)

// Convert array buffer to base64 string
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert base64 string to array buffer
const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Import RSA public key for encryption
const importRSAPublicKey = async (publicKeyPem) => {
  // Remove PEM headers and convert to binary
  const binaryString = atob(publicKeyPem.replace(/-----BEGIN PUBLIC KEY-----/g, '').replace(/-----END PUBLIC KEY-----/g, '').replace(/\n/g, ''));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return await window.crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
};

// Encrypt data with RSA public key
const encryptWithRSA = async (data, publicKey) => {
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    new TextEncoder().encode(data)
  );
  return arrayBufferToBase64(encrypted);
};

// Generate a random AES key
const generateAESKey = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-CBC',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

// Encrypt data with AES-CBC
const encryptAES = async (data, key) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: iv,
    },
    key,
    new TextEncoder().encode(JSON.stringify(data))
  );
  const ivBase64 = arrayBufferToBase64(iv);
  const encryptedBase64 = arrayBufferToBase64(encrypted);
  return `${ivBase64}:${encryptedBase64}`;
};

const decryptAES = async (encryptedData, key) => {
  const [ivBase64, encryptedBase64] = encryptedData.split(':');
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const encryptedBuffer = new Uint8Array(base64ToArrayBuffer(encryptedBase64));
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: iv,
    },
    key,
    encryptedBuffer
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
};

// Export AES key to raw format and encrypt with RSA
const exportAndEncryptAESKey = async (aesKey, rsaPublicKey) => {
  const exportedKey = await window.crypto.subtle.exportKey('raw', aesKey);
  const encryptedKey = await encryptWithRSA(arrayBufferToBase64(exportedKey), rsaPublicKey);
  return encryptedKey;
};

export {
  importRSAPublicKey,
  encryptWithRSA,
  generateAESKey,
  encryptAES,
  decryptAES,
  exportAndEncryptAESKey,
  arrayBufferToBase64,
  base64ToArrayBuffer,
};
