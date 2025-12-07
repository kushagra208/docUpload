import React, { useState, useEffect } from 'react';
import { fileAPI } from '../utils/api';
import {
  Container,
  Typography,
  Box,
  Alert as MuiAlert,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

export const SharedWithMe = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSharedFiles();
  }, []);

  const fetchSharedFiles = async () => {
    try {
      setLoading(true);
      const response = await fileAPI.getSharedWithMe();
      setFiles(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load shared files' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await fileAPI.downloadFile(fileId);
      // Open Cloudinary URL directly in new tab for download
      const link = document.createElement('a');
      link.href = response.data.fileUrl;
      link.setAttribute('download', response.data.filename);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.log(error);
      setMessage({ type: 'error', text: 'Download failed' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 4 }}>
        Files Shared With Me
      </Typography>

      {message && (
        <MuiAlert
          severity={message.type}
          onClose={() => setMessage('')}
          sx={{ mb: 3 }}
        >
          {message.text}
        </MuiAlert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : files.length === 0 ? (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="textSecondary">No files shared with you yet</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Filename</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Shared By</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Expiry</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.shareId} hover>
                      <TableCell>{file.file.filename}</TableCell>
                      <TableCell>{formatFileSize(file.file.size)}</TableCell>
                      <TableCell>{file.sharedBy}</TableCell>
                      <TableCell>{file.role}</TableCell>
                      <TableCell>
                        {file.expiryDate ? new Date(file.expiryDate).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleDownload(file.file.id, file.file.filename)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default SharedWithMe;
