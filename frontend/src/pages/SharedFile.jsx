import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { shareAPI, fileAPI } from '../utils/api';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert as MuiAlert,
  Box,
  Stack,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

export const SharedFile = () => {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        setLoading(true);
        console.log('Accessing shared file with token:', token);
        const response = await shareAPI.accessViaLink(token);
        setFile(response.data.file);
        setMessage({ type: 'success', text: 'File access granted' });
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.response?.data?.error || 'Unable to access this file. Link may be invalid or expired.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedFile();
    }
  }, [token]);

  const handleDownload = async () => {
    if (!file) return;
    try {
      setDownloading(true);
      const response = await fileAPI.downloadFile(file.id);
      // Open Cloudinary URL directly in new tab for download
      const link = document.createElement('a');
      link.href = response.data.fileUrl;
      link.setAttribute('download', response.data.filename);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setMessage({ type: 'success', text: 'Download started' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Download failed' });
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            Shared File Access
          </Typography>

          {message && (
            <MuiAlert severity={message.type} onClose={() => setMessage('')} sx={{ mb: 3 }}>
              {message.text}
            </MuiAlert>
          )}

          {file ? (
            <Stack spacing={3}>
              <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Filename
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {file.filename}
                </Typography>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  File Details
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Size:</strong> {formatFileSize(file.size)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {file.fileType}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Uploaded:</strong> {new Date(file.uploadedAt).toLocaleString()}
                  </Typography>
                </Stack>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleDownload}
                disabled={downloading}
                startIcon={downloading ? <CircularProgress size={20} /> : <DownloadIcon />}
              >
                {downloading ? 'Downloading...' : 'Download File'}
              </Button>

              <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center' }}>
                This is a shared file. Please note that access to this file may be time-limited.
              </Typography>
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="error" variant="body1">
                Unable to load the shared file. Please check the link and try again.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default SharedFile;
