import { decryptAES, decryptWithRSA, encryptAES } from '../utils/encryption.js';
import { getServerKeys } from '../utils/keyManager.js';

export const decryptionMiddleware = (req, res, next) => {
  // Only decrypt POST, PUT, PATCH requests with encryption
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body.encrypted && req.body.encryptedKey) {
    try {
      const { privateKey } = getServerKeys();

      // Decrypt the AES key using RSA
      const decryptedAESKey = decryptWithRSA(req.body.encryptedKey, privateKey);
      const aesKeyBuffer = Buffer.from(decryptedAESKey, 'base64');

      // Decrypt the payload using AES
      console.log('Decrypted payload:', decryptedAESKey);
      const decryptedPayload = decryptAES(req.body.encrypted, aesKeyBuffer);
      req.aesKey = aesKeyBuffer;
      // Replace body with decrypted payload
      req.body = decryptedPayload;
    } catch (error) {
      console.error('Decryption error:', error);
      return res.status(400).json({ error: 'Failed to decrypt request', details: error.message });
    }
  }

  next();
};


// Response encryption middleware
export const encryptResponseMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    // If request had an AES key, encrypt the response
    if (req.aesKey) {
      try {
        const encryptedResponse = encryptAES(data, req.aesKey);
        return originalJson({
          encrypted: true,
          data: encryptedResponse,
        });
      } catch (error) {
        console.error('Response encryption error:', error);
        return originalJson({ error: 'Failed to encrypt response', details: error.message });
      }
    }

    return originalJson(data);
  };

  next();
};
