import React, { useState, useEffect } from 'react';
import { auditAPI } from '../utils/api';
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
  Chip,
} from '@mui/material';

export const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const fetchAuditLog = async () => {
    try {
      setLoading(true);
      const response = await auditAPI.getMyAuditLog();
      setLogs(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load audit log' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 4 }}>
        Activity Log
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
      ) : logs.length === 0 ? (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="textSecondary">No activity yet</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>File</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{log.filename}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        {JSON.stringify(log.details).substring(0, 50)}...
                      </TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
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

export default AuditLog;
