import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import { fileAPI } from '../utils/api';
import {
  Container,
  Typography,
  Box,
  Alert as MuiAlert,
  CircularProgress,
  Stack,
} from '@mui/material';

export const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fileAPI.getMyFiles();
      setFiles(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load files' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 4 }}>
        My Dashboard
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

      <FileUpload onUploadSuccess={fetchFiles} />

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          My Files
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <FileList files={files} refresh={fetchFiles} />
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
