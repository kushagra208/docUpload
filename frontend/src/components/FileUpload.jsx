import React, { useState } from 'react';
import { fileAPI } from '../utils/api';
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Box,
  Alert as MuiAlert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Stack,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

export const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadMode, setUploadMode] = useState('single');

  const handleSingleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleMultipleFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSingleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fileAPI.uploadFile(formData);
      setMessage({ type: 'success', text: response.data.message });
      setFile(null);
      document.querySelector('input[type="file"]').value = '';
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one file' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      const response = await fileAPI.bulkUpload(formData);
      setMessage({ type: 'success', text: `${response.data.uploadedFiles.length} files uploaded` });
      setFiles([]);
      document.querySelector('input[multiple]').value = '';
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Bulk upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card sx={{ mb: 3, boxShadow: 3 }}>
      <CardHeader title="Upload Files" />
      <CardContent>
        <Stack spacing={3}>
          {message && (
            <MuiAlert
              severity={message.type}
              onClose={() => setMessage('')}
            >
              {message.text}
            </MuiAlert>
          )}

          <ToggleButtonGroup
            value={uploadMode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode !== null) setUploadMode(newMode);
            }}
            fullWidth
          >
            <ToggleButton value="single">Single Upload</ToggleButton>
            <ToggleButton value="bulk">Bulk Upload</ToggleButton>
          </ToggleButtonGroup>

          {uploadMode === 'single' ? (
            <Box component="form" onSubmit={handleSingleUpload} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                type="file"
                onChange={handleSingleFileChange}
                disabled={uploading}
                inputProps={{ accept: '*' }}
                fullWidth
                variant="outlined"
              />
              <Button
                type="submit"
                disabled={uploading || !file}
                variant="contained"
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleBulkUpload} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                type="file"
                onChange={handleMultipleFilesChange}
                disabled={uploading}
                inputProps={{ multiple: true, accept: '*' }}
                fullWidth
                variant="outlined"
              />
              {files.length > 0 && (
                <Typography variant="body2" color="textSecondary">
                  {files.length} files selected
                </Typography>
              )}
              <Button
                type="submit"
                disabled={uploading || files.length === 0}
                variant="contained"
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              >
                {uploading ? 'Uploading...' : 'Upload All'}
              </Button>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
