import { getServerKeys } from '../utils/keyManager.js';

export const getPublicKey = async (req, res) => {
  try {
    const { publicKey } = getServerKeys();
    res.json({
      message: 'Public key retrieved',
      publicKey: publicKey,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get public key', details: error.message });
  }
};
