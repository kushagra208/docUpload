import React, { useState, useEffect } from 'react';
import { fileAPI, shareAPI } from '../utils/api';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert as MuiAlert,
  Stack,
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon, Share as ShareIcon, Delete as DeleteIcon, FileCopy as FileCopyIcon } from '@mui/icons-material';

export const FileList = ({ files, refresh }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUsers, setShareUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [role, setRole] = useState('viewer');
  const [expiryDays, setExpiryDays] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    // Fetch all users for sharing
    //  // Placeholder
  }, []);

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

  const handleDelete = async (fileId) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await fileAPI.deleteFile(fileId);
        setMessage({ type: 'success', text: 'File deleted successfully' });
        refresh();
      } catch (error) {
        setMessage({ type: 'error', text: 'Delete failed' });
      }
    }
  };

  const handleShareWithUser = async () => {
    if (!selectedUser) {
      setMessage({ type: 'error', text: 'Please select a user' });
      return;
    }

    setLoading(true);
    try {
    //   console.log('Sharing file', selectedFile, 'with user', selectedUser, 'as', role, 'expiring in', expiryDays, 'days');
      await shareAPI.shareWithUser(selectedFile.id, selectedUser, role, expiryDays ? parseInt(expiryDays) : null);
      setMessage({ type: 'success', text: 'File shared successfully' });
      setShowShareModal(false);
      setSelectedUser('');
      refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Share failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const response = await shareAPI.generateLink(selectedFile.id, expiryDays ? parseInt(expiryDays) : null);
      setShareLink(response.data.shareUrl);
      setMessage({ type: 'success', text: 'Share link generated' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Link generation failed' });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!files || files.length === 0) {
    return (
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="textSecondary">No files uploaded yet</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardContent>
        {message && (
          <MuiAlert
            severity={message.type}
            onClose={() => setMessage('')}
            sx={{ mb: 2 }}
          >
            {message.text}
          </MuiAlert>
        )}

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Filename</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Uploaded</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Shared</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id} hover>
                  <TableCell>{file.filename}</TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{new Date(file.uploadedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{file.sharedWith + file.sharedLinks} shares</TableCell>
                  <TableCell align="center" sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownload(file.id, file.filename)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => {
                          setSelectedFile(file);
                          setShowShareModal(true);
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(file.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {showShareModal && selectedFile && (
          <Dialog open={showShareModal} onClose={() => setShowShareModal(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Share: {selectedFile.filename}</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Share Type</InputLabel>
                  <Select
                    value={showLinkModal ? 'link' : 'user'}
                    label="Share Type"
                    onChange={(e) => setShowLinkModal(e.target.value === 'link')}
                  >
                    <MenuItem value="user">Share with User</MenuItem>
                    <MenuItem value="link">Generate Link</MenuItem>
                  </Select>
                </FormControl>

                {!showLinkModal ? (
                  <>
                    <TextField
                      label="User ID or Email"
                      placeholder="Enter user email"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      fullWidth
                    />
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={role}
                        label="Role"
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <MenuItem value="viewer">Viewer</MenuItem>
                        <MenuItem value="editor">Editor</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                ) : null}

                <TextField
                  type="number"
                  label="Expiry (days)"
                  placeholder="Leave empty for no expiry"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  fullWidth
                />

                {shareLink && (
                  <Box sx={{ backgroundColor: '#e8f5e9', p: 2, borderRadius: 1, borderLeft: '4px solid #4caf50' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Share Link:
                    </Typography>
                    <Typography variant="caption" sx={{ wordBreak: 'break-all', display: 'block', mb: 1 }}>
                      {shareLink}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<FileCopyIcon />}
                      onClick={() => navigator.clipboard.writeText(shareLink)}
                    >
                      Copy Link
                    </Button>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setShowShareModal(false);
                setSelectedUser('');
                setShareLink('');
                setExpiryDays('');
              }}>
                Close
              </Button>
              <Button
                onClick={showLinkModal ? handleGenerateLink : handleShareWithUser}
                disabled={loading}
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Processing...' : showLinkModal ? 'Generate Link' : 'Share'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default FileList;
