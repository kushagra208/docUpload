import axios from 'axios';
import {
  importRSAPublicKey,
  generateAESKey,
  encryptAES,
  decryptAES,
  exportAndEncryptAESKey,
} from './encryption.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let token = localStorage.getItem('token');
let refreshToken = localStorage.getItem('refreshToken');
let isRefreshing = false;
let failedQueue = [];
let serverPublicKey = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Fetch server's public key for encryption
const fetchServerPublicKey = async () => {
  if (serverPublicKey) return serverPublicKey;

  try {
    const response = await axios.get(`${API_BASE_URL}/crypto/public-key`);
    serverPublicKey = await importRSAPublicKey(response.data.publicKey);
    return serverPublicKey;
  } catch (error) {
    console.error('Failed to fetch server public key:', error);
    return null;
  }
};

// Encrypt request payload
const encryptPayload = async (data) => {
  try {
    const publicKey = await fetchServerPublicKey();
    if (!publicKey) return { data, aesKey: null }; // Fallback to unencrypted if key fetch fails

    // Generate AES key
    const aesKey = await generateAESKey();

    // Encrypt the payload with AES
    const encryptedPayload = await encryptAES(data, aesKey);

    // Export and encrypt the AES key with RSA
    const encryptedKey = await exportAndEncryptAESKey(aesKey, publicKey);

    return {
      payload: {
        encrypted: encryptedPayload,
        encryptedKey: encryptedKey,
      },
      aesKey: aesKey,
    };
  } catch (error) {
    console.error('Encryption error:', error);
    return { data, aesKey: null }; // Fallback to unencrypted
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Encrypt POST, PUT, PATCH requests (except multipart)
  if (['post', 'put', 'patch'].includes(config.method) && config.headers['Content-Type'] !== 'multipart/form-data') {
    const encrypted = await encryptPayload(config.data);
    if (encrypted.aesKey) {
      config.data = encrypted.payload;
      config.aesKey = encrypted.aesKey; // Store AES key in config for response decryption
    } else {
      config.data = encrypted.data;
    }
  }

  return config;
});

api.interceptors.response.use(
  async (response) => {
    // Decrypt response if it's encrypted
    if (response.data?.encrypted && response.config?.aesKey) {
      try {
        const decryptedData = await decryptAES(response.data.data, response.config.aesKey);
        response.data = decryptedData;
      } catch (error) {
        console.error('Response decryption error:', error);
      }
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        processQueue(new Error('No refresh token'), null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      return api
        .post('/auth/refresh', { refreshToken })
        .then(({ data }) => {
          token = data.accessToken;
          localStorage.setItem('token', data.accessToken);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          processQueue(null, token);
          return api(originalRequest);
        })
        .catch((err) => {
          processQueue(err, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username, email, password, confirmPassword) =>
    api.post('/auth/register', { username, email, password, confirmPassword }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  getAllUsers: () => api.get('/auth/users'),
};

export const fileAPI = {
  uploadFile: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  bulkUpload: (formData) => api.post('/files/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyFiles: () => api.get('/files/my-files'),
  getSharedWithMe: () => api.get('/files/shared-with-me'),
  downloadFile: (fileId) => api.get(`/files/download/${fileId}`),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
};

export const shareAPI = {
  shareWithUser: (fileId, email, role, expiryDays) =>
    api.post('/share/share-with-user', { fileId, email, role, expiryDays }),
  generateLink: (fileId, expiryDays) =>
    api.post('/share/generate-link', { fileId, expiryDays }),
  accessViaLink: (token) => api.get(`/share/access/${token}`),
  revokeShare: (shareId) => api.delete(`/share/revoke-share/${shareId}`),
  revokeLink: (linkId) => api.delete(`/share/revoke-link/${linkId}`),
  getFileShares: (fileId) => api.get(`/share/file-shares/${fileId}`),
};

export const auditAPI = {
  getMyAuditLog: () => api.get('/audit/my-audit-log'),
  getFileActivity: (fileId) => api.get(`/audit/file-activity/${fileId}`),
};

export default api;
